import { test, expect, psql, getRunId, E2E_EMAIL_A, pickSafeTimezone } from "./fixtures";

/**
 * 项目详情 E2E：创建项目 → 打卡 → 日历/统计更新。
 * - 项目名含 run_id（teardown 精确回收）
 * - 打卡为用户行为级端到端回归
 */

test("创建项目 → 打卡 → 日历今天已打卡", async ({ pageA }) => {
  const projName = `${getRunId()}-打卡`;
  const tz = pickSafeTimezone();

  await pageA.goto("/create-project");
  await pageA.getByPlaceholder("项目名称（1-30 字）").fill(projName);
  await pageA.getByPlaceholder("奖励金额，如：5").fill("0");
  await pageA.getByPlaceholder("惩罚金额（默认 0）").fill("0");
  await pageA.getByRole("button", { name: "创建项目" }).click();

  // 创建成功 redirect 首页
  await pageA.waitForURL("http://localhost:3100/", { timeout: 20_000 });
  const card = pageA.getByRole("link", { name: projName }).first();
  await expect(card).toBeVisible();

  // 边界归一化：项目时区/开始日/状态统一到恒可打卡窗口
  psql(`
begin;
set session_replication_role = replica;
update public.checkin_projects cp
set timezone = '${tz}', starts_at = (now() at time zone '${tz}')::date,
    status = 'active'
where cp.name = '${projName}'
  and cp.owner_id = (select id from auth.users where email = '${E2E_EMAIL_A}');
set session_replication_role = default;
commit;
`);

  // 进入详情（按 href 直接导航）
  const href = await card.getAttribute("href");
  expect(href).toMatch(/\/projects\//);
  await pageA.goto(href!);

  await expect(pageA.getByText("打卡日历")).toBeVisible();

  // 打卡按钮必须可见（不走"未开始"分支）
  const checkinBtn = pageA.getByRole("button", { name: "打卡", exact: true });
  await expect(checkinBtn).toBeVisible({ timeout: 10_000 });

  // 执行打卡
  await checkinBtn.click();
  await expect(pageA.getByText("今日已打卡")).toBeVisible({ timeout: 15_000 });
  await expect(
    pageA.locator('[aria-current="date"]').first(),
  ).toHaveAttribute("aria-label", /已打卡/);
  await expect(pageA.getByText("总打卡 1 次")).toBeVisible();
});
