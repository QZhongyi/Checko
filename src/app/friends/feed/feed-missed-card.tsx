"use client";

import { useFormStatus } from "react-dom";
import { Bell, Loader2 } from "lucide-react";
import type { MissedFeedEntry } from "@/lib/friends-feed-data";
import { FeedCardHeader, NUDGE_ORANGE } from "./feed-card-shared";

/**
 * 类型 4 缺卡提醒卡（好友动态页_prompt §4.4）：muted 风格 + 橙色底内容卡 +
 * 全宽橙色"提醒 TA 打卡"（#FF9500 专属催促语义）；已提醒态 24h 冷却内灰化。
 * 隐藏点赞按钮（prompt：不能给缺卡点赞）。
 */
export function FeedMissedCard({
  entry,
  nudgeAction,
}: {
  entry: MissedFeedEntry;
  nudgeAction: (formData: FormData) => void;
}) {
  return (
    <article className="rounded-3xl bg-white p-4 opacity-90 shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
      <FeedCardHeader
        user={entry.user}
        timeLabel="今天"
        projectType={entry.project.type}
        muted
      />

      <div className="mt-3 rounded-2xl p-3.5" style={{ background: "#FFF4E5" }}>
        <p className="text-[15px] font-bold leading-6 text-[#7A4100]">
          {entry.user.nickname ?? "好友"} 今日还未打卡「{entry.project.name}」
        </p>
        <p className="mt-1 text-xs leading-5 text-[#9A6B3D]">
          ta 可能需要你的鼓励
        </p>
      </div>

      {entry.nudgedByMe ? (
        <p className="mt-3 rounded-full bg-[#F3F4F6] py-2.5 text-center text-[13px] font-bold text-[var(--color-text-secondary)]">
          已提醒 ✓ 明天再来看看
        </p>
      ) : (
        <form action={nudgeAction} className="mt-3">
          <input type="hidden" name="userId" value={entry.user.userId} />
          <NudgeSubmitButton />
        </form>
      )}
    </article>
  );
}

function NudgeSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-1.5 rounded-full py-2.5 text-[13px] font-bold text-white transition active:scale-[0.98] disabled:opacity-70"
      style={{ background: NUDGE_ORANGE }}
    >
      {pending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Bell size={16} />
      )}
      {pending ? "提醒中…" : "提醒 TA 打卡"}
    </button>
  );
}
