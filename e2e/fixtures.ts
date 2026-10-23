import { test as base, expect, type Page } from "@playwright/test";
import { psql, requireE2ePassword, requireProductionOptIn, E2E_EMAIL_A, E2E_EMAIL_B } from "./target";
import { acquireRunLock, releaseRunLock } from "./run-lock";

// 供 spec 经统一入口使用
export { psql, E2E_EMAIL_A, E2E_EMAIL_B };

/** 每小时有一个本地时刻在 [01:00, 22:00) 的候选时区（UTC-11 … UTC+14）；
 *  归一化项目时区用，避开截止边界窗（自 checkin.spec 提取共用） */
const TZ_CANDIDATES = [
  "Pacific/Midway", "Pacific/Honolulu", "America/Los_Angeles", "America/Denver",
  "America/Chicago", "America/New_York", "America/Sao_Paulo", "Atlantic/Azores",
  "Europe/London", "Europe/Berlin", "Europe/Athens", "Europe/Moscow",
  "Asia/Dubai", "Asia/Karachi", "Asia/Kolkata", "Asia/Dhaka", "Asia/Bangkok",
  "Asia/Shanghai", "Asia/Tokyo", "Australia/Sydney", "Pacific/Noumea",
  "Pacific/Auckland", "Pacific/Tongatapu", "Pacific/Kiritimati",
];

export function pickSafeTimezone(): string {
  for (const tz of TZ_CANDIDATES) {
    const hour = Number(
      new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", hour12: false }).format(new Date()),
    );
    if (hour >= 1 && hour <= 21) return tz;
  }
  throw new Error("无可用的安全时区");
}

/**
 * E2E 夹具与回收：
 * - run_id + hex_id 隔离全部夹具（项目 ID/名、UI 创建项目名）
 * - setup 在 try 内；teardown 单事务回收 run 项目集合的全部关联事实，
 *   异常上抛使本次 run 失败（不假绿）
 * - audit_log 按审计合同保留不删，teardown 成功后上报固定账号累计行数
 */

let currentRunId = "";
let currentHexId = "";

export function getRunId(): string { return currentRunId; }
export function getHexId(): string { return currentHexId; }

function fixtureProjectUuid(): string {
  return `e2eeeeee-0000-0000-0000-${currentHexId}`;
}

