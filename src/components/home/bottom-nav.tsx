import Link from "next/link";

/**
 * 底部导航（home-ui-spec.md §6）
 *
 * 五项：Home（active）/ Social / CreateButton / Achievement / Profile
 * - 由页面壳以 sticky 常驻视口底部（含安全区）
 * - 每项带可见短标签
 * - 未实现页面（好友/成就/我的）呈现明确的不可用状态，不用 href="#"
 */
export function BottomNav() {
  return (
    <nav
      className="fixed bottom-3 left-1/2 z-20 flex h-[70px] w-[min(430px-2rem,100vw-2rem)] -translate-x-1/2 items-center justify-around rounded-[30px] bg-white px-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
      aria-label="主导航"
    >
      <NavItem label="首页" href="/" active>
        <HomeIcon />
      </NavItem>

      <NavItem label="好友" disabled>
        <SocialIcon />
      </NavItem>

      <CreateButton />

      <NavItem label="成就" disabled>
        <TrophyIcon />
      </NavItem>

      <NavItem label="我的" disabled>
        <UserIcon />
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
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5z"
        fill="currentColor"
      />
    </svg>
  );
}
function SocialIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
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
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
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
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
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
