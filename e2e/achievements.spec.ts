import { test, expect, psql, getRunId, E2E_EMAIL_A, pickSafeTimezone } from "./fixtures";

/**
 * 成就页 streak 徽章 E2E（00089 链路）：
 * 1. 零徽章空状态：夹具后零 streak → 引导文案 + 4 枚灰 + 里程碑 0/7
 * 2. 解锁链：psql 直插 6 天历史（checkin_records + checkin_occurrences
 *    成对，正常触发器模式——streak 缓存由 occurrence 驱动，00060 后
 *    checkin_records 无触发器）→ 真实 recalc（当前生效 00082 版）把缓存
 *    推到 6 → UI 第 7 次打卡触发解锁 → 页面 7 天徽章亮 + 里程碑切 30 天。
 *    项目奖励 5/惩罚 0（惩罚 0 使生产 cron 无操作空间）。
 */

test("成就页零徽章空状态：引导文案 + 4 枚未解锁", async ({ pageA }) => {
  await pageA.goto("/achievements");

  await expect(pageA.getByRole("heading", { name: "成就" })).toBeVisible();
  // 空状态引导（prompt §五-1 最简版）
  await expect(pageA.getByText("还没有解锁徽章")).toBeVisible();
  await expect(pageA.getByText("完成第一次打卡，解锁你的第一个徽章吧")).toBeVisible();
  // 三联卡：徽章 0/4；里程碑 7 天 0 进度
  await expect(pageA.getByText("0/4", { exact: true })).toBeVisible();
  await expect(pageA.getByText("7 天连续徽章")).toBeVisible();
  await expect(pageA.getByText("还差 7 天即可解锁")).toBeVisible();
  await expect(pageA.getByText("0/7 天")).toBeVisible();
  // 徽章墙 4 枚全灰（🔒 + 进度）
  await expect(pageA.getByText("🔒")).toHaveCount(4);
  await expect(pageA.getByText("0/7", { exact: true })).toBeVisible();
  await expect(pageA.getByText("0/30", { exact: true })).toBeVisible();
  await expect(pageA.getByText("0/100", { exact: true })).toBeVisible();
  await expect(pageA.getByText("0/365", { exact: true })).toBeVisible();
});

