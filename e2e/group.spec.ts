import { test, expect, psql, getRunId, E2E_EMAIL_A, E2E_EMAIL_B, login, pickSafeTimezone } from "./fixtures";

/**
 * v3.0 多人项目 E2E：
 * 1. 创建 → 直达邀请 → 邀请 → 对方接受 → 双账号打卡 → 团队 streak →
 *    首页卡片多人徽章 → 结算（迟到成员不追溯）
 * 2. all 模式截止后接受 → 当日 1/1（义务化分母）
 * 项目名含 run_id（teardown 精确回收）；B 走独立浏览器上下文与登录
 */

test("多人项目：创建直达邀请 → 接受 → 双账号打卡 → 团队 streak", async ({
  pageA,
  browser,
}) => {
  // 实测 54.6-64.7s（双账号多段导航 + psql 走云端），超出全局 60s 预算，单列 120s
  test.setTimeout(120_000);
  const projName = `${getRunId()}-多人`;

  // ---- A 创建多人项目（任意一人模式）----
  await pageA.goto("/create-project");
  await pageA.getByPlaceholder("项目名称（1-30 字）").fill(projName);
  await pageA.getByRole("button", { name: /多人项目/ }).click();
  await pageA.getByRole("button", { name: /任意一人/ }).click();
  await pageA.getByPlaceholder("团队奖励池，如：5").fill("5");
  await pageA.getByPlaceholder("惩罚金额（默认 0）").fill("0");
  await pageA.getByRole("button", { name: "创建项目" }).click();

  // 创建成功直达详情页（邀请入口立即可达）
  await pageA.waitForURL(/\/projects\//, { timeout: 20_000 });
  const projectId = pageA.url().split("/").pop()!;
  expect(projectId).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
  );
  await expect(pageA.getByText("👥 多人项目")).toBeVisible();
  await expect(
    pageA.getByRole("button", { name: "邀请", exact: true }),
  ).toBeVisible();

  // ---- A 邀请 B（好友列表唯一行）----
  await pageA.getByRole("button", { name: "邀请", exact: true }).click();
  const sheet = pageA.getByRole("dialog");
  await expect(sheet).toBeVisible();
  await sheet.getByRole("button", { name: "邀请", exact: true }).first().click();
  // 云端邀请 RPC 延迟偶超默认 5s（2026-09-30/10-08 两次观测），放宽等待
  await expect(sheet.getByText("已邀请").first()).toBeVisible({ timeout: 15_000 });
  await sheet.getByRole("button", { name: "关闭" }).click();

  // 成员面板：owner + B（待接受）
  await expect(pageA.getByText("成员 2/10")).toBeVisible();
  await expect(pageA.getByText("待接受邀请")).toBeVisible();

  // ---- 边界归一化：项目激活到恒可打卡窗口（安全时区避开截止边界）----
  const tz = pickSafeTimezone();
  psql(`
begin;
set session_replication_role = replica;
update public.checkin_projects cp
set timezone = '${tz}',
    starts_at = (now() at time zone '${tz}')::date,
    status = 'active'
where cp.id = '${projectId}';
set session_replication_role = default;
commit;
`);
  await pageA.reload();
  await expect(pageA.getByRole("button", { name: /打卡/ })).toBeVisible();

  // ---- B 登录 → 首页横幅接受邀请（接受时点在安全窗口内 = 当日有义务）----
  const ctxB = await browser.newContext();
  const pageB = await ctxB.newPage();
  await login(pageB, E2E_EMAIL_B);
  const banner = pageB.getByLabel("项目邀请");
  await expect(banner).toBeVisible({ timeout: 15_000 });
  await expect(banner.getByText(`「${projName}」邀请你加入`)).toBeVisible();
  // 10.17.3 隐私告知常显
  await expect(banner.getByText(/团队整体余额榜/)).toBeVisible();
  await banner
    .getByRole("button", { name: `接受加入 ${projName}` })
    .click();
  // 接受成功：邀请不再返回 → 横幅消失；项目卡出现在 B 的今日列表
  await expect(banner).toBeHidden({ timeout: 15_000 });
  const cardB = pageB
    .getByRole("link", { name: new RegExp(projName) })
    .first();
  await expect(cardB).toBeVisible({ timeout: 15_000 });

  // ---- A 先打卡（owner 单干时刻）----
  await pageA.getByRole("button", { name: /打卡/ }).click();
  await expect(pageA.getByText("今日已打卡")).toBeVisible({ timeout: 15_000 });
  await expect(pageA.getByText(/团队连续 [1-9]\d* 天/)).toBeVisible();
  await expect(pageA.getByText("今日 1/2 人已打卡")).toBeVisible();

  // ---- B 进入项目并打卡 → 双人闭环 ----
  await cardB.click();
  await pageB.waitForURL(/\/projects\//, { timeout: 15_000 });
  await pageB.getByRole("button", { name: /打卡/ }).click();
  await expect(pageB.getByText("今日已打卡")).toBeVisible({ timeout: 15_000 });
  await ctxB.close().catch(() => {});

  // ---- A 视角复核：B 行已打卡 + 今日 2/2 ----
  await pageA.reload();
  await expect(pageA.getByText(/已打卡 \d{2}:\d{2}/).first()).toBeVisible();
  await expect(pageA.getByText("今日 2/2 人已打卡")).toBeVisible();

  // ---- A 首页卡片多人徽章（00070 扩列）----
  await pageA.goto("/");
  const card = pageA.getByRole("link", { name: new RegExp(projName) }).first();
  await expect(card).toBeVisible();
  await expect(card.getByText(/👥 2 人 · 今日 2\/2 人已打卡/)).toBeVisible();

  // ---- 结算（00071）：昨日义务成员仅 A（B 今天才接受）→ A 独得 5 ----
  // B 今天才接受（义务起点=今天），昨日的义务成员只有 A → 需插 A 的昨日卡
  psql(`
begin;
set session_replication_role = replica;
update public.checkin_projects cp
set starts_at = (now() at time zone '${tz}')::date - 1
where cp.id = '${projectId}';
insert into public.checkin_records (project_id, user_id, checkin_date, status)
select '${projectId}', u.id, ((now() at time zone '${tz}')::date - 1)::date, 'active'
from auth.users u where u.email = '${E2E_EMAIL_A}';
set session_replication_role = default;
commit;
`);
  // cron 每分钟各跑一次，E2E 按生产顺序直接触发一轮：
  // 生成（含水位回填）→ 裁定 → 结算
  psql(`
    select public.cron_generate_today_occurrences();
    select public.cron_process_missed_occurrences();
    select public.cron_settle_group_rewards();
  `);
  await pageA.goto(`/projects/${projectId}`);
  // 池 5 ÷ 昨日义务成员 1 人 = 5（余 0）；迟到成员 B 不分昨日奖励
  await expect(
    pageA.getByText(/我已累计分得 5 🪙（1 次）/),
  ).toBeVisible();
});

/**
 * all 模式"当日截止后接受"：B 接受后把 joined_at 置为当日 23:59:30
 * （截止 23:59 之后，义务起点=次日），并删除其当日 occurrence（接受到
 * 改写之间生成器可能已生成，残留会让 all 模式当日永不完额）。
 * 奖励池填 0（合法池值），顺带覆盖详情页 0 池团队口径展示。
 */
test("多人项目：all 模式截止后接受 → 当日 1/1（义务化分母）", async ({
  pageA,
  browser,
}) => {
  const projName = `${getRunId()}-多人all`;

  // ---- A 创建多人项目（全员完成模式，0 奖励池）----
  await pageA.goto("/create-project");
  await pageA.getByPlaceholder("项目名称（1-30 字）").fill(projName);
  await pageA.getByRole("button", { name: /多人项目/ }).click();
  await pageA.getByRole("button", { name: "全员完成才算打卡" }).click();
  await pageA.getByPlaceholder("团队奖励池，如：5").fill("0");
  await pageA.getByPlaceholder("惩罚金额（默认 0）").fill("0");
  await pageA.getByRole("button", { name: "创建项目" }).click();
  await pageA.waitForURL(/\/projects\//, { timeout: 20_000 });
  const projectId = pageA.url().split("/").pop()!;
  await expect(pageA.getByText("👥 多人项目")).toBeVisible();

  // ---- A 邀请 B ----
  await pageA.getByRole("button", { name: "邀请", exact: true }).click();
  const sheet = pageA.getByRole("dialog");
  await expect(sheet).toBeVisible();
  await sheet.getByRole("button", { name: "邀请", exact: true }).first().click();
  // 云端邀请 RPC 延迟偶超默认 5s（2026-09-30/10-08 两次观测），放宽等待
  await expect(sheet.getByText("已邀请").first()).toBeVisible({ timeout: 15_000 });
  await sheet.getByRole("button", { name: "关闭" }).click();
  await expect(pageA.getByText("成员 2/10")).toBeVisible();

  // ---- 边界归一化：项目激活到恒可打卡窗口 ----
  const tz = pickSafeTimezone();
  psql(`
    begin;
    set session_replication_role = replica;
    update public.checkin_projects cp
    set timezone = '${tz}',
        starts_at = (now() at time zone '${tz}')::date,
        status = 'active'
    where cp.id = '${projectId}';
    set session_replication_role = default;
    commit;
  `);
  await pageA.reload();
  await expect(pageA.getByRole("button", { name: /打卡/ })).toBeVisible();
  await expect(pageA.getByText("全员完成才算打卡")).toBeVisible();
  // 0 池为合法团队池值，奖励规则卡按团队口径展示
  await expect(pageA.getByText("每次完成结算（团队平分）")).toBeVisible();

  // ---- B 接受邀请（真实 UI 链路）----
  const ctxB = await browser.newContext();
  const pageB = await ctxB.newPage();
  await login(pageB, E2E_EMAIL_B);
  const banner = pageB.getByLabel("项目邀请");
  await expect(banner).toBeVisible({ timeout: 15_000 });
  await banner
    .getByRole("button", { name: `接受加入 ${projName}` })
    .click();
  await expect(banner).toBeHidden({ timeout: 15_000 });
  await ctxB.close().catch(() => {});

  // ---- 模拟"当日截止后接受"：joined_at → 当日 23:59:30，并清当日 occurrence ----
  psql(`
    begin;
    set session_replication_role = replica;
    update public.project_members pm
    set joined_at = (((now() at time zone '${tz}')::date::text
                      || ' 23:59:30')::timestamp) at time zone '${tz}'
    from auth.users u
    where pm.project_id = '${projectId}'
      and pm.user_id = u.id
      and u.email = '${E2E_EMAIL_B}';
    delete from public.checkin_occurrences
    where project_id = '${projectId}'
      and user_id = (select id from auth.users where email = '${E2E_EMAIL_B}')
      and checkin_date = (now() at time zone '${tz}')::date;
    set session_replication_role = default;
    commit;
  `);

  // ---- A 打卡（owner 当日唯一义务成员）→ 当日 1/1 ----
  await pageA.getByRole("button", { name: /打卡/ }).click();
  await expect(pageA.getByText("今日已打卡")).toBeVisible({ timeout: 15_000 });
  await expect(pageA.getByText("今日 1/1 人已打卡")).toBeVisible();
  // all 模式义务集合={owner}，owner 单人完成 → 团队连续 ≥1
  await expect(pageA.getByText(/团队连续 [1-9]\d* 天/)).toBeVisible();
});

/**
 * 批次 3：多人×有限次 × lifetime 预算全链路。
 * 表单创建（任意一人 / 有限次 target2 / 预算 8 / 池 5）→ 邀请 B 接受
 * （B 今日加入 → 过去日义务成员仅 A）→ 种 A 的 D-2/D-1 完成日 →
 * 一轮生产顺序 cron → 两轮结算 5+3（预算缩减）→ 达标归档 + waived。
 */
test("多人有限次×预算：缩减结算 → 达标归档 → 已完成展示", async ({
  pageA,
  browser,
}) => {
  // 创建+邀请+接受+详情复核多段导航（云端往返），单列 180s
  test.setTimeout(180_000);
  const projName = `${getRunId()}-团队有限次`;

  // ---- 表单：多人 + 任意一人 + 有限次 target2 + 预算 8 + 池 5 ----
  await pageA.goto("/create-project");
  await pageA.getByPlaceholder("项目名称（1-30 字）").fill(projName);
  await pageA.getByRole("button", { name: /多人项目/ }).click();
  await pageA.getByRole("button", { name: /任意一人/ }).click();
  await pageA.getByRole("button", { name: "有限次任务" }).click();
  await pageA.getByPlaceholder("目标次数，如：30").fill("2");
  await pageA.getByPlaceholder("奖励池总预算，如：8（可选）").fill("8");
  await pageA.getByPlaceholder("团队奖励池，如：5").fill("5");
  await pageA.getByPlaceholder("惩罚金额（默认 0）").fill("0");
  await pageA.getByRole("button", { name: "创建项目" }).click();
  await pageA.waitForURL(/\/projects\//, { timeout: 20_000 });
  const projectId = pageA.url().split("/").pop()!;

  // ---- 邀请 B ----
  await expect(pageA.getByText("👥 多人项目")).toBeVisible();
  await pageA.getByRole("button", { name: "邀请", exact: true }).click();
  const sheet = pageA.getByRole("dialog");
  await expect(sheet).toBeVisible();
  await sheet.getByRole("button", { name: "邀请", exact: true }).first().click();
  // 云端邀请 RPC 延迟偶超默认 5s（2026-09-30/10-08 两次观测），放宽等待
  await expect(sheet.getByText("已邀请").first()).toBeVisible({ timeout: 15_000 });
  await sheet.getByRole("button", { name: "关闭" }).click();
  await expect(pageA.getByText("成员 2/10")).toBeVisible();

  // ---- 边界归一化：激活到 starts_at = D-2 ----
  const tz = pickSafeTimezone();
  psql(`
begin;
set session_replication_role = replica;
update public.checkin_projects cp
set timezone = '${tz}',
    starts_at = ((now() at time zone '${tz}')::date - 2),
    status = 'active'
where cp.id = '${projectId}';
set session_replication_role = default;
commit;
`);

  // ---- B 登录接受邀请（今日加入 → 过去日义务成员仅 A）----
  const ctxB = await browser.newContext();
  const pageB = await ctxB.newPage();
  await login(pageB, E2E_EMAIL_B);
  const banner = pageB.getByLabel("项目邀请");
  await expect(banner).toBeVisible({ timeout: 15_000 });
  await banner
    .getByRole("button", { name: `接受加入 ${projName}` })
    .click();
  await expect(banner).toBeHidden({ timeout: 15_000 });
  await ctxB.close().catch(() => {});

  // ---- 种 A 的 D-2/D-1 完成日（occurrence checked 已过截止 + record）----
  psql(`
begin;
set session_replication_role = replica;
insert into public.checkin_occurrences (
  project_id, user_id, period_start, period_end, checkin_date, deadline_at, status
)
select '${projectId}', u.uid,
  ((d::text || ' 00:00')::timestamp) at time zone '${tz}',
  ((d::text || ' 12:00')::timestamp) at time zone '${tz}',
  d,
  ((d::text || ' 12:00')::timestamp) at time zone '${tz}',
  'checked'
from (values (
  ((now() at time zone '${tz}')::date - 2)
), (
  ((now() at time zone '${tz}')::date - 1)
)) t(d)
cross join (select id from auth.users where email = '${E2E_EMAIL_A}') u(uid);
insert into public.checkin_records (
  project_id, user_id, checkin_date, checked_at, attempt_no, status,
  reward_earned, reward_mode_snapshot
)
select '${projectId}', u.uid, d,
  ((d::text || ' 08:00')::timestamp) at time zone '${tz}',
  1, 'active', 0, 'every_time'
from (values (
  ((now() at time zone '${tz}')::date - 2)
), (
  ((now() at time zone '${tz}')::date - 1)
)) t(d)
cross join (select id from auth.users where email = '${E2E_EMAIL_A}') u(uid);
set session_replication_role = default;
commit;
`);

  // ---- 一轮生产顺序 cron：generate（今日义务）→ process → settle ----
  psql(`
    select public.cron_generate_today_occurrences();
    select public.cron_process_missed_occurrences();
    select public.cron_settle_group_rewards();
  `);

  // ---- 结算断言（DB）：两轮 5+3，A 独得 8（B 迟到不追溯）----
  expect(
    psql(`select string_agg(total_pool::text, ',' order by settlement_round)
          from public.reward_settlements where project_id = '${projectId}';`),
  ).toBe("5,3");
  expect(
    psql(`select coalesce(sum(amount), 0) from public.transactions
          where related_project_id = '${projectId}'
            and user_id = (select id from auth.users where email = '${E2E_EMAIL_A}')
            and transaction_type = 'reward';`),
  ).toBe("8");

  // ---- 详情：已完成 + 进度 + 预算展示 + 按钮结束态 ----
  await pageA.goto(`/projects/${projectId}`);
  await expect(pageA.getByText("✅ 已完成")).toBeVisible();
  await expect(pageA.getByText("🎯 2/2 次")).toBeVisible();
  await expect(pageA.getByText(/我已累计分得 8 🪙（2 次）/)).toBeVisible();
  await expect(pageA.getByText(/总预算 8 🪙 · 已发放 8 🪙/)).toBeVisible();
  await expect(pageA.getByText("项目已结束")).toBeVisible();

  // ---- 首页：已完成分区（group 口径，批次 3 扩）----
  await pageA.goto("/");
  const finishedSection = pageA.getByRole("region", { name: "已完成的项目" });
  await expect(finishedSection).toBeVisible();
  await expect(finishedSection.getByRole("link", { name: projName })).toBeVisible();
  await expect(finishedSection.getByText("🎯 有限次任务 · 2/2 次")).toBeVisible();
});

/**
 * 批次 3 表单负向：目标/预算输入仅 多人×有限次 展开；个人无预算输入。
 * （RPC 数值边界 0/负/1000 由 smoke8 S1 覆盖；actions 预算分支的
 *  端到端负向见下一用例）
 */
test("表单负向：预算输入仅多人有限次可见", async ({ pageA }) => {
  await pageA.goto("/create-project");

  // 多人 + 无限次（默认）：目标与预算输入均不出现
  await pageA.getByRole("button", { name: /多人项目/ }).click();
  await expect(pageA.getByRole("button", { name: "有限次任务" })).toBeVisible();
  await expect(pageA.getByPlaceholder("目标次数，如：30")).toHaveCount(0);
  await expect(pageA.getByPlaceholder("奖励池总预算，如：8（可选）")).toHaveCount(0);

  // 切有限次：两输入出现
  await pageA.getByRole("button", { name: "有限次任务" }).click();
  await expect(pageA.getByPlaceholder("目标次数，如：30")).toBeVisible();
  await expect(pageA.getByPlaceholder("奖励池总预算，如：8（可选）")).toBeVisible();

  // 切个人（任务类型卡保留，finite 展开 target）：预算输入消失
  await pageA.getByRole("button", { name: /个人项目/ }).click();
  await expect(pageA.getByPlaceholder("目标次数，如：30")).toBeVisible();
  await expect(pageA.getByPlaceholder("奖励池总预算，如：8（可选）")).toHaveCount(0);
});

/**
 * 批次 3 复审 P3-6：actions.ts 预算校验分支的端到端负向覆盖。
 * 绕过浏览器原生 min/max/step（预算输入未渲染时注入隐藏键；已渲染时
 * 填值 + form.noValidate），让非法值真正到达 server action，断言红字
 * 与 DB 零新建。分支恰好各覆盖一次：personal 携带 budget / 多人×无限次
 * 携带 budget / 多人×有限次非整数 / 越界 >999 / 越界 <1。
 * dev 重放对负向无影响（action 拒绝即返回、不写库不 revalidate），
 * 断言以 DB 权威状态为准。
 */
test("表单负向：非法预算绕过原生校验被 actions 拒", async ({ pageA }) => {
  test.setTimeout(90_000);
  const projName = `${getRunId()}-预算负向`;

  // 一次性构造非法预算提交（每次新开表单，避免上次错误文案/注入节点残留）
  async function submitIllegalBudget(
    budget: string,
    opts: { group: boolean; finite: boolean },
  ) {
    await pageA.goto("/create-project");
    await pageA.getByPlaceholder("项目名称（1-30 字）").fill(projName);
    await pageA.getByPlaceholder("奖励金额，如：5").fill("5");
    await pageA.getByPlaceholder("惩罚金额（默认 0）").fill("0");
    if (opts.group) {
      await pageA.getByRole("button", { name: /多人项目/ }).click();
      await pageA.getByRole("button", { name: "任意一人" }).click();
    }
    if (opts.finite) {
      await pageA.getByRole("button", { name: "有限次任务" }).click();
      await pageA.getByPlaceholder("目标次数，如：30").fill("3");
      // 原生 min/max/step 先行拦截非法值，须绕过后才能到达 action
      await pageA.evaluate(() => {
        (document.querySelector("form") as HTMLFormElement).noValidate = true;
      });
      await pageA.getByPlaceholder("奖励池总预算，如：8（可选）").fill(budget);
    } else {
      // 预算输入未渲染（个人 / 多人无限次）：注入隐藏键携带 budget
      await pageA.evaluate((v) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "budgetAmount";
        input.value = v as string;
        document.querySelector("form")!.appendChild(input);
      }, budget);
    }
    await pageA.getByRole("button", { name: "创建项目" }).click();
    await expect(
      pageA.getByText("奖励池总预算需为 1-999 的整数（仅多人有限次项目可填）"),
    ).toBeVisible({ timeout: 15_000 });
  }

  // personal 携带 budget（矩阵：仅多人）
  await submitIllegalBudget("50", { group: false, finite: false });
  // 多人×无限次携带 budget（矩阵：仅有限次）
  await submitIllegalBudget("50", { group: true, finite: false });
  // 多人×有限次：非整数（格式）/ >999 / <1（越界）
  await submitIllegalBudget("12.5", { group: true, finite: true });
  await submitIllegalBudget("1000", { group: true, finite: true });
  await submitIllegalBudget("0", { group: true, finite: true });

  // DB 权威：五次非法提交零新建
  expect(
    psql(`select count(*) from public.checkin_projects where name = '${projName}';`),
  ).toBe("0");
});
