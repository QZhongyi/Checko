import { test, expect, psql, getRunId, E2E_EMAIL_A, E2E_EMAIL_B } from "./fixtures";

/**
 * 排行榜 E2E（run_id 隔离夹具）
 * 1. 四个维度切换 + URL 参数 + 本人行 + 团队榜（本轮夹具团队项目）
 * 2. 两好友 0 余额并列第 1（同分同名次）
 * 3. 余额差异降序 + sticky 摘要同步
 * 4. 长榜单下 sticky 本人摘要始终可见且避让底导航
 */

test.describe("排行榜维度与团队榜", () => {
  test("四维度切换 + URL + 本人行 + 团队行", async ({ pageA }) => {
    const teamName = `${getRunId()}-团队`;
    await pageA.goto("/friends?tab=rank");

    const rows = pageA.locator("ul li");
    await expect(rows).toHaveCount(2, { timeout: 10_000 });
    await expect(pageA.getByText("（我）").first()).toBeVisible();

    const dims: [string, string][] = [
      ["累计收入", "earned"],
      ["净金额", "net"],
      ["团队", "team"],
      ["余额", "balance"],
    ];
    for (const [label, dim] of dims) {
      await pageA.getByRole("link", { name: label, exact: true }).click();
      await expect(pageA).toHaveURL(new RegExp(`dim=${dim}`));
    }

    await pageA.getByRole("link", { name: "团队", exact: true }).click();
    const teamRow = pageA.getByRole("listitem").filter({ hasText: teamName });
    await expect(teamRow).toBeVisible({ timeout: 10_000 });
    await expect(teamRow.getByText("2 人团队")).toBeVisible();

    await pageA.getByRole("link", { name: "余额", exact: true }).click();
    await expect(pageA.getByLabel(/我的排名/)).toBeVisible();
  });

  test("两好友 0 余额并列第 1（同分同名次 1、1）", async ({ pageA }) => {
    await pageA.goto("/friends?tab=rank&dim=balance");
    const rows = pageA.locator("ul li");
    await expect(rows).toHaveCount(2, { timeout: 10_000 });
    await expect(rows.nth(0).locator("span").first()).toHaveText("1");
    await expect(rows.nth(1).locator("span").first()).toHaveText("1");
  });

  test("余额差异时按余额降序", async ({ pageA }) => {
    psql(`update public.profiles p set wallet_balance=7 from auth.users u where u.id=p.id and u.email='${E2E_EMAIL_B}';`);
    await pageA.goto("/friends?tab=rank&dim=balance");
    const rows = pageA.locator("ul li");
    await expect(rows).toHaveCount(2, { timeout: 10_000 });
    await expect(rows.nth(0)).toContainText("e2e-b");
    await expect(rows.nth(0).locator("span").first()).toHaveText("1");
    await expect(rows.nth(1)).toContainText("（我）");
    await expect(rows.nth(1).locator("span").first()).toHaveText("2");
    await expect(pageA.getByLabel("我的排名 第 2 名")).toBeVisible();
  });
});

test.describe("sticky 本人摘要", () => {
  test("长榜单下顶部/中部/底部始终可见且避让底导航", async ({ pageA }) => {
    // 夹具：12 个临时好友（余额 120..10 递减），本人与 e2e-b 均 0 元垫底
    // 并列第 13 → 14 行榜单在 Pixel 7 视口（412x915）下溢出
    const token = getRunId();
    const lines = Array.from(
      { length: 12 },
      (_, i) => `e2e-s${i + 1}-${token}@e2e.local.test,e2e-s${i + 1},${120 - i * 10}`,
    );
    const array = lines.map((l) => `'${l}'`).join(",");

    psql(`
begin;
set session_replication_role = replica;
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
select '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
       split_part(u.line, ',', 1), 'x', now(), '{}'::jsonb, '{}'::jsonb, now(), now()
from (select unnest(array[${array}]) as line) u
on conflict do nothing;
insert into public.profiles (id, nickname, wallet_balance)
select au.id, split_part(u.line, ',', 2), split_part(u.line, ',', 3)::int
from (select unnest(array[${array}]) as line) u
join auth.users au on au.email = split_part(u.line, ',', 1)
on conflict do nothing;
insert into public.friendships (user_low_id, user_high_id, requested_by, status)
select least(a.id, b.id), greatest(a.id, b.id), a.id, 'accepted'
from auth.users a
join auth.users b on b.email like 'e2e-s%-${token}@e2e.local.test'
where a.email = '${E2E_EMAIL_A}'
on conflict do nothing;
set session_replication_role = default;
commit;
`);

    try {
      await pageA.goto("/friends?tab=rank&dim=balance");
      const rows = pageA.locator("ul li");
      await expect(rows).toHaveCount(14, { timeout: 10_000 });

      const summary = pageA
        .locator("div.sticky.bottom-24")
        .filter({ has: pageA.getByLabel(/我的排名/) });
      await expect(summary).toBeVisible();
      await expect(summary.getByLabel(/第 13 名/)).toBeVisible();

      const style = await summary.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { position: cs.position, bottom: cs.bottom };
      });
      expect(style.position).toBe("sticky");
      expect(style.bottom).toBe("96px");

      // 顶部 / 中部 / 底部三个滚动位置：摘要都在视口内且不与底导航重叠
      const checkAt = async () => {
        const box = await summary.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.y).toBeGreaterThanOrEqual(0);
        const nav = await pageA.getByLabel("主导航").boundingBox();
        expect(nav).not.toBeNull();
        expect(box!.y + box!.height).toBeLessThanOrEqual(nav!.y + 1);
      };
      await pageA.evaluate(() => window.scrollTo(0, 0));
      await checkAt();
      await pageA.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await checkAt();
      await pageA.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await checkAt();
    } finally {
      psql(`
begin;
set session_replication_role = replica;
delete from public.friendships f
where f.user_low_id in (select id from auth.users where email like 'e2e-s%-${token}@e2e.local.test')
   or f.user_high_id in (select id from auth.users where email like 'e2e-s%-${token}@e2e.local.test');
delete from public.profiles p
where p.id in (select id from auth.users where email like 'e2e-s%-${token}@e2e.local.test');
delete from auth.users u where u.email like 'e2e-s%-${token}@e2e.local.test';
set session_replication_role = default;
commit;
`);
    }
  });
});
