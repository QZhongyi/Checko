"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { rewardLabel } from "@/lib/reward";
import {
  performCheckin,
  revokeCheckin,
  type CheckinActionState,
} from "@/app/actions/checkin";

/**
 * 项目卡片（home-ui-spec.md §7）
 *
 * 通用结构：
 *   Icon | Content(Title/Streak/Progress?) | StatusArea(Reward?/CheckButton/StatusLabel?)
 *
 * 打卡/撤销通过 Server Actions 持久化（create_checkin / revoke_checkin RPC）。
 */
export type HabitCardData = {
  id: string;
  title: string;
  /** 项目图标（emoji；空则用默认） */
  icon: string | null;
  /** 项目主题色（CSS 颜色值；决定 icon 底、streak、checkButton 配色） */
  color: string | null;
  currentStreak: number;
  targetStreak: number;
  completedToday: boolean;
  rewardCoins?: number;
  /** 奖励模式（决定奖励文案口径，默认 every_time） */
  rewardMode?: "every_time" | "every_n" | "completed";
  /** every_n 模式的 N */
  rewardNValue?: number | null;
  /** 今日 active 打卡 id（已完成时必有，供撤销） */
  todayCheckinId: string | null;
  /** 今日打卡是否仍可撤销（未过项目时区截止时间，服务端判定） */
  canRevoke: boolean;
  /** 今日截止时间（ISO 字符串），客户端到点自动隐藏撤销入口 */
  deadlineAt: string;
};

const DEFAULT_THEME_COLOR = "var(--color-primary)";

export function HabitCard({ habit }: { habit: HabitCardData }) {
  const themeColor = habit.color ?? DEFAULT_THEME_COLOR;

  const [checkinState, checkinFormAction] = useActionState<
    CheckinActionState,
    FormData
  >(performCheckin, undefined);
  const [revokeState, revokeFormAction] = useActionState<
    CheckinActionState,
    FormData
  >(revokeCheckin, undefined);
  const errorMsg = checkinState?.error ?? revokeState?.error;

  // 长驻页面跨截止时间时到点隐藏撤销入口（服务端 canRevoke 只是初始快照，
  // 数据库仍是最终权限边界）。expired 初值按客户端时钟判定；props 变化时
  // 在渲染期调整（React 推荐模式），到点翻转只在 setTimeout 回调中发生。
  const [expired, setExpired] = useState(
    () => Date.now() >= new Date(habit.deadlineAt).getTime(),
  );
  const [prevDeadline, setPrevDeadline] = useState(habit.deadlineAt);
  if (prevDeadline !== habit.deadlineAt) {
    setPrevDeadline(habit.deadlineAt);
    // 新打卡产生新截止时间，重置为未过期；是否已过点由下方 effect 判定
    setExpired(false);
  }
  const revocable = habit.canRevoke && !expired;
  useEffect(() => {
    if (expired) return;
    const remaining = new Date(habit.deadlineAt).getTime() - Date.now();
    // 已过点（或时钟偏差）时立即翻转；否则到点翻转
    const timer = setTimeout(
      () => setExpired(true),
      Math.max(remaining, 0),
    );
    return () => clearTimeout(timer);
  }, [habit.deadlineAt, expired]);

  return (
    <article className="flex min-h-[104px] gap-3 rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
      {/* 内容区整体可点，跳转详情页（状态区表单在 Link 外，天然无冒泡问题） */}
      <Link
        href={`/projects/${habit.id}`}
        aria-label={`查看 ${habit.title} 详情`}
        className="flex min-w-0 flex-1 gap-3 rounded-2xl active:bg-black/[0.03]"
      >
      {/* 项目 icon（68×68：项目 icon emoji 或默认，背景带项目色） */}
      <span
        aria-hidden
        className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl text-[34px]"
        style={{
          background: `linear-gradient(160deg, ${themeColor}14, ${themeColor}2E)`,
          border: `1px solid ${themeColor}33`,
        }}
      >
        {habit.icon ?? "📝"}
      </span>

      {/* 内容 */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
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

        {/* 可选 reward（按奖励模式生成准确文案；every_n/completed 不在打卡时即时发奖） */}
        {habit.rewardCoins ? (
          <p className="text-[13px] font-medium text-[var(--color-debt-red)]">
            {rewardLabel(habit.rewardMode ?? "every_time", habit.rewardCoins, habit.rewardNValue ?? null)}
          </p>
        ) : null}

        {/* 错误提示（打卡/撤销共用一个展示位） */}
        {errorMsg ? (
          <p className="text-xs font-medium text-[var(--color-debt-red)]">
            {errorMsg}
          </p>
        ) : null}
      </div>
      </Link>

      {/* 状态区 */}
      <div className="flex flex-col items-end justify-center">
        <CheckButton
          projectId={habit.id}
          themeColor={themeColor}
          completed={habit.completedToday}
          checkinFormAction={checkinFormAction}
        />
        {habit.completedToday ? (
          revocable && habit.todayCheckinId ? (
            <form
              action={revokeFormAction}
              onSubmit={(e) => {
                if (!confirm("撤销后奖励将被回收，确定？")) {
                  e.preventDefault();
                }
              }}
            >
              <input
                type="hidden"
                name="checkinId"
                value={habit.todayCheckinId}
              />
              <input type="hidden" name="projectId" value={habit.id} />
              <span className="mt-1 flex items-center gap-1 text-xs font-medium text-[var(--color-primary)]">
                已完成
                <RevokeButton />
              </span>
            </form>
          ) : (
            <span className="mt-1 text-xs font-medium text-[var(--color-primary)]">
              已完成
            </span>
          )
        ) : null}
      </div>
    </article>
  );
}

/**
 * 打卡按钮（home-ui-spec.md §9）
 *
 * 未完成：白底 + 项目状态色边框 + 项目色 ✓，点击提交 create_checkin
 * 已完成：绿色实心 + 白 ✓（纯展示）
 */
function CheckButton({
  projectId,
  themeColor,
  completed,
  checkinFormAction,
}: {
  projectId: string;
  themeColor: string;
  completed: boolean;
  checkinFormAction: (formData: FormData) => void;
}) {
  if (completed) {
    return (
      <span
        aria-label="已完成"
        className="flex h-[52px] w-[52px] items-center justify-center rounded-full text-white shadow-sm"
        style={{ background: "var(--color-primary)" }}
      >
        <Check size={26} strokeWidth={3} />
      </span>
    );
  }

  return (
    <form action={checkinFormAction}>
      <input type="hidden" name="projectId" value={projectId} />
      <SubmitButton themeColor={themeColor} />
    </form>
  );
}

function SubmitButton({ themeColor }: { themeColor: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
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

function RevokeButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs font-medium text-[var(--color-text-secondary)] underline underline-offset-2 disabled:opacity-60"
    >
      {pending ? "撤销中…" : "撤销"}
    </button>
  );
}