/** setup 夹具（单事务：好友 + 余额 + 团队项目） */
export function setupFixtures(): void {
  currentRunId = `e2e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  currentHexId = Array.from({ length: 12 }, () =>
    "0123456789abcdef"[Math.floor(Math.random() * 16)],
  ).join("");
  const pid = fixtureProjectUuid();

  psql(`
begin;
set session_replication_role = replica;
insert into public.friendships (user_low_id, user_high_id, requested_by, status)
select least(a.id,b.id), greatest(a.id,b.id), a.id, 'accepted'
from (select id from auth.users where email='${E2E_EMAIL_A}') a,
     (select id from auth.users where email='${E2E_EMAIL_B}') b
on conflict do nothing;
update public.profiles p set wallet_balance=0, total_earned=0, total_spent=0, total_penalty=0
from auth.users u where u.id=p.id and u.email in ('${E2E_EMAIL_A}','${E2E_EMAIL_B}');
insert into public.checkin_projects (
  id, owner_id, name, project_type, frequency, checkin_mode,
  reward_mode, reward_amount, penalty_amount,
  makeup_type, makeup_count, makeup_reward_mode,
  timezone, deadline_time, starts_at, status, visibility, max_members,
  reward_remainder_recipient_id
)
select '${pid}', u.id, '${currentRunId}-团队', 'group', 'daily', 'any_one',
       'every_time', 5, 0, 'independent', 0, 'none', 'Asia/Shanghai', '23:59',
       current_date, 'active', 'private', 2, u.id
from auth.users u where u.email='${E2E_EMAIL_A}';
insert into public.project_members (project_id, user_id, status, role, joined_at)
select '${pid}', u.id, 'active',
       (case when u.email='${E2E_EMAIL_A}' then 'owner' else 'member' end)::public.member_role,
       case when u.email='${E2E_EMAIL_A}' then null else now() end
from auth.users u where u.email in ('${E2E_EMAIL_A}','${E2E_EMAIL_B}');
set session_replication_role = default;
commit;
`);
}

/** teardown（单事务：run 项目集合 + 关联事实 + 好友 + 余额） */
export function teardownAll(): void {
  if (!currentRunId) return;
  const pid = fixtureProjectUuid();
  psql(`
begin;
set session_replication_role = replica;
create temp table _run_projects on commit drop as
select '${pid}'::uuid as id
union all
select cp.id from public.checkin_projects cp
where cp.name like '${currentRunId}%'
  and cp.owner_id in (select id from auth.users where email in ('${E2E_EMAIL_A}','${E2E_EMAIL_B}'));

-- 先取项目行锁（与 occurrence 生成器同序）：本事务持锁期间生成器
-- skip locked 跳过；若生成器持锁则阻塞至其提交后才开始删除
select 1 from public.checkin_projects cp
where cp.id in (select id from _run_projects)
for update;

delete from public.reward_settlements rs
where rs.project_id in (select id from _run_projects);
delete from public.reward_events re
where re.project_id in (select id from _run_projects);
delete from public.debt_records dr
where dr.project_id in (select id from _run_projects);
delete from public.makeup_usages mu
where mu.project_id in (select id from _run_projects);
delete from public.checkin_occurrences co
where co.project_id in (select id from _run_projects);
delete from public.checkin_records cr
where cr.project_id in (select id from _run_projects);
delete from public.project_members pm
where pm.project_id in (select id from _run_projects);
delete from public.checkin_projects cp
where cp.id in (select id from _run_projects);
-- 消费测试残留清理（expense 属 profile 级；严格限定 E2E 账号，
-- 防误删其他用户交易）
delete from public.transactions t
where t.user_id in (select id from auth.users where email in ('${E2E_EMAIL_A}','${E2E_EMAIL_B}'))
  and (t.related_expense_id in (
    select e.id from public.expenses e
    where e.user_id in (select id from auth.users where email in ('${E2E_EMAIL_A}','${E2E_EMAIL_B}'))
  ) or t.idempotency_key like 'expense:%');
delete from public.expenses e
where e.user_id in (select id from auth.users where email in ('${E2E_EMAIL_A}','${E2E_EMAIL_B}'));
-- 成就测试残留清理（achievements 属用户级、无 project_id；严格限定
-- E2E 账号，模式同学 expense 的用户级清理段）
delete from public.achievements a
where a.user_id in (select id from auth.users where email in ('${E2E_EMAIL_A}','${E2E_EMAIL_B}'));
-- 动态测试残留清理（likes/nudges 属用户级；任一侧为 E2E 账号即回收）
delete from public.activity_likes al
where al.user_id in (select id from auth.users where email in ('${E2E_EMAIL_A}','${E2E_EMAIL_B}'));
delete from public.activity_nudges an
where an.nudger_id in (select id from auth.users where email in ('${E2E_EMAIL_A}','${E2E_EMAIL_B}'))
   or an.nudged_user_id in (select id from auth.users where email in ('${E2E_EMAIL_A}','${E2E_EMAIL_B}'));
-- 本 run 临时第三用户（feed.spec 非好友判别夹具）按依赖序显式回收
--（本段跑在 replica 模式，FK 级联不触发，同上方 _run_projects 模式；
--  其项目为 pending 状态，cron 不生成 occurrence，无该表残留）
delete from public.activity_likes al
where al.user_id = (select id from auth.users where email = '${currentRunId}-c@local.test');
delete from public.checkin_records cr
using auth.users u, public.checkin_projects cp
where u.email = '${currentRunId}-c@local.test' and cp.owner_id = u.id and cr.project_id = cp.id;
delete from public.checkin_projects cp
using auth.users u where u.email = '${currentRunId}-c@local.test' and cp.owner_id = u.id;
delete from public.profiles p
using auth.users u where u.email = '${currentRunId}-c@local.test' and p.id = u.id;
delete from auth.users where email = '${currentRunId}-c@local.test';
delete from public.friendships f
using auth.users a, auth.users b
where a.email='${E2E_EMAIL_A}' and b.email='${E2E_EMAIL_B}'
  and f.user_low_id=least(a.id,b.id) and f.user_high_id=greatest(a.id,b.id);
update public.profiles p set wallet_balance=0, total_earned=0, total_spent=0, total_penalty=0
from auth.users u where u.id=p.id and u.email in ('${E2E_EMAIL_A}','${E2E_EMAIL_B}');

do $$
declare v integer;
begin
  select count(*) into v from public.checkin_occurrences co
  where co.project_id in (select id from _run_projects);
  if v > 0 then raise exception 'teardown 后本 run 项目残留 % 行 occurrence', v; end if;
end $$;

set session_replication_role = default;
commit;
`);
}

/** 上报固定 E2E 账号的 audit_log 累计行数（审计合同保留不删） */
function reportAuditResidue(): void {
  const n = psql(`select count(*) from public.audit_log al
where al.user_id in (select id from auth.users where email in ('${E2E_EMAIL_A}','${E2E_EMAIL_B}'));`);
  console.log(`[e2e] audit_log 保留 ${n} 行（固定 E2E 账号的已识别审计污染，按合同不删；见 cleanup audit 的 e2e_audit_log_rows）`);
}

export async function login(page: Page, email: string): Promise<void> {
  const pwd = requireE2ePassword();
  await page.goto("/auth/login");
  await page.getByPlaceholder("手机号 / 邮箱").fill(email);
  await page.getByPlaceholder("密码", { exact: true }).fill(pwd);
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page.getByRole("link", { name: "好友" })).toBeVisible({ timeout: 20_000 });
}

type TestFixtures = { pageA: Page };
type WorkerFixtures = { runLock: void };
export const test = base.extend<TestFixtures, WorkerFixtures>({
  // worker 级 auto fixture：整个 run 启动前取锁、结束后释放，
  // 用例之间不存在锁间隙
  runLock: [
    async ({}, run) => {
      requireE2ePassword();
      requireProductionOptIn();
      acquireRunLock();
      // 观测信号：_mutex_test.sh 以此确认锁的获取/释放时序
      console.log(`[e2e] runLock acquired（worker=${process.env.TEST_WORKER_INDEX ?? "?"}）`);
      await run();
      releaseRunLock();
      console.log("[e2e] runLock released");
    },
    { scope: "worker", auto: true },
  ],
  pageA: async ({ browser }, run) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      setupFixtures();   // setup 在 try 内：失败也走 finally 回收
      await login(page, E2E_EMAIL_A);
      await run(page);
    } finally {
      try { await context.close(); } catch { /* 关闭失败不阻断回收 */ }
      // teardown 异常直接上抛：回收失败必须使本次 run 失败（不假绿）
      teardownAll();
      reportAuditResidue();
    }
  },
});
export { expect };
