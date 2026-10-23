"use client";

import Image from "next/image";
import { habitIconByKey, matchHabitIcon } from "@/components/home/habit-icons";
import type { CheckinFeedEntry } from "@/lib/friends-feed-data";
import { FeedCardHeader, LikeButton, GROUP_PURPLE } from "./feed-card-shared";

/**
 * 类型 1 打卡卡（好友动态页_prompt §4.4）：项目名/备注/🔥 连续/🪙 奖励；
 * 多人项目打卡并入本卡（紫徽章"今日 x/y 人已打卡"，prompt §六 紫=多人）。
 */
export function FeedCheckinCard({
  entry,
  likeAction,
}: {
  entry: CheckinFeedEntry;
  likeAction: (formData: FormData) => void;
}) {
  const illustration =
    habitIconByKey(entry.project.icon) ?? matchHabitIcon(entry.project.name);

  return (
    <article className="rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
      <FeedCardHeader
        user={entry.user}
        timeLabel={entry.timeLabel}
        projectType={entry.project.type}
      />

      <div className="mt-3 rounded-2xl bg-[#F7F8FA] p-3.5">
        <div className="flex items-center gap-2">
          {illustration ? (
            <Image src={illustration} alt="" width={26} height={26} />
          ) : (
            <span aria-hidden className="text-xl leading-6">
              {entry.project.icon ?? "📝"}
            </span>
          )}
          <p className="text-[15px] font-bold leading-6 text-[var(--color-text-primary-2)]">
            {entry.project.name}
          </p>
        </div>

        {entry.note ? (
          <p className="mt-2 text-sm leading-5 text-[var(--color-text-secondary)]">
            {entry.note}
          </p>
        ) : null}

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {entry.streak > 0 ? (
            <span className="rounded-full bg-[#FFF1E8] px-2.5 py-1 text-[11px] font-bold text-[#E8590C]">
              🔥 连续 {entry.streak} 天
            </span>
          ) : null}
          {entry.reward > 0 ? (
            <span className="rounded-full bg-[#FFF8DB] px-2.5 py-1 text-[11px] font-bold text-[#92400E]">
              🪙 +{entry.reward}
            </span>
          ) : null}
          {entry.project.type === "group" &&
          entry.groupTotal != null &&
          entry.groupTotal > 0 ? (
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-bold"
              style={{ background: "#F3EFFE", color: GROUP_PURPLE }}
            >
              今日 {entry.groupDone ?? 0}/{entry.groupTotal} 人已打卡
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3">
        <LikeButton
          targetType="checkin"
          targetId={entry.targetId}
          liked={entry.likedByMe}
          count={entry.likeCount}
          action={likeAction}
        />
      </div>
    </article>
  );
}