test("7 天连续达标解锁：直插 6 天历史 → UI 第 7 次打卡 → 徽章亮", async ({ pageA }) => {
  test.setTimeout(150_000);

  const projName = `${getRunId()}-成就`;
  const tz = pickSafeTimezone();

  // 建个人项目（奖励 5 / 惩罚 0，every_time 默认），学 debt.spec
  await pageA.goto("/create-project");
  await pageA.getByPlaceholder("项目名称（1-30 字）").fill(projName);
  await pageA.getByPlaceholder("奖励金额，如：5").fill("5");
  await pageA.getByPlaceholder("惩罚金额（默认 0）").fill("0");
  await pageA.getByRole("button", { name: "创建项目" }).click();
  await pageA.waitForURL("http://localhost:3100/", { timeout: 20_000 });

  // 边界归一化：安全时区 + starts_at 回拨 6 天（模拟 6 天前开始的项目）
  psql(`
    begin;
    set session_replication_role = replica;
    update public.checkin_projects cp
    set timezone = '${tz}', starts_at = ((now() at time zone '${tz}')::date - 6),
        status = 'active'
    where cp.name = '${projName}'
      and cp.owner_id = (select id from auth.users where email = '${E2E_EMAIL_A}');
    set session_replication_role = default;
    commit;
  `);

  // 直插 6 天历史（正常触发器模式）：打卡记录 + checked occurrence 成对，
  // 与 create_checkin 惰性创建路径的字段口径一致
  psql(`
    with ins as (
      insert into public.checkin_records (
        project_id, user_id, checkin_date, checked_at,
        attempt_no, status, reward_earned, reward_mode_snapshot
      )
      select cp.id, cp.owner_id,
             ((now() at time zone cp.timezone)::date - g.n),
             ((((now() at time zone cp.timezone)::date - g.n)::text || ' 12:00')::timestamp
                at time zone cp.timezone),
             1, 'active'::public.checkin_attempt_status, 0,
             'every_time'::public.reward_mode_type
      from public.checkin_projects cp
      cross join generate_series(1, 6) as g(n)
      where cp.name = '${projName}'
        and cp.owner_id = (select id from auth.users where email = '${E2E_EMAIL_A}')
      returning id, project_id, user_id, checkin_date
    )
    insert into public.checkin_occurrences (
      project_id, user_id, period_start, period_end,
      checkin_date, deadline_at, status, checkin_record_id
    )
    select i.project_id, i.user_id,
           (i.checkin_date::text || ' 00:00')::timestamp at time zone cp.timezone,
           (i.checkin_date::text || ' ' || cp.deadline_time::text)::timestamp
             at time zone cp.timezone,
           i.checkin_date,
           (i.checkin_date::text || ' ' || cp.deadline_time::text)::timestamp
             at time zone cp.timezone,
           'checked'::public.occurrence_status,
           i.id
    from ins i
    join public.checkin_projects cp on cp.id = i.project_id;
  `);

  // 真实重算（当前生效 00082 版）：缓存 0 → 6（< 7，不触发解锁）
  psql(`select public._recalc_project_streak_occurrence_aware(
    (select id from public.checkin_projects cp
     where cp.name = '${projName}'
       and cp.owner_id = (select id from auth.users where email = '${E2E_EMAIL_A}')));`);
  expect(
    psql(`select max_streak || '/' || current_streak from public.checkin_projects cp
      where cp.name = '${projName}'
        and cp.owner_id = (select id from auth.users where email = '${E2E_EMAIL_A}');`),
  ).toBe("6/6");

  // ---- 解锁前页面：4 枚灰、进度 6/7、里程碑还差 1 天 ----
  await pageA.goto("/achievements");
  await expect(pageA.getByText("0/4", { exact: true })).toBeVisible();
  await expect(pageA.getByText("6/7 天")).toBeVisible();
  await expect(pageA.getByText("还差 1 天即可解锁")).toBeVisible();
  await expect(pageA.getByText("6/7", { exact: true })).toBeVisible();
  await expect(pageA.getByText("6/30", { exact: true })).toBeVisible();
  await expect(pageA.getByText("🔥 6")).toBeVisible();
  await expect(pageA.getByText("🔒")).toHaveCount(4);

  // ---- UI 第 7 次真实打卡 → streak=7 → 触发器解锁 ----
  await pageA.goto("/");
  const projCard = pageA.locator("article").filter({ hasText: projName });
  await expect(projCard).toBeVisible();
  await projCard.getByRole("button", { name: "打卡" }).click();

  const achCount = () =>
    psql(`select count(*) from public.achievements a
      join auth.users u on u.id = a.user_id
      where u.email = '${E2E_EMAIL_A}'
        and a.achievement_type = 'streak' and a.achievement_value = 7;`);
  await expect.poll(achCount, { timeout: 20_000 }).toBe("1");

  // ---- 解锁后页面：7 天徽章亮 + 计数 1/4 + 里程碑切 30 天 ----
  await pageA.goto("/achievements");
  await expect(pageA.getByText("1/4", { exact: true })).toBeVisible();
  await expect(pageA.getByText("7 天连续", { exact: true })).toBeVisible();
  await expect(pageA.getByText(/^\d{4}\.\d{2}\.\d{2} 解锁$/)).toBeVisible();
  await expect(pageA.getByText("30 天连续徽章")).toBeVisible();
  await expect(pageA.getByText("还差 23 天即可解锁")).toBeVisible();
  await expect(pageA.getByText("7/30 天")).toBeVisible();
  await expect(pageA.getByText("🔥 7")).toBeVisible();
  // 未解锁的 3 枚仍灰
  await expect(pageA.getByText("🔒")).toHaveCount(3);
  await expect(pageA.getByText("7/30", { exact: true })).toBeVisible();
  await expect(pageA.getByText("7/100", { exact: true })).toBeVisible();
  await expect(pageA.getByText("7/365", { exact: true })).toBeVisible();
});
