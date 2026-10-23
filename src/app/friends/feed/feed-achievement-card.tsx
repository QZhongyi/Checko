"use client";

import type { AchievementFeedEntry } from "@/lib/friends-feed-data";
import { FeedCardHeader, LikeButton } from "./feed-card-shared";

/**
 * 类型 2 里程碑卡（好友动态页_prompt §4.4）：绿→黄渐变底 + 🏆 大徽章；
 * achievements 行无项目关联，副标题不带项目名；粒子/彩带装饰留动效批。
 */
export function FeedAchievementCard({
  entry,
  likeAction,
}: {
  entry: AchievementFeedEntry;
  likeAction: (formData: FormData) => void;
}) {
  return (
    <article className="rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
      <FeedCardHeader
        user={entry.user}
        timeLabel={entry.timeLabel}
        projectType={null}
      />

      <div
        className="mt-3 rounded-2xl p-4"
        style={{ background: "linear-gradient(135deg, #58CC02, #FFC800)" }}
      >
        <p aria-hidden className="text-[32px] leading-10">
          🏆
        </p>
        <p className="mt-1 text-[15px] font-bold leading-6 text-white">
          里程碑达成！连续打卡 {entry.value} 天 🔥
        </p>
      </div>

      <div className="mt-3">
        <LikeButton
          targetType="achievement"
          targetId={entry.targetId}
          liked={entry.likedByMe}
          count={entry.likeCount}
          action={likeAction}
        />
      </div>
    </article>
  );
}
