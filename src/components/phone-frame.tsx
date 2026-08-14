import { twMerge } from "tailwind-merge";
import clsx, { type ClassValue } from "clsx";

/**
 * 移动端 App 容器（响应式）
 *
 * - 移动端（< 480px）：撑满整个视口
 * - 桌面端（≥ 480px）：固定 phone 尺寸（max 430×900），水平居中，
 *   两侧用淡薄荷渐变背景填充
 *
 * variant:
 *   - "auth"（默认）：登录/注册页背景渐变
 *   - "home"：首页背景渐变（home-ui-spec.md §2）
 */
export function PhoneFrame({
  children,
  variant = "auth",
  className,
}: {
  children: React.ReactNode;
  variant?: "auth" | "home";
  className?: ClassValue;
}) {
  const innerBg =
    variant === "home"
      ? // 首页：F2FCF6 → F8FCFA → FFFFFF
        "linear-gradient(180deg, #F2FCF6 0%, #F8FCFA 30%, #FFFFFF 100%)"
      : // Auth：F1FBF5 → F7FCF9 → FFFFFF
        "linear-gradient(180deg, #F1FBF5 0%, #F7FCF9 32%, #FFFFFF 100%)";

  return (
    <div className="flex min-h-dvh w-full justify-center bg-[var(--color-primary-soft)]/40 sm:bg-gradient-to-b sm:from-[#E8F7EF] sm:via-[#F1FBF5] sm:to-white">
      <div
        className={twMerge(
          clsx(
            "relative flex w-full max-w-[430px] flex-col shadow-[0_0_60px_rgba(34,197,94,0.08)] sm:my-4 sm:min-h-[calc(100dvh-2rem)] sm:rounded-[36px] sm:ring-1 sm:ring-black/[0.04]",
            className,
          ),
        )}
        style={{ background: innerBg }}
      >
        {children}
      </div>
    </div>
  );
}
