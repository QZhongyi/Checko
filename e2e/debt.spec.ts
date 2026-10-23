import { test, expect, psql, getRunId, E2E_EMAIL_A, pickSafeTimezone } from "./fixtures";

/**
 * 首页负债态 E2E：用真实用户流构造负余额（打卡 +5 → 记一笔 4 → 撤销
 * 回收奖励 −5 → 余额 −4；需求允许撤销推负），断言首页 DEBT 展示
 * （pill 待偿还 / hero 警示条 / 负债信息条 / "还债 +N" 文案）；
 * 再打卡回血（+5 → 余额 1）断言负债展示全部回落。
 * debt_records 仅审计豁免额（需求 §10.18），不参与本链路。
 */

function walletBalance(): string {
  return psql(`
    select coalesce(p.wallet_balance, -1) from public.profiles p
    join auth.users u on u.id = p.id where u.email = '${E2E_EMAIL_A}';`);
}

test("负债态：撤销致负 → 首页 DEBT 展示 → 打卡回血回落", async ({ pageA }) => {
  test.setTimeout(150_000);

  const projName = `${getRunId()}-负债`;
  const tz = pickSafeTimezone();

  // 建个人项目（奖励 5 / 惩罚 0，every_time 默认）+ 边界归一化（学 checkin.spec）
  await pageA.goto("/create-project");
  await pageA.getByPlaceholder("项目名称（1-30 字）").fill(projName);
  await pageA.getByPlaceholder("奖励金额，如：5").fill("5");
  await pageA.getByPlaceholder("惩罚金额（默认 0）").fill("0");
  await pageA.getByRole("button", { name: "创建项目" }).click();
  await pageA.waitForURL("http://localhost:3100/", { timeout: 20_000 });

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

  const projCard = () => pageA.locator("article").filter({ hasText: projName });

  // ---- 打卡 +5（every_time 即时发奖）----
  await pageA.goto("/");
  await expect(projCard()).toBeVisible();
  await projCard().getByRole("button", { name: "打卡" }).click();
  await expect.poll(walletBalance, { timeout: 20_000 }).toBe("5");

  // ---- 记一笔 4 → 余额 1 ----
  await pageA.goto("/wallet");
  await pageA.getByRole("button", { name: "+ 记一笔" }).click();
  const sheet = pageA.getByRole("dialog");
  await sheet.getByPlaceholder("请输入金币数").fill("4");
  await sheet.getByRole("button", { name: "✓ 确认记录" }).click();
  await expect(sheet).toBeHidden({ timeout: 15_000 });
  await expect.poll(walletBalance, { timeout: 20_000 }).toBe("1");

  // ---- 撤销打卡回收 5 → 余额 −4（撤销允许推负）----
  await pageA.goto("/");
  pageA.once("dialog", (dialog) => dialog.accept());
  await projCard().getByRole("button", { name: "撤销" }).click();
  await expect.poll(walletBalance, { timeout: 20_000 }).toBe("-4");

  // ---- 首页负债态展示 ----
  await pageA.goto("/");
  const pill = pageA.getByRole("link", { name: "查看小荷包" });
  await expect(pill).toContainText("待偿还");
  await expect(pill).toContainText("4");
  await expect(pageA.getByText("小荷包处于负债态，打卡回血吧")).toBeVisible();
  await expect(pageA.getByText("💨")).toBeVisible();
  await expect(pageA.getByText("当前待偿还")).toBeVisible();
  await expect(pageA.getByText("打卡赚取金币即可偿还")).toBeVisible();
  await expect(pageA.getByRole("link", { name: "了解 ›" })).toBeVisible();
  await expect(projCard()).toContainText("还债 +5");

  // ---- 打卡回血 +5 → 余额 1，负债展示回落 ----
  await projCard().getByRole("button", { name: "打卡" }).click();
  await expect.poll(walletBalance, { timeout: 20_000 }).toBe("1");
  await pageA.goto("/");
  await expect(pill).not.toContainText("待偿还");
  await expect(pageA.getByText("小荷包处于负债态，打卡回血吧")).toHaveCount(0);
  await expect(pageA.getByText("当前待偿还")).toHaveCount(0);
  await expect(projCard()).toContainText("每次 +5");
  await expect(projCard()).not.toContainText("还债");
});
