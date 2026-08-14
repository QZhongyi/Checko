"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { IllustrationPlaceholder } from "./illustration";

/**
 * 项目卡片（home-ui-spec.md §7）
 *
 * 通用结构：
 *   Icon | Content(Title/Streak/Progress?) | StatusArea(Reward?/CheckButton/StatusLabel?)
 *
 * CheckButton 点击有反馈但不持久化（数据层接入前的占位）。
 */
export type HabitCardData = {
  id: string;
  title: string;
  // 主题色（purple/green/orange/blue），决定 icon、streak、checkButton 配色
  theme: "purple" | "green" | "orange" | "blue";
  currentStreak: number;
  targetStreak: number;
  completedToday: boolean;
  rewardCoins?: number;
};

const THEME_COLORS: Record<HabitCardData["theme"], string> = {
  purple: "var(--color-purple)",
  green: "var(--color-primary)",
  orange: "var(--color-orange)",
  blue: "var(--color-water-blue)",
};

export function HabitCard({ habit }: { habit: HabitCardData }) {
  const themeColor = THEME_COLORS[habit.theme];

  return (
    <article className="flex min-h-[104px] gap-3 rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
      {/* 项目 icon（占位 68×68 圆角 16） */}
      <IllustrationPlaceholder
        label={habit.title.slice(0, 4) || "项目"}
        className="h-[68px] w-[68px] shrink-0 rounded-2xl"
      />

      {/* 内容 */}
      <div className="flex flex-1 flex-col gap-1">
        <h3 className="text-[17px] font-bold leading-6 text-[var(--color-text-primary-2)]">
          {habit.title}
        </h3>
        <p
          className="text-sm font-medium leading-5"
          style={{ color: themeColor }}
        >
          连续 {habit.currentStreak}/{habit.targetStreak} 天
        </p>

        {/* 进度条（按 currentStreak/targetStreak） */}
        <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-[#ECEEEF]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${habit.targetStreak > 0 ? Math.min(100, (habit.currentStreak / habit.targetStreak) * 100) : 0}%`,
              background: themeColor,
            }}
          />
        </div>

        {/* 可选 reward */}
        {habit.rewardCoins && (
          <p className="text-[13px] font-medium text-[var(--color-debt-red)]">
            还债 +{habit.rewardCoins} 🪙
          </p>
        )}
      </div>

      {/* 状态区 */}
      <div className="flex flex-col items-end justify-center">
        <CheckButton
          themeColor={themeColor}
          completed={habit.completedToday}
        />
        {habit.completedToday && (
          <span className="mt-1 text-xs font-medium text-[var(--color-primary)]">
            已完成
          </span>
        )}
      </div>
    </article>
  );
}

/**
 * 打卡按钮（home-ui-spec.md §9）
 *
 * 未完成：白底 + 项目状态色边框 + 项目色 ✓
 * 已完成：项目色（或绿色）实心 + 白 ✓
 *
 * 点击有反馈（pending 短暂旋转），但**不持久化**——
 * 当前没有 create_checkin 调用，纯交互占位。
 */
function CheckButton({
  themeColor,
  completed,
}: {
  themeColor: string;
  completed: boolean;
}) {
  const [pending, setPending] = useState(false);

  function handleClick() {
    if (pending || completed) return;
    setPending(true);
    // 模拟 server action 延迟。真实接入时改为调 create_checkin
    setTimeout(() => setPending(false), 900);
  }

  if (completed) {
    return (
      <button
        type="button"
        aria-label="已完成"
        className="flex h-[52px] w-[52px] items-center justify-center rounded-full text-white shadow-sm"
        style={{ background: "var(--color-primary)" }}
      >
        <Check size={26} strokeWidth={3} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label="打卡"
      className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white transition active:scale-90 disabled:opacity-60"
      style={{ border: `2px solid ${themeColor}`, color: themeColor }}
    >
      {pending ? (
        <Loader2 size={22} className="animate-spin" />
      ) : (
        <Check size={24} strokeWidth={3} />
      )}
    </button>
  );
}
