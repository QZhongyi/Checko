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
import type { Page } from "@playwright/test";

/**
 * 好友动态 E2E（00090 链路）：
 * 1. 好友打卡卡（个人 + 多人合并卡"今日 x/y"）+ 里程碑卡渲染 + 点赞 toggle
 *    （页面态 + psql 权威断言 like 行存在/取消）
 * 2. 缺卡提醒卡 → 催打卡 → "已提醒"态 + psql nudge 行 + 24h 冷却 RPC 拒
 * 3. 非好友（临时 C 用户）打卡不入动态流 + 越权点赞被 RPC 拒
 *
 * 夹具口径：B 的项目 psql 直插（学 fixtures/setupFixtures），B 打卡走真实
 * UI create_checkin；里程碑行 psql 直插（解锁链已由 achievements.spec 覆盖，
 * 本 spec 只验渲染与点赞目标）。C 用户以 run_id 标记 email，teardown 级联回收。
 * 注：生产 pooler 通道的 SQL 解析器不接受字符串字面量内的括号。
 */

/**
 * 以 jwt claims 模拟指定用户调 RPC，断言被拒（错误文案含 messagePart）。
 * uuid 先以超级用户解析为字面量：authenticated 角色无权读 auth.users，
 * 且 public 表在 RLS 下可能隐藏目标行（需在调用前解析）
 */
function expectRpcRejectedAs(
  email: string,
  callSql: string,
  messagePart: string,
) {
  const uid = psql(
    `select id::text from auth.users where email='${email}';`,
  );
  let stderr = "";
  try {
    psql(`
begin;
select set_config('request.jwt.claims',
  json_build_object('sub', '${uid}', 'role','authenticated')::text,
  true);
set local role authenticated;
${callSql}
rollback;
`);
  } catch (err) {
    stderr = String((err as { stderr?: string }).stderr ?? "");
  }
  expect(
    stderr.includes(messagePart),
    `RPC 应被拒且错误含「${messagePart}」，实际：${stderr.trim()}`,
  ).toBe(true);
}

/** B 的个人项目夹具（visibility=friends，A 可见） */
function createFriendProject(name: string, status: "active" | "pending") {
  const tz = pickSafeTimezone();
  psql(`
begin;
set session_replication_role = replica;
insert into public.checkin_projects (
  id, owner_id, name, project_type, frequency, checkin_mode,
  reward_mode, reward_amount, penalty_amount,
  makeup_type, makeup_count, makeup_reward_mode,
  timezone, deadline_time, starts_at, status, visibility, max_members,
  reward_remainder_recipient_id
)
select gen_random_uuid(), u.id, '${name}', 'personal', 'daily', 'any_one',
       'every_time', 5, 0, 'independent', 0, 'none',
       '${tz}', '23:59', ((now() at time zone '${tz}')::date),
       '${status}', 'friends', 2, u.id
from auth.users u where u.email='${E2E_EMAIL_B}';
set session_replication_role = default;
commit;
`);
}

