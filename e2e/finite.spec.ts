import {
  test,
  expect,
  psql,
  getRunId,
  E2E_EMAIL_A,
  E2E_EMAIL_B,
  login,
  pickSafeTimezone,
} from "./fixtures";

/**
 * 有限次个人任务 E2E：创建（目标 2）→ 打卡 1/2 → 截止回拨 + 昨日待裁 →
 * processor 归档 → 详情"已完成"徽章 + 首页"已完成"分区。
 * 项目名含 run_id（teardown 精确回收）。
 */
test("有限次任务：打卡进度 → 达标归档 → 已完成展示", async ({
  pageA,
  browser,
}) => {
  // 用例经收口三/四两轮扩充后实测 50-70s（4 次导航 + 3 段 psql 走云端），
  // 超出全局 60s 预算，单列 120s
  test.setTimeout(120_000);
  const projName = `${getRunId()}-有限次`;
  const tz = pickSafeTimezone();

  // ---- 创建有限次个人项目（目标 2）----
  await pageA.goto("/create-project");
  await pageA.getByPlaceholder("项目名称（1-30 字）").fill(projName);
  await pageA.getByRole("button", { name: "有限次任务" }).click();
  await pageA.getByPlaceholder("目标次数，如：30").fill("2");
  // 奖励 0：打卡按钮保持"打卡"精确名（>0 时可访问名为"打卡 +N"）
  await pageA.getByPlaceholder("奖励金额，如：5").fill("0");
  await pageA.getByPlaceholder("惩罚金额（默认 0）").fill("0");
  await pageA.getByRole("button", { name: "创建项目" }).click();
  await pageA.waitForURL("http://localhost:3100/", { timeout: 20_000 });

  const card = pageA.getByRole("link", { name: projName }).first();
  await expect(card).toBeVisible();
  const href = await card.getAttribute("href");
  const projectId = href!.split("/").pop()!;

  // ---- 归一化激活（今日恒可打卡窗口）----
  psql(`
    begin;
    set session_replication_role = replica;
    update public.checkin_projects cp
    set timezone = '${tz}', starts_at = (now() at time zone '${tz}')::date,
        status = 'active'
    where cp.id = '${projectId}';
    set session_replication_role = default;
    commit;
  `);

  // ---- 今日打卡 → 详情进度 1/2 ----
  await pageA.goto(`/projects/${projectId}`);
  const checkinBtn = pageA.getByRole("button", { name: "打卡", exact: true });
  await expect(checkinBtn).toBeVisible({ timeout: 10_000 });
  await checkinBtn.click();
  await expect(pageA.getByText("今日已打卡")).toBeVisible({ timeout: 15_000 });
  await expect(pageA.getByText("🎯 1/2 次")).toBeVisible();

  // ---- 回拨截止 + 回溯开始日 + 昨日 pending occurrence（待裁定）----
  psql(`
    begin;
    set session_replication_role = replica;
    update public.checkin_projects cp
    set deadline_time = (((now() at time zone '${tz}')::time - interval '5 minutes')::time),
        starts_at = ((now() at time zone '${tz}')::date - 1)
    where cp.id = '${projectId}';
    update public.checkin_occurrences co
    set deadline_at = ((((now() at time zone '${tz}')::date::text || ' ' ||
        (select deadline_time::text from public.checkin_projects where id = '${projectId}')
      )::timestamp) at time zone '${tz}')
    where co.project_id = '${projectId}' and co.checkin_date = ((now() at time zone '${tz}')::date);
    insert into public.checkin_occurrences (
      project_id, user_id, period_start, period_end,
      checkin_date, deadline_at, status
    )
    select '${projectId}', u.id,
      ((((now() at time zone '${tz}')::date - 1)::text || ' 00:00')::timestamp) at time zone '${tz}',
      ((((now() at time zone '${tz}')::date - 1)::text || ' ' ||
        (select deadline_time::text from public.checkin_projects where id = '${projectId}')
      )::timestamp) at time zone '${tz}',
      ((now() at time zone '${tz}')::date - 1),
      ((((now() at time zone '${tz}')::date - 1)::text || ' ' ||
        (select deadline_time::text from public.checkin_projects where id = '${projectId}')
      )::timestamp) at time zone '${tz}',
      'pending'
    from auth.users u where u.email = '${E2E_EMAIL_A}'
    on conflict do nothing;
    set session_replication_role = default;
    commit;
  `);

  // ---- 真实 processor：昨日自动补卡（默认额度 3）→ 今日已 checked 且截止已过
  //      → progress=2 → archived ----
  psql(`select public.cron_process_missed_occurrences();`);

  // ---- 详情：已完成徽章 + 2/2 ----
  await pageA.goto(`/projects/${projectId}`);
  await expect(pageA.getByText("✅ 已完成")).toBeVisible();
  await expect(pageA.getByText("🎯 2/2 次")).toBeVisible();
  // 归档后无打卡按钮
  await expect(
    pageA.getByRole("button", { name: "打卡", exact: true }),
  ).toBeHidden();

  // ---- 首页：已完成分区保留展示；不落首次空态（P1-3）----
  // 判别力前提（评审 P2-2）：先隔离夹具预置的 active 团队项目
  // （软删即退出 summary；teardown 按显式 id 回收不受影响）并给 A
  // 一个特异余额——否则 totalToday 恒 ≥1，空态断言恒过无判别力
  psql(`
    begin;
    set session_replication_role = replica;
    update public.checkin_projects set deleted_at = now()
    where name = '${getRunId()}-团队';
    update public.profiles p set wallet_balance = 137
    from auth.users u where u.id = p.id and u.email = '${E2E_EMAIL_A}';
    set session_replication_role = default;
    commit;
  `);
  await pageA.goto("/");
  // Header 始终展示真实余额（空态不得改写业务数值，评审 P1-2）
  await expect(
    pageA
      .getByRole("link", { name: "查看小荷包" })
      .getByText("137", { exact: true }),
  ).toBeVisible();
  const section = pageA.getByRole("region", { name: "已完成的项目" });
  await expect(section).toBeVisible();
  await expect(section.getByRole("link", { name: projName })).toBeVisible();
  await expect(section.getByText("🎯 有限次任务 · 2/2 次")).toBeVisible();
  // 今日无待打卡 + 已无任何 active 项目：不渲染首次空态
  // （文案口径：暂无进行中的项目 / 创建新项目）
  await expect(pageA.getByText("暂无进行中的项目")).toBeHidden();
  await expect(pageA.getByText("创建新项目")).toBeHidden();

  // ---- 他人项目负向：B 看不到 A 的已完成项目（即使设为 public，P2-2）----
  psql(`
    begin;
    set session_replication_role = replica;
    update public.checkin_projects set visibility = 'public'
    where id = '${projectId}';
    set session_replication_role = default;
    commit;
  `);
  const ctxB = await browser.newContext();
  const pageB = await ctxB.newPage();
  await login(pageB, E2E_EMAIL_B);
  const sectionB = pageB.getByRole("region", { name: "已完成的项目" });
  await expect(sectionB.getByRole("link", { name: projName })).toBeHidden();
  await ctxB.close().catch(() => {});

  // ---- 待开始个人项目可见（评审 P1-3）：截止后创建的 personal 落
  //      pending，首页必须有入口且不落空态 ----
  const pendingName = `${getRunId()}-待开始`;
  psql(`
    begin;
    set session_replication_role = replica;
    insert into public.checkin_projects (
      id, owner_id, name, project_type, task_type, frequency,
      reward_mode, reward_amount, penalty_amount,
      makeup_type, makeup_count, makeup_reward_mode,
      timezone, deadline_time, starts_at, status, visibility,
      reward_remainder_recipient_id
    )
    select gen_random_uuid(), u.id, '${pendingName}', 'personal', 'infinite', 'daily',
      'every_time', 0, 0, 'independent', 3, 'none',
      'Asia/Shanghai', '23:59', current_date + 1, 'pending', 'private', u.id
    from auth.users u where u.email = '${E2E_EMAIL_A}';
    set session_replication_role = default;
    commit;
  `);
  await pageA.goto("/");
  const pendingSection = pageA.getByRole("region", { name: "待开始的项目" });
  await expect(pendingSection).toBeVisible();
  await expect(
    pendingSection.getByRole("link", { name: pendingName }),
  ).toBeVisible();
  await expect(pendingSection.getByText("📝 个人项目")).toBeVisible();
  await expect(pageA.getByText("暂无进行中的项目")).toBeHidden();
});

