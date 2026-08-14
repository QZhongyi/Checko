import Link from "next/link";

/**
 * 底部导航（home-ui-spec.md §6）
 *
 * 五项：Home（active）/ Social / CreateButton / Achievement / Profile
 * EMPTY 状态也保留 BottomNav（§13）。
 *
 * 未实现的页面用 `#` 占位（点击不跳转，避免 404）。
 */
export function BottomNav() {
  return (
    <nav
      className="sticky bottom-3 z-20 mx-4 flex h-[78px] items-center justify-around rounded-[30px] bg-white px-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
      aria-label="主导航"
    >
      {/* Home（active） */}
      <NavItem label="首页" active>
        <HomeIcon />
      </NavItem>

      {/* 社交 */}
      <NavItem label="好友">
        <SocialIcon />
      </NavItem>

      {/* 中央 Plus */}
      <CreateButton />

      {/* 成就 */}
      <NavItem label="成就">
        <TrophyIcon />
      </NavItem>

      {/* 我的 */}
      <NavItem label="我的">
        <UserIcon />
      </NavItem>
    </nav>
  );
}

function NavItem({
  label,
  active = false,
  href = "#",
  children,
}: {
  label: string;
  active?: boolean;
  href?: string;
  children: React.ReactNode;
}) {
  // active 状态时，把 icon 包到浅绿色圆角里
  const inner = active ? (
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFFAF3]">
      <span className="text-[var(--color-primary)]">{children}</span>
    </span>
  ) : (
    <span className="text-[var(--color-nav-inactive)]">{children}</span>
  );

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className="flex flex-col items-center gap-0.5"
    >
      {inner}
    </Link>
  );
}

function CreateButton() {
  return (
    <Link
      href="#"
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
        <span className="text-[40px] font-light leading-none text-white">
          +
        </span>
      </span>
    </Link>
  );
}

/* 图标（lucide-react 简单替代） */
function HomeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5z"
        fill="currentColor"
      />
    </svg>
  );
}
function SocialIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="11" r="2.8" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3 20c0-3 2.7-5 6-5s6 2 6 5M14 20c0-2 1.5-4 4-4s4 2 4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function TrophyIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 4h10v3a5 5 0 0 1-10 0V4zM5 5H3v2a3 3 0 0 0 3 3M19 5h2v2a3 3 0 0 1-3 3M9 14h6l1 4h-3l-.5 2h-2L10 18H8l1-4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4 21c0-4 4-6 8-6s8 2 8 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
