"use client";

import { useActionState } from "react";
import type { FriendsFeedData } from "@/lib/friends-feed-data";
import {
  nudgeFriendAction,
  toggleActivityLikeAction,
  type FeedInteractionState,
} from "@/app/actions/friend";
import { FeedStatsStrip } from "./feed/feed-stats-strip";
import { FeedCheckinCard } from "./feed/feed-checkin-card";
import { FeedAchievementCard } from "./feed/feed-achievement-card";
import { FeedMissedCard } from "./feed/feed-missed-card";

/**
 * 动态 tab（好友动态页_prompt §一：动态流为主视图）：
 * 统计条 + 三类卡片流；点赞/催打卡经 server action 持久化，
 * revalidate 后服务端状态（liked/nudged）自然回流。
 */
export function FeedTab({
  data,
  hasFriends,
}: {
  data: FriendsFeedData | null;
  hasFriends: boolean;
}) {
  const [likeState, likeAction] = useActionState<
    FeedInteractionState,
    FormData
  >(toggleActivityLikeAction, undefined);
  const [nudgeState, nudgeAction] = useActionState<
    FeedInteractionState,
    FormData
  >(nudgeFriendAction, undefined);
  const actionError = likeState?.error ?? nudgeState?.error;

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-3xl bg-white px-6 py-12 text-center shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
        <p className="text-[15px] font-bold text-[var(--color-text-primary-2)]">
          动态加载失败
        </p>
        <p className="text-sm text-[var(--color-text-secondary)]">
          数据暂时不可用，请稍后刷新重试
        </p>
      </div>
    );
  }

  // 空态（prompt §五-1）：无好友
  if (!hasFriends) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-3xl bg-white px-6 py-12 text-center shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
        <span aria-hidden className="text-5xl">
          🤝
        </span>
        <p className="mt-1 text-[15px] font-bold text-[var(--color-text-primary-2)]">
          还没有好友
        </p>
        <p className="text-sm text-[var(--color-text-secondary)]">
          添加好友，一起互相监督打卡吧
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <FeedStatsStrip stats={data.stats} />

      {actionError ? (
        <p className="text-xs font-medium text-[var(--color-debt-red)]">
          {actionError}
        </p>
      ) : null}

      {data.entries.length === 0 ? (
        // 空态（prompt §五-2）：有好友但无动态
        <div className="flex flex-col items-center gap-2 rounded-3xl bg-white px-6 py-12 text-center shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
          <span aria-hidden className="text-5xl">
            🌱
          </span>
          <p className="mt-1 text-[15px] font-bold text-[var(--color-text-primary-2)]">
            好友还没开始打卡
          </p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            去催催 ta 吧
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.entries.map((entry) => {
            if (entry.kind === "checkin") {
              return (
                <FeedCheckinCard
                  key={`checkin:${entry.targetId}`}
                  entry={entry}
                  likeAction={likeAction}
                />
              );
            }
            if (entry.kind === "achievement") {
              return (
                <FeedAchievementCard
                  key={`achievement:${entry.targetId}`}
                  entry={entry}
                  likeAction={likeAction}
                />
              );
            }
            return (
              <FeedMissedCard
                key={`missed:${entry.user.userId}:${entry.project.id}`}
                entry={entry}
                nudgeAction={nudgeAction}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