test("空态首页：真实余额不被改写（评审 P1-2/P2-2 判别补齐）", async ({
  pageA,
}) => {
  // 构造真 EMPTY：隔离夹具预置团队项目后 active/pending/finished/邀请
  // 全空；余额非零——旧实现（isEmpty → 硬编码"0 金币"）在此必失败
  psql(`
    begin;
    set session_replication_role = replica;
    update public.checkin_projects set deleted_at = now()
    where name = '${getRunId()}-团队';
    update public.profiles p set wallet_balance = 137
    from auth.users u where u.id = p.id and u.email = '${E2E_EMAIL_A}';
    set session_replication_role = default;
    commit;
  `);

  await pageA.goto("/");

  // 空态渲染（文案只陈述可判定事实，P3-4）
  await expect(pageA.getByText("暂无进行中的项目")).toBeVisible();
  await expect(pageA.getByText("创建新项目")).toBeVisible();
  // Header 展示真实余额，绝不改写为 0
  await expect(
    pageA
      .getByRole("link", { name: "查看小荷包" })
      .getByText("137", { exact: true }),
  ).toBeVisible();
  await expect(pageA.getByText("0 金币")).toBeHidden();
});

test("取消项目：owner 确认后软删退场", async ({ pageA }) => {
  test.setTimeout(120_000);
  const projName = `${getRunId()}-取消`;

  // UI 创建个人项目（今日开始 → active）
  await pageA.goto("/create-project");
  await pageA.getByPlaceholder("项目名称（1-30 字）").fill(projName);
  await pageA.getByPlaceholder("奖励金额，如：5").fill("3");
  await pageA.getByPlaceholder("惩罚金额（默认 0）").fill("0");
  await pageA.getByRole("button", { name: "创建项目" }).click();
  await pageA.waitForURL("http://localhost:3100/", { timeout: 20_000 });

  const card = pageA.getByRole("link", { name: projName }).first();
  await expect(card).toBeVisible();
  const projectId = (await card.getAttribute("href"))!.split("/").pop()!;

  // 详情底部 owner 取消入口（active 项目可见）
  await pageA.goto(`/projects/${projectId}`);
  const cancelBtn = pageA.getByRole("button", { name: "取消项目" });
  await expect(cancelBtn).toBeVisible();
  // 补卡余量 chip 同页可见（额度 3 未使用）
  await expect(pageA.getByText("补卡 3/3")).toBeVisible();

  // confirm 接受 → action redirect 首页
  pageA.once("dialog", (dialog) => dialog.accept());
  await cancelBtn.click();
  await pageA.waitForURL("http://localhost:3100/", { timeout: 20_000 });

  // 首页各分区不再出现；DB 软删
  await expect(
    pageA.getByRole("link", { name: projName }),
  ).toHaveCount(0);
  expect(
    psql(`select count(*) from public.checkin_projects
          where id = '${projectId}' and status = 'cancelled'
            and deleted_at is not null;`),
  ).toBe("1");
});
