import Link from "next/link";
import { Home, Users, Trophy, User, Plus } from "lucide-react";

/**
 * 底部导航（home-ui-spec.md §6）
 *
 * 五项：Home / Social / CreateButton / Achievement / Profile
 * - 由页面壳以 fixed 常驻视口底部（含安全区）
 * - 每项带可见短标签；当前页由 active prop 标记
 * - 未实现页面（成就）呈现明确的不可用状态，不用 href="#"
 */
export function BottomNav({
  active = "home",
}: {
  active?: "home" | "friends" | "profile";
}) {
  return (
    <nav
      className="fixed bottom-3 left-1/2 z-20 flex h-[70px] w-[min(430px-2rem,100vw-2rem)] -translate-x-1/2 items-center justify-around rounded-[30px] bg-white px-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
      aria-label="主导航"
    >
      <NavItem label="首页" href="/" active={active === "home"}>
        <Home size={26} fill="currentColor" strokeWidth={0} />
      </NavItem>

      <NavItem label="好友" href="/friends" active={active === "friends"}>
        <Users size={26} />
      </NavItem>

      <CreateButton />

      <NavItem label="成就" disabled>
        <Trophy size={26} />
      </NavItem>

      <NavItem label="我的" href="/profile" active={active === "profile"}>
        <User size={26} />
      </NavItem>
    </nav>
  );
}

function NavItem({
  label,
  active = false,
  disabled = false,
  href,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  href?: string;
  children: React.ReactNode;
}) {
  const textClass = active
    ? "text-[var(--color-primary)]"
    : "text-[var(--color-nav-inactive)]";

  const content = (
    <>
      {active ? (
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFFAF3]">
          <span className="text-[var(--color-primary)]">{children}</span>
        </span>
      ) : (
        <span className={disabled ? "opacity-40" : undefined}>{children}</span>
      )}
      <span className={`text-[11px] font-medium ${textClass} ${disabled ? "opacity-60" : ""}`}>
        {label}
      </span>
    </>
  );

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        title="即将上线"
        className="flex cursor-not-allowed flex-col items-center gap-0.5"
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href ?? "/"}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className="flex flex-col items-center gap-0.5"
    >
      {content}
    </Link>
  );
}

function CreateButton() {
  return (
    <Link
      href="/create-project"
      aria-label="创建项目"
      className="flex flex-col items-center"
      style={{ transform: "translateY(-12px)" }}
    >
      <span
        className="flex h-[68px] w-[68px] items-center justify-center rounded-full ring-4 ring-white"
        style={{
          background: "linear-gradient(180deg, #FFD73B 0%, #FFB800 100%)",
          boxShadow: "0 8px 20px rgba(255,184,0,0.35)",
        }}
      >
        <Plus
          size={40}
          strokeWidth={1.5}
          className="text-white leading-none"
        />
      </span>
    </Link>
  );
}

