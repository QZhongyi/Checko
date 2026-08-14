import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 卡通插画资产占位
 *
 * 设计稿（home-ui-spec.md §19 / draft/首页.png）要求：
 *   火焰角色（4 种表情）、太阳、金币、阅读/健身/团队/水杯项目 icon、
 *   空状态植物。
 *
 * 当前未提供 SVG/Lottie/PNG 资产，用虚线占位框标记位置，
 * 等真实资产就位后替换为对应组件。
 */
export function IllustrationPlaceholder({
  label,
  className,
  shape = "rounded",
}: {
  label: string;
  className?: ClassValue;
  shape?: "rounded" | "circle";
}) {
  return (
    <div
      aria-hidden
      className={twMerge(
        clsx(
          "flex items-center justify-center border border-dashed border-[var(--color-primary)]/30 bg-[var(--color-primary-soft)]/50 text-center text-[10px] leading-tight text-[var(--color-primary)]/70",
          shape === "circle" ? "rounded-full" : "rounded-2xl",
          className,
        ),
      )}
    >
      <span className="px-2">{label}</span>
    </div>
  );
}
