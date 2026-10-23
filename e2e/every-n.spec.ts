import {
  test,
  expect,
  psql,
  getRunId,
  E2E_EMAIL_A,
  pickSafeTimezone,
} from "./fixtures";

/**
 * 批次 2 E2E：every_n 里程碑 / completed 完成奖 / 撤销重发 / 月历 waived。
 * 项目名含 run_id（teardown 精确回收）。
 */

function walletBalance(): string {
  return psql(`
    select coalesce(p.wallet_balance, -1) from public.profiles p
    join auth.users u on u.id = p.id where u.email = '${E2E_EMAIL_A}';`);
}

/** 项目时区今日（YYYY-MM-DD），供月历 aria-label 计算 */
function tzToday(tz: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

test("每 N 次奖励：表单创建 → 里程碑发放 → 撤销重发全链路", async ({
  pageA,
}) => {
  // 表单+撤销+重打+小荷包多段导航（云端往返），单列 180s
  test.setTimeout(180_000);
  const projName = `${getRunId()}-里程碑`;
  const tz = pickSafeTimezone();

  // ---- 表单：个人（默认）+ 无限次（默认）+ 每 N 次 N=2 金额 3 ----
  await pageA.goto("/create-project");
  await pageA.getByPlaceholder("项目名称（1-30 字）").fill(projName);
  await pageA.getByRole("button", { name: "每 N 次打卡奖励" }).click();
  await pageA.getByPlaceholder("每 N 次发放，如：7").fill("2");
  await pageA.getByPlaceholder("每 N 次发放的金币，如：5").fill("3");
  await pageA.getByPlaceholder("惩罚金额（默认 0）").fill("0");
  await pageA.getByRole("button", { name: "创建项目" }).click();
  await pageA.waitForURL("http://localhost:3100/", { timeout: 20_000 });

  const card = pageA.getByRole("link", { name: projName }).first();
  await expect(card).toBeVisible();
  const projectId = (await card.getAttribute("href"))!.split("/").pop()!;

  // ---- 归一化激活 + 种昨日 checked（今日打卡即凑满第 2 次）----
  psql(`
    begin;
    set session_replication_role = replica;
    update public.checkin_projects cp
    set timezone = '${tz}', starts_at = ((now() at time zone '${tz}')::date),
        status = 'active'
    where cp.id = '${projectId}';
    insert into public.checkin_occurrences (
      project_id, user_id, period_start, period_end,
      checkin_date, deadline_at, status
    )
    select '${projectId}', u.id,
      ((((now() at time zone '${tz}')::date - 1)::text || ' 00:00')::timestamp) at time zone '${tz}',
      ((((now() at time zone '${tz}')::date - 1)::text || ' 12:00')::timestamp) at time zone '${tz}',
      ((now() at time zone '${tz}')::date - 1),
      ((((now() at time zone '${tz}')::date - 1)::text || ' 12:00')::timestamp) at time zone '${tz}',
      'checked'
    from auth.users u where u.email = '${E2E_EMAIL_A}';
    set session_replication_role = default;
    commit;
  `);

  // ---- 详情：奖励规则卡 + 打卡（非 every_time 按钮无 +N）→ 里程碑即发 ----
  await pageA.goto(`/projects/${projectId}`);
  await expect(pageA.getByText("每 2 次打卡奖励")).toBeVisible();
  await expect(pageA.getByText("第 2 次打卡成功时发放（每 2 次 +3）")).toBeVisible();
  const checkinBtn = pageA.getByRole("button", { name: "打卡", exact: true });
  await expect(checkinBtn).toBeVisible({ timeout: 10_000 });
  await checkinBtn.click();
  await expect(pageA.getByText("今日已打卡")).toBeVisible({ timeout: 15_000 });

  const settleCount = () =>
    psql(`select count(*) from public.reward_settlements
          where project_id = '${projectId}' and settlement_type = 'milestone';`);
  expect(settleCount()).toBe("1");
  expect(
    psql(`select count(*) from public.transactions
          where related_project_id = '${projectId}'
            and reason = 'milestone' and amount = 3;`),
  ).toBe("1");
  expect(walletBalance()).toBe("3");

  // ---- 首页卡片文案（rewardLabel）----
  await pageA.goto("/");
  await expect(pageA.getByText("每 2 次 +3").first()).toBeVisible();

  // ---- 撤销（confirm 弹窗）→ 扣回 + 事件 revoked + settlement 删行 ----
  await pageA.goto(`/projects/${projectId}`);
  pageA.once("dialog", (dialog) => dialog.accept());
  await pageA.getByRole("button", { name: "撤销" }).click();
  const reCheckinBtn = pageA.getByRole("button", { name: "打卡", exact: true });
  await expect(reCheckinBtn).toBeVisible({ timeout: 15_000 });
  expect(settleCount()).toBe("0");
  expect(walletBalance()).toBe("0");
  expect(
    psql(`select count(*) from public.reward_events
          where project_id = '${projectId}' and source_type = 'milestone'
            and revoked_at is not null;`),
  ).toBe("1");

  // ---- 重打 → 重凑满同号 → 再发（新 settlement 行）----
  await reCheckinBtn.click();
  await expect(pageA.getByText("今日已打卡")).toBeVisible({ timeout: 15_000 });
  expect(settleCount()).toBe("1");
  expect(walletBalance()).toBe("3");

  // ---- 小荷包：里程碑奖励 + 撤销回滚 文案 ----
  await pageA.goto("/wallet");
  await expect(pageA.getByText("里程碑奖励").first()).toBeVisible();
  await expect(pageA.getByText("撤销回滚").first()).toBeVisible();
});

test("完成时奖励：表单创建 → 达标归档 → 完成奖发放", async ({ pageA }) => {
  test.setTimeout(120_000);
  const projName = `${getRunId()}-完成奖`;
  const tz = pickSafeTimezone();

  // ---- 表单：个人 + 有限次 target2 + 完成时奖励 金额 5 ----
  await pageA.goto("/create-project");
  await pageA.getByPlaceholder("项目名称（1-30 字）").fill(projName);
  await pageA.getByRole("button", { name: "有限次任务" }).click();
  await pageA.getByPlaceholder("目标次数，如：30").fill("2");
  await pageA.getByRole("button", { name: "完成时奖励" }).click();
  await pageA.getByPlaceholder("完成时总奖励，如：30").fill("5");
  await pageA.getByPlaceholder("惩罚金额（默认 0）").fill("0");
  await pageA.getByRole("button", { name: "创建项目" }).click();
  await pageA.waitForURL("http://localhost:3100/", { timeout: 20_000 });

  const card = pageA.getByRole("link", { name: projName }).first();
  await expect(card).toBeVisible();
  const projectId = (await card.getAttribute("href"))!.split("/").pop()!;

  // ---- 归一化激活 → UI 打卡 1/2 ----
  psql(`
    begin;
    set session_replication_role = replica;
    update public.checkin_projects cp
    set timezone = '${tz}', starts_at = ((now() at time zone '${tz}')::date),
        status = 'active'
    where cp.id = '${projectId}';
    set session_replication_role = default;
    commit;
  `);
  await pageA.goto(`/projects/${projectId}`);
  const checkinBtn = pageA.getByRole("button", { name: "打卡", exact: true });
  await expect(checkinBtn).toBeVisible({ timeout: 10_000 });
  await checkinBtn.click();
  await expect(pageA.getByText("今日已打卡")).toBeVisible({ timeout: 15_000 });
  await expect(pageA.getByText("🎯 1/2 次")).toBeVisible();

  // ---- 回拨截止 + 昨日 pending → 真实 processor → 补卡凑满 + 归档发奖 ----
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
  psql(`select public.cron_process_missed_occurrences();`);

  // ---- 详情：已完成 + 完成奖发放断言 ----
  await pageA.goto(`/projects/${projectId}`);
  await expect(pageA.getByText("✅ 已完成")).toBeVisible();
  await expect(pageA.getByText("🎯 2/2 次")).toBeVisible();
  expect(
    psql(`select count(*) from public.reward_settlements
          where project_id = '${projectId}' and settlement_type = 'completion'
            and per_member_amount = 5;`),
  ).toBe("1");
  expect(
    psql(`select count(*) from public.transactions
          where related_project_id = '${projectId}'
            and reason = 'completion' and amount = 5;`),
  ).toBe("1");
  expect(walletBalance()).toBe("5");

  // ---- 小荷包：完成奖励文案 ----
  await pageA.goto("/wallet");
  await expect(pageA.getByText("完成奖励").first()).toBeVisible();
});

test("月历 waived：归档免除日显示免打卡而非缺卡（P3-1）", async ({ pageA }) => {
  test.setTimeout(120_000);
  const projName = `${getRunId()}-月历`;
  const tz = pickSafeTimezone();

  // ---- 纯 psql 构造：completed target2，D-3/D-2 checked（含打卡记录），
  //      D-1 pending 逾期 → processor 主循环守卫归档（写点 A）+ D-1 waived ----
  const projectId = psql(`
    begin;
    set session_replication_role = replica;
    insert into public.checkin_projects (
      id, owner_id, name, project_type, task_type, frequency,
      reward_mode, reward_amount, penalty_amount,
      makeup_type, makeup_count, makeup_reward_mode,
      timezone, deadline_time, starts_at, status, visibility,
      reward_remainder_recipient_id, target_count
    )
    select gen_random_uuid(), u.id, '${projName}', 'personal', 'finite', 'daily',
      'completed', 6, 0, 'independent', 3, 'none',
      '${tz}', (((now() at time zone '${tz}')::time - interval '5 minutes')::time),
      ((now() at time zone '${tz}')::date - 3), 'active', 'private', u.id, 2
    from auth.users u where u.email = '${E2E_EMAIL_A}'
    returning id::text;
    set session_replication_role = default;
    commit;
  `);

  psql(`
    begin;
    set session_replication_role = replica;
    insert into public.checkin_records (
      project_id, user_id, checkin_date, checked_at,
      attempt_no, status, reward_earned, reward_mode_snapshot
    )
    select '${projectId}', u.id, d,
      ((d::text || ' 08:00')::timestamp) at time zone '${tz}',
      1, 'active', 0, 'completed'
    from auth.users u, (values (
      ((now() at time zone '${tz}')::date - 3)
    ), (
      ((now() at time zone '${tz}')::date - 2)
    )) t(d)
    where u.email = '${E2E_EMAIL_A}';
    insert into public.checkin_occurrences (
      project_id, user_id, period_start, period_end,
      checkin_date, deadline_at, status
    )
    select '${projectId}', u.id,
      ((d::text || ' 00:00')::timestamp) at time zone '${tz}',
      ((d::text || ' ' ||
        (select deadline_time::text from public.checkin_projects where id = '${projectId}')
      )::timestamp) at time zone '${tz}',
      d,
      ((d::text || ' ' ||
        (select deadline_time::text from public.checkin_projects where id = '${projectId}')
      )::timestamp) at time zone '${tz}',
      case when d = ((now() at time zone '${tz}')::date - 1)
           then 'pending'::public.occurrence_status
           else 'checked'::public.occurrence_status end
    from auth.users u, (values (
      ((now() at time zone '${tz}')::date - 3)
    ), (
      ((now() at time zone '${tz}')::date - 2)
    ), (
      ((now() at time zone '${tz}')::date - 1)
    )) t(d)
    where u.email = '${E2E_EMAIL_A}';
    set session_replication_role = default;
    commit;
  `);

  psql(`select public.cron_process_missed_occurrences();`);

  // ---- 归档 + 完成奖（写点 A）----
  expect(
    psql(`select count(*) from public.checkin_projects
          where id = '${projectId}' and status = 'archived';`),
  ).toBe("1");
  expect(
    psql(`select count(*) from public.checkin_occurrences
          where project_id = '${projectId}' and status = 'waived';`),
  ).toBe("1");
  expect(walletBalance()).toBe("6");

  // ---- 月历：waived 日蓝格"免打卡"，不得红格"缺卡" ----
  await pageA.goto(`/projects/${projectId}`);
  await expect(pageA.getByText("✅ 已完成")).toBeVisible();
  // 归档项目不渲染取消入口（仅 pending/active）
  await expect(
    pageA.getByRole("button", { name: "取消项目" }),
  ).toHaveCount(0);
  const [y, m, d] = tzToday(tz).split("-").map(Number);
  const prev = new Date(Date.UTC(y, m - 1, d) - 86_400_000);
  const waivedLabel = `${prev.getUTCMonth() + 1}月${prev.getUTCDate()}日 免打卡`;
  const missedLabel = `${prev.getUTCMonth() + 1}月${prev.getUTCDate()}日 缺卡`;
  await expect(
    pageA.getByRole("img", { name: waivedLabel, exact: true }),
  ).toBeVisible();
  await expect(
    pageA.getByRole("img", { name: missedLabel, exact: true }),
  ).toHaveCount(0);
});

test("表单负向：完成时奖励仅有限次可见，N 输入仅每 N 次展开", async ({
  pageA,
}) => {
  await pageA.goto("/create-project");

  // 默认个人 + 无限次：每 N 次可见、完成时奖励隐藏
  await expect(
    pageA.getByRole("button", { name: "每 N 次打卡奖励" }),
  ).toBeVisible();
  await expect(
    pageA.getByRole("button", { name: "完成时奖励" }),
  ).toHaveCount(0);
  await expect(pageA.getByPlaceholder("每 N 次发放，如：7")).toHaveCount(0);

  // 切到有限次：完成时奖励出现
  await pageA.getByRole("button", { name: "有限次任务" }).click();
  await expect(
    pageA.getByRole("button", { name: "完成时奖励" }),
  ).toBeVisible();

  // 选每 N 次：N 输入展开
  await pageA.getByRole("button", { name: "每 N 次打卡奖励" }).click();
  await expect(pageA.getByPlaceholder("每 N 次发放，如：7")).toBeVisible();

  // 切回无限次：完成时奖励隐藏（若已选中自动回落每次）
  await pageA.getByRole("button", { name: "无限次任务" }).click();
  await expect(
    pageA.getByRole("button", { name: "完成时奖励" }),
  ).toHaveCount(0);
  await expect(pageA.getByPlaceholder("每 N 次发放，如：7")).toBeVisible();
});

test("里程碑撤销重发第二循环：反复撤/打活跃 settlement 恒 1（复审 P3-5）", async ({
  pageA,
}) => {
  test.setTimeout(180_000);
  const projName = `${getRunId()}-二循环`;
  const tz = pickSafeTimezone();

  await pageA.goto("/create-project");
  await pageA.getByPlaceholder("项目名称（1-30 字）").fill(projName);
  await pageA.getByRole("button", { name: "每 N 次打卡奖励" }).click();
  await pageA.getByPlaceholder("每 N 次发放，如：7").fill("2");
  await pageA.getByPlaceholder("每 N 次发放的金币，如：5").fill("3");
  await pageA.getByPlaceholder("惩罚金额（默认 0）").fill("0");
  await pageA.getByRole("button", { name: "创建项目" }).click();
  await pageA.waitForURL("http://localhost:3100/", { timeout: 20_000 });

  const card = pageA.getByRole("link", { name: projName }).first();
  await expect(card).toBeVisible();
  const projectId = (await card.getAttribute("href"))!.split("/").pop()!;

  psql(`
    begin;
    set session_replication_role = replica;
    update public.checkin_projects cp
    set timezone = '${tz}', starts_at = ((now() at time zone '${tz}')::date),
        status = 'active'
    where cp.id = '${projectId}';
    insert into public.checkin_occurrences (
      project_id, user_id, period_start, period_end,
      checkin_date, deadline_at, status
    )
    select '${projectId}', u.id,
      ((((now() at time zone '${tz}')::date - 1)::text || ' 00:00')::timestamp) at time zone '${tz}',
      ((((now() at time zone '${tz}')::date - 1)::text || ' 12:00')::timestamp) at time zone '${tz}',
      ((now() at time zone '${tz}')::date - 1),
      ((((now() at time zone '${tz}')::date - 1)::text || ' 12:00')::timestamp) at time zone '${tz}',
      'checked'
    from auth.users u where u.email = '${E2E_EMAIL_A}';
    set session_replication_role = default;
    commit;
  `);

  const settleCount = () =>
    psql(`select count(*) from public.reward_settlements
          where project_id = '${projectId}' and settlement_type = 'milestone';`);

  // 撤/打 ×2 循环：每轮 撤→0 行/钱包 0，打→1 行/钱包 3
  await pageA.goto(`/projects/${projectId}`);
  for (let round = 1; round <= 2; round++) {
    if (round === 1) {
      const btn = pageA.getByRole("button", { name: "打卡", exact: true });
      await expect(btn).toBeVisible({ timeout: 10_000 });
      await btn.click();
    } else {
      await pageA
        .getByRole("button", { name: "打卡", exact: true })
        .click();
    }
    await expect(pageA.getByText("今日已打卡")).toBeVisible({ timeout: 15_000 });
    expect(settleCount()).toBe("1");
    expect(walletBalance()).toBe("3");

    pageA.once("dialog", (dialog) => dialog.accept());
    await pageA.getByRole("button", { name: "撤销" }).click();
    await expect(
      pageA.getByRole("button", { name: "打卡", exact: true }),
    ).toBeVisible({ timeout: 15_000 });
    expect(settleCount()).toBe("0");
    expect(walletBalance()).toBe("0");
  }
});

test("补卡凑满的里程碑：补卡记录不可撤销（复审 P3-5）", async ({ pageA }) => {
  test.setTimeout(120_000);
  const projName = `${getRunId()}-补卡里程碑`;
  const tz = pickSafeTimezone();

  // 本用例走 psql 构造，但夹具生命周期依赖 pageA；顺带验证登录态
  await pageA.goto("/");

  // psql 构造：infinite every_n N=2 金额3，截止已过，两日 pending 逾期
  const projectId = psql(`
    begin;
    set session_replication_role = replica;
    insert into public.checkin_projects (
      id, owner_id, name, project_type, task_type, frequency,
      reward_mode, reward_n_value, reward_amount, penalty_amount,
      makeup_type, makeup_count, makeup_reward_mode,
      timezone, deadline_time, starts_at, status, visibility,
      reward_remainder_recipient_id
    )
    select gen_random_uuid(), u.id, '${projName}', 'personal', 'infinite', 'daily',
      'every_n', 2, 3, 0, 'independent', 3, 'none',
      '${tz}', (((now() at time zone '${tz}')::time - interval '5 minutes')::time),
      ((now() at time zone '${tz}')::date - 2), 'active', 'private', u.id
    from auth.users u where u.email = '${E2E_EMAIL_A}'
    returning id::text;
    set session_replication_role = default;
    commit;
  `);

  psql(`
    begin;
    set session_replication_role = replica;
    insert into public.checkin_occurrences (
      project_id, user_id, period_start, period_end,
      checkin_date, deadline_at, status
    )
    select '${projectId}', u.id,
      ((d::text || ' 00:00')::timestamp) at time zone '${tz}',
      ((d::text || ' ' ||
        (select deadline_time::text from public.checkin_projects where id = '${projectId}')
      )::timestamp) at time zone '${tz}',
      d,
      ((d::text || ' ' ||
        (select deadline_time::text from public.checkin_projects where id = '${projectId}')
      )::timestamp) at time zone '${tz}',
      'pending'
    from auth.users u, (values (
      ((now() at time zone '${tz}')::date - 2)
    ), (
      ((now() at time zone '${tz}')::date - 1)
    )) t(d)
    where u.email = '${E2E_EMAIL_A}';
    set session_replication_role = default;
    commit;
  `);

  // processor：两条 makeup，第 2 条凑满里程碑（触发=补卡打卡记录）
  psql(`select public.cron_process_missed_occurrences();`);
  expect(
    psql(`select count(*) from public.checkin_occurrences
          where project_id = '${projectId}' and status = 'makeup';`),
  ).toBe("2");
  expect(
    psql(`select count(*) from public.reward_settlements
          where project_id = '${projectId}' and settlement_type = 'milestone';`),
  ).toBe("1");
  expect(walletBalance()).toBe("3");

  // 补卡记录（checkin_date=逾期日）不可撤销：revoke_checkin 拒绝
  const revokeRejected = psql(`
    begin;
    do $$
    begin
      perform set_config('request.jwt.claims',
        json_build_object('sub', (select id from auth.users where email = '${E2E_EMAIL_A}')::text,
                          'role','authenticated')::text, true);
    end $$;
    do $$
    declare
      v_cid uuid;
      v_rejected boolean := false;
    begin
      select cr.id into v_cid
      from public.checkin_records cr
      where cr.project_id = '${projectId}' and cr.is_makeup
      order by cr.checkin_date desc limit 1;
      begin
        perform public.revoke_checkin(v_cid);
      exception when check_violation then v_rejected := true; end;
      if not v_rejected then
        raise exception 'E2E FAIL: 补卡记录撤销未被拒绝';
      end if;
    end $$;
    commit;
  `);
  expect(revokeRejected).toBe("");

  // 里程碑与余额不受失败撤销尝试影响
  expect(
    psql(`select count(*) from public.reward_settlements
          where project_id = '${projectId}' and settlement_type = 'milestone';`),
  ).toBe("1");
  expect(walletBalance()).toBe("3");

  // 补卡余量 chip：两日补卡已用 2 / 额度 3（makeup_usages 权威口径）
  await pageA.goto(`/projects/${projectId}`);
  await expect(pageA.getByText("补卡 1/3")).toBeVisible();
});
