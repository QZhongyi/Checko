import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 精制插画位（设计稿角色的轻量替身）
 *
 * 设计稿（home-ui-spec.md §19 / draft/首页.png）要求火焰角色、太阳、
 * 空状态植物等卡通资产；在真实 PNG/WebP 资产就位前，用大号 emoji +
 * 柔和渐变底 + 细边框呈现，不再暴露"占位"字样的虚线框。
 *
 * 后续替换路径：将内部实现换成 next/image 静态资源即可，调用方签名不变。
 */
export function IllustrationPlaceholder({
  label,
  emoji,
  className,
  shape = "rounded",
  tone = "green",
}: {
  /** 仅用于无障碍/调试说明，不再直接展示 */
  label: string;
  /** 呈现的 emoji（代替占位文字） */
  emoji: string;
  className?: ClassValue;
  shape?: "rounded" | "circle";
  tone?: "green" | "warm" | "neutral";
}) {
  const toneBg =
    tone === "warm"
      ? "linear-gradient(160deg, #FFF6E0, #FFEFC4)"
      : tone === "neutral"
        ? "linear-gradient(160deg, #F4F6F8, #ECF0F3)"
        : "linear-gradient(160deg, #EDFAF2, #E1F5E9)";

  return (
    <div
      aria-hidden
      role="img"
      aria-label={label}
      className={twMerge(
        clsx(
          "flex items-center justify-center border border-black/[0.03] text-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.03)]",
          shape === "circle" ? "rounded-full" : "rounded-2xl",
          className,
        ),
      )}
      style={{ background: toneBg }}
    >
      <span className="px-2 leading-none">{emoji}</span>
    </div>
  );
}
