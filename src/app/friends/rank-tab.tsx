import {
  leaderboardMetric,
  type LeaderboardDimension,
  type LeaderboardEntry,
} from "@/lib/friend-data";
import { CoinIcon } from "@/components/ui/coin-icon";
import {
  RankLoadFailedCard,
  amountColor,
  competitionRanks,
  rankBadgeColor,
} from "./rank-shared";

/**
 * 好友排行榜 tab（server component，纯展示）：
 * DAL 已按所选维度排序，前端编号并高亮本人行；
 * sticky 本人排名摘要（bottom-24 避让 fixed 底导航）。
 */
export function RankTab({
  entries,
  myUserId,
  dimension,
  loadFailed,
}: {
  entries: LeaderboardEntry[];
  myUserId: string;
  dimension: LeaderboardDimension;
  loadFailed: boolean;
}) {
  if (loadFailed) {
    return <RankLoadFailedCard label="排行榜" />;
  }

  const ranks = competitionRanks(entries.map((e) => leaderboardMetric(e, dimension)));
  const myIndex = entries.findIndex((e) => e.userId === myUserId);
  const myEntry = myIndex >= 0 ? entries[myIndex] : null;
  const myMetric = myEntry ? leaderboardMetric(myEntry, dimension) : 0;
  const myRank = myIndex >= 0 ? ranks[myIndex] : 0;

  return (
    <>
      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
        <ul>
        {entries.map((entry, index) => {
          const isMe = entry.userId === myUserId;
          const metric = leaderboardMetric(entry, dimension);
          const rank = ranks[index];
          return (
            <li
              key={entry.userId}
              className={`flex items-center gap-3 px-4 py-3.5 ${
                index > 0 ? "border-t border-[#F3F4F6]" : ""
              } ${isMe ? "bg-[#EFFAF3]" : ""}`}
            >
              <span
                aria-label={`第 ${rank} 名`}
                className={`w-6 shrink-0 text-center text-[15px] font-bold ${rankBadgeColor(rank)}`}
              >
                {rank}
              </span>
              <span
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFFAF3] text-sm font-bold text-[var(--color-primary)]"
              >
                {(entry.nickname ?? "?").slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-[var(--color-text-primary-2)]">
                {entry.nickname ?? "未知用户"}
                {isMe ? (
                  <span className="ml-1 text-xs font-medium text-[var(--color-primary)]">
                    （我）
                  </span>
                ) : null}
              </span>
              <span
                className={`flex shrink-0 items-center gap-1 text-[15px] font-bold ${amountColor(metric)}`}
              >
                <CoinIcon size={14} /> {metric}
              </span>
            </li>
          );
        })}
      </ul>
    </div>

    {/* 位于列表卡片之外（不受 overflow-hidden 裁剪） */}
    {myEntry ? (
      <div className="sticky bottom-24 mt-2 flex items-center gap-3 rounded-2xl bg-[#EFFAF3] px-4 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
        <span
          aria-label={`我的排名 第 ${myRank} 名`}
          className="w-6 shrink-0 text-center text-[15px] font-bold text-[var(--color-text-secondary)]"
        >
          {myRank}
        </span>
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[var(--color-primary)]"
        >
          {(myEntry.nickname ?? "?").slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-[var(--color-text-primary-2)]">
          {myEntry.nickname ?? "未知用户"}
          <span className="ml-1 text-xs font-medium text-[var(--color-primary)]">
            （我）
          </span>
        </span>
        <span
          className={`flex shrink-0 items-center gap-1 text-[15px] font-bold ${amountColor(myMetric)}`}
        >
          <CoinIcon size={14} /> {myMetric}
        </span>
      </div>
    ) : null}
    </>
  );
}