async function checkinViaUi(page: Page, projName: string) {
  const card = page.getByRole("link", { name: new RegExp(projName) }).first();
  await expect(card).toBeVisible({ timeout: 15_000 });
  await card.click();
  await page.waitForURL(/\/projects\//, { timeout: 15_000 });
  // eligible 按钮文案含奖励后缀（every_time +N），按前缀匹配（学 group.spec）
  await page.getByRole("button", { name: /打卡/ }).click();
  await expect(page.getByText("今日已打卡")).toBeVisible({ timeout: 15_000 });
  await page.goto("/");
}

test("好友动态：打卡卡/多人合并卡/里程碑卡渲染 + 点赞 toggle", async ({
  pageA,
  browser,
}) => {
  test.setTimeout(180_000);
  const projName = `${getRunId()}-动态A`;
  const teamName = `${getRunId()}-团队`;
  createFriendProject(projName, "active");

  // B 登录：真实打卡个人项目 + 团队项目（覆盖多人合并卡"今日 x/y"）
  const ctxB = await browser.newContext();
  const pageB = await ctxB.newPage();
  await login(pageB, E2E_EMAIL_B);
  await checkinViaUi(pageB, projName);
  await checkinViaUi(pageB, teamName);
  await ctxB.close().catch(() => {});

  // 打卡备注（UI 无 note 输入，psql 补齐后验卡片 note 渲染）
  psql(`
    update public.checkin_records cr set note = '今天多跑了 1 公里'
    from public.checkin_projects cp
    where cp.id = cr.project_id and cp.name = '${projName}';
  `);
  // 里程碑夹具行（解锁链由 achievements.spec 覆盖，此处只验渲染与点赞目标）
  psql(`
    insert into public.achievements (user_id, achievement_type, achievement_value, unlocked_at)
    select u.id, 'streak', 7, now() - interval '1 hour'
    from auth.users u where u.email = '${E2E_EMAIL_B}';
  `);

  const nicknameB = psql(
    `select p.nickname from public.profiles p
     join auth.users u on u.id = p.id where u.email = '${E2E_EMAIL_B}';`,
  );

  // ---- A 动态页（默认 tab）----
  await pageA.goto("/friends");
  await expect(pageA.getByRole("link", { name: "动态" })).toBeVisible();
  await expect(pageA.getByText("今日好友")).toBeVisible();
  await expect(pageA.getByText("我的连续")).toBeVisible();
  await expect(pageA.getByText("我的余额")).toBeVisible();

  // 个人项目打卡卡：项目名 / 类型徽章 / note / 好友昵称
  const personalCard = pageA.locator("article").filter({ hasText: projName });
  await expect(personalCard).toBeVisible({ timeout: 15_000 });
  await expect(personalCard.getByText("👤 个人")).toBeVisible();
  await expect(personalCard.getByText("今天多跑了 1 公里")).toBeVisible();
  await expect(personalCard.getByText(nicknameB)).toBeVisible();

  // 多人项目合并卡：紫徽章"今日 x/y 人已打卡"（B 打卡、A 未打卡 → 1/2）
  const groupCard = pageA.locator("article").filter({ hasText: teamName });
  await expect(groupCard).toBeVisible({ timeout: 15_000 });
  await expect(groupCard.getByText("👥 多人")).toBeVisible();
  await expect(groupCard.getByText("今日 1/2 人已打卡")).toBeVisible();

  // 里程碑卡
  const milestoneCard = pageA
    .locator("article")
    .filter({ hasText: "里程碑达成" });
  await expect(milestoneCard).toBeVisible({ timeout: 15_000 });
  await expect(milestoneCard.getByText("里程碑达成！连续打卡 7 天 🔥")).toBeVisible();

  // ---- 点赞 toggle：页面态 + psql 权威断言 ----
  const likeRowCount = (targetType: string, targetIdSql: string) =>
    psql(`select count(*) from public.activity_likes al
      join auth.users u on u.id = al.user_id
      where u.email = '${E2E_EMAIL_A}'
        and al.target_type = '${targetType}'
        and al.target_id = (${targetIdSql});`);

  const checkinIdSql = `select cr.id from public.checkin_records cr
    join public.checkin_projects cp on cp.id = cr.project_id
    where cp.name = '${projName}'`;

  // 注：getByRole name 默认子串匹配（"点赞"也命中"取消点赞"），点赞按钮
  // 的 aria-label 是精确串，一律 exact: true 防止 pending 期误匹配
  await personalCard
    .getByRole("button", { name: "点赞", exact: true })
    .click();
  await expect(
    personalCard.getByRole("button", { name: "取消点赞", exact: true }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    personalCard.getByRole("button", { name: "取消点赞", exact: true }),
  ).toContainText("1");
  expect(likeRowCount("checkin", checkinIdSql)).toBe("1");

  await personalCard
    .getByRole("button", { name: "取消点赞", exact: true })
    .click();
  await expect(
    personalCard.getByRole("button", { name: "点赞", exact: true }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    personalCard.getByRole("button", { name: "点赞", exact: true }),
  ).toBeEnabled();
  expect(likeRowCount("checkin", checkinIdSql)).toBe("0");

  // 里程碑点赞目标（achievement 类型行落库）
  const achIdSql = `select a.id from public.achievements a
    join auth.users u on u.id = a.user_id
    where u.email = '${E2E_EMAIL_B}' and a.achievement_value = 7`;
  await milestoneCard
    .getByRole("button", { name: "点赞", exact: true })
    .click();
  await expect(
    milestoneCard.getByRole("button", { name: "取消点赞", exact: true }),
  ).toBeVisible({ timeout: 15_000 });
  expect(likeRowCount("achievement", achIdSql)).toBe("1");
  await milestoneCard
    .getByRole("button", { name: "取消点赞", exact: true })
    .click();
  await expect(
    milestoneCard.getByRole("button", { name: "点赞", exact: true }),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    milestoneCard.getByRole("button", { name: "点赞", exact: true }),
  ).toBeEnabled();
  expect(likeRowCount("achievement", achIdSql)).toBe("0");
});

test("缺卡提醒卡：催打卡 → 已提醒态 + nudge 行 + 24h 冷却拒", async ({
  pageA,
}) => {
  test.setTimeout(120_000);
  const projName = `${getRunId()}-动态B`;
  createFriendProject(projName, "active");

  // B 今日未打卡的显式 pending 义务（deadline 未过，与 cron 生成同窗口幂等）
  psql(`
    insert into public.checkin_occurrences (
      project_id, user_id, period_start, period_end, checkin_date, deadline_at, status
    )
    select cp.id, cp.owner_id,
           (((now() at time zone cp.timezone)::date)::text || ' 00:00')::timestamp at time zone cp.timezone,
           (((now() at time zone cp.timezone)::date)::text || ' 23:59')::timestamp at time zone cp.timezone,
           ((now() at time zone cp.timezone)::date),
           (((now() at time zone cp.timezone)::date)::text || ' 23:59')::timestamp at time zone cp.timezone,
           'pending'
    from public.checkin_projects cp
    where cp.name = '${projName}'
    on conflict do nothing;
  `);

  await pageA.goto("/friends");
  const missedCard = pageA.locator("article").filter({ hasText: projName });
  await expect(missedCard).toBeVisible({ timeout: 15_000 });
  await expect(missedCard.getByText("ta 可能需要你的鼓励")).toBeVisible();
  await expect(missedCard.getByText("今日还未打卡")).toBeVisible();

  // 催打卡 → 按钮态"已提醒 ✓"（服务端 nudged 翻转 + revalidate）
  await missedCard.getByRole("button", { name: "提醒 TA 打卡" }).click();
  await expect(
    missedCard.getByText("已提醒 ✓ 明天再来看看"),
  ).toBeVisible({ timeout: 15_000 });

  const nudgeCount = () =>
    psql(`select count(*) from public.activity_nudges an
      join auth.users x on x.id = an.nudger_id
      join auth.users y on y.id = an.nudged_user_id
      where x.email = '${E2E_EMAIL_A}' and y.email = '${E2E_EMAIL_B}';`);
  expect(nudgeCount()).toBe("1");

  // 24h 冷却：同日再催被 RPC 拒（UI 已灰化，直调 RPC 判别；uuid 先解析为字面量）
  const uidB = psql(
    `select id::text from auth.users where email='${E2E_EMAIL_B}';`,
  );
  expectRpcRejectedAs(
    E2E_EMAIL_A,
    `select public.nudge_friend('${uidB}');`,
    "24小时内已提醒过",
  );
});

test("非好友不可见 + 越权点赞被拒", async ({ pageA }) => {
  test.setTimeout(120_000);
  const cEmail = `${getRunId()}-c@local.test`;
  const projName = `${getRunId()}-动态C`;

  // 临时第三用户 C（teardown 按 email 级联回收）+ 其 public 项目 + 打卡行。
  // 项目 pending：cron 不生成 occurrence，删除时无 FK 阻塞；feed 对 C 的
  // 判别是好友门（非项目状态），可见性判别不受影响。
  psql(`
begin;
set session_replication_role = replica;
insert into auth.users (id, email) values (gen_random_uuid(), '${cEmail}');
insert into public.profiles (id, nickname)
select id, '动态夹具C' from auth.users where email = '${cEmail}'
on conflict do nothing;
insert into public.checkin_projects (
  id, owner_id, name, project_type, frequency, checkin_mode,
  reward_mode, reward_amount, penalty_amount,
  makeup_type, makeup_count, makeup_reward_mode,
  timezone, deadline_time, starts_at, status, visibility, max_members,
  reward_remainder_recipient_id
)
select gen_random_uuid(), u.id, '${projName}', 'personal', 'daily', 'any_one',
       'every_time', 5, 0, 'independent', 0, 'none',
       'Asia/Shanghai', '23:59', current_date, 'pending', 'public', 2, u.id
from auth.users u where u.email = '${cEmail}';
insert into public.checkin_records (
  project_id, user_id, checkin_date, checked_at, attempt_no, status,
  reward_earned, reward_mode_snapshot
)
select cp.id, cp.owner_id, ((now() at time zone cp.timezone)::date), now(), 1,
       'active', 0, 'every_time'
from public.checkin_projects cp
join auth.users u on u.id = cp.owner_id
where cp.name = '${projName}' and u.email = '${cEmail}';
set session_replication_role = default;
commit;
`);

  // C 的打卡不出现在 A 的动态流（非好友门判别；public 项目也不放行）
  await pageA.goto("/friends");
  await expect(
    pageA.locator("article").filter({ hasText: projName }),
  ).toHaveCount(0, { timeout: 15_000 });

  // 越权点赞：A 对非好友 C 的打卡记录点赞被 RPC 拒（目标 id 以超级用户
  // 解析为字面量——RLS 下 A 的直查本来就该看不到 C 的记录）
  const cRecordId = psql(`select cr.id::text
    from public.checkin_records cr
    join public.checkin_projects cp on cp.id = cr.project_id
    where cp.name = '${projName}';`);
  expectRpcRejectedAs(
    E2E_EMAIL_A,
    `select public.toggle_activity_like('checkin', '${cRecordId}');`,
    "只能点赞好友的动态",
  );
});
