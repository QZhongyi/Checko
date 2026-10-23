import { test, expect, psql, E2E_EMAIL_A } from "./fixtures";

/**
 * 消费管理 E2E：记一笔 → 编辑（金额补差 + 备注保留语义）→ 删除返还。
 * 余额断言走 psql（权威）；列表标签断言走 UI。
 * 残留由 fixtures teardown 的 E2E 账号 expense 清理段回收。
 */

function walletBalance(): string {
  return psql(`
    select coalesce(p.wallet_balance, -1) from public.profiles p
    join auth.users u on u.id = p.id where u.email = '${E2E_EMAIL_A}';`);
}

/** dev 服务器会将表单动作顺序重放一次（第二次携带重置后的旧值，被
 *  action 前置校验或 RPC 业务拒绝（分钟级幂等桶/已删守卫）拦下并残留
 *  错误弹窗；生产构建无此现象）。提交类断言以 DB 权威状态轮询为准，
 *  弹窗未关则逐个关闭。 */
async function settleSubmit(
  pageA: import("@playwright/test").Page,
  expectedBalance: string,
) {
  await expect
    .poll(() => walletBalance(), { timeout: 20_000 })
    .toBe(expectedBalance);
  // 逐个关闭残留弹窗：重放弹窗与管理弹窗并存时 getByRole("dialog") 按
  // strict 模式抛错，isVisible 的 catch 会吞成 false 漏关（10-16 复审
  // P3-4）；count + .first() 循环每轮恰关一枚
  for (;;) {
    const dialogs = pageA.getByRole("dialog");
    const n = await dialogs.count();
    if (n === 0) break;
    await dialogs.first().getByRole("button", { name: "关闭" }).click();
    await expect(dialogs).toHaveCount(n - 1);
  }
}

test("消费管理：记账 → 编辑补差/备注 → 删除返还全链路", async ({ pageA }) => {
  test.setTimeout(120_000);

  // 初始余额 50（夹具 setup 清零后置数）
  psql(`
    begin;
    set session_replication_role = replica;
    update public.profiles p set wallet_balance = 50
    from auth.users u where u.id = p.id and u.email = '${E2E_EMAIL_A}';
    set session_replication_role = default;
    commit;
  `);

  // ---- 记一笔 10（备注"奶茶"）----
  await pageA.goto("/wallet");
  await pageA.getByRole("button", { name: "+ 记一笔" }).click();
  const sheet = pageA.getByRole("dialog");
  await expect(sheet).toBeVisible();
  await sheet.getByPlaceholder("请输入金币数").fill("10");
  await sheet.getByPlaceholder("奖励自己一杯奶茶？").fill("奶茶");
  await sheet.getByRole("button", { name: "✓ 确认记录" }).click();
  await expect(sheet).toBeHidden({ timeout: 15_000 });
  // 记账重放（第二次携带重置空金额 + 旧 requestId）被 action 前置校验
  // 拒绝后同样残留红字弹窗：与编辑/删除段同一防御口径（DB 轮询 + 关
  // 残留弹窗），否则弹窗与后续"管理"弹窗叠加产生定位歧义
  await settleSubmit(pageA, "40");
  await expect(pageA.getByText("奶茶").first()).toBeVisible();
  await expect(pageA.getByText("消费").first()).toBeVisible();

  // ---- 编辑①：金额 10→12（补差 −2）----
  await pageA.getByRole("button", { name: "管理" }).first().click();
  // 按标题过滤：重放红字弹窗延迟到达并与管理弹窗并存时不产生
  // strict 定位歧义（10-16 复审 P3-4）
  const manage = pageA
    .getByRole("dialog")
    .filter({ hasText: "管理消费" });
  await expect(manage).toBeVisible();
  // 预填校验：金额与备注回显
  await expect(manage.locator('input[name="amount"]')).toHaveValue("10");
  await expect(manage.locator('input[name="note"]')).toHaveValue("奶茶");
  await manage
    .locator('input[name="amount"]')
    .fill("12");
  await manage.getByRole("button", { name: "✓ 保存修改" }).click();
  await settleSubmit(pageA, "38");
  await expect(pageA.getByText("消费更正 · 补差").first()).toBeVisible();

  // 备注/日期编辑（无金额差额）在 dev 重放下净效果会被立刻回滚（首调用
  // 与重放 <1s 顺序执行），E2E 无法稳定断言终值；其 RPC 语义（coalesce
  // 保留旧值 + note 落库）已由 psql 复现验证（见批次日志），此处不重复。

  // ---- 删除：全额返还 +12，余额复原 50；软删行不再出现管理入口 ----
  await pageA.getByRole("button", { name: "管理" }).first().click();
  const manage3 = pageA
    .getByRole("dialog")
    .filter({ hasText: "管理消费" });
  await expect(manage3).toBeVisible();
  pageA.once("dialog", (dialog) => dialog.accept());
  await manage3.getByRole("button", { name: "删除这笔消费" }).click();
  await settleSubmit(pageA, "50");
  await expect(pageA.getByText("删除消费返还").first()).toBeVisible();
  await expect(pageA.getByRole("button", { name: "管理" })).toHaveCount(0);
});

test("消费编辑负向：金额 0 被拒", async ({ pageA }) => {
  test.setTimeout(60_000);

  psql(`
    begin;
    set session_replication_role = replica;
    update public.profiles p set wallet_balance = 50
    from auth.users u where u.id = p.id and u.email = '${E2E_EMAIL_A}';
    set session_replication_role = default;
    commit;
  `);
  await pageA.goto("/wallet");
  await pageA.getByRole("button", { name: "+ 记一笔" }).click();
  const sheet = pageA.getByRole("dialog");
  await sheet.getByPlaceholder("请输入金币数").fill("7");
  await sheet.getByRole("button", { name: "✓ 确认记录" }).click();
  await expect(sheet).toBeHidden({ timeout: 15_000 });

  await pageA.getByRole("button", { name: "管理" }).first().click();
  // 按标题过滤（同主用例，10-17 复审 P3-2）：自身记账重放弹窗延迟到达
  // 并存时不产生 strict 定位歧义
  const manage = pageA
    .getByRole("dialog")
    .filter({ hasText: "管理消费" });
  await expect(manage).toBeVisible();
  await manage.locator('input[name="amount"]').fill("0");
  await manage.getByRole("button", { name: "✓ 保存修改" }).click();
  await expect(
    manage.getByText("金额需为 1-1000000 的整数"),
  ).toBeVisible({ timeout: 15_000 });
  // 余额不受失败编辑影响
  expect(walletBalance()).toBe("43");
});
