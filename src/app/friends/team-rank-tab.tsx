import type { TeamLeaderboardEntry } from "@/lib/friend-data";
import { CoinIcon } from "@/components/ui/coin-icon";
import {
  RankLoadFailedCard,
  amountColor,
  competitionRanks,
  rankBadgeColor,
} from "./rank-shared";

/**
 * 团队排行榜 tab（server component，纯展示）：
 * 我参与的多人项目按团队整体余额排序（DAL 排序后前端仅编号展示）。
 */
export function TeamRankTab({
  entries,
  loadFailed,
}: {
  entries: TeamLeaderboardEntry[];
  loadFailed: boolean;
}) {
  if (loadFailed) {
    return <RankLoadFailedCard label="团队排行榜" />;
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-3xl bg-white px-6 py-10 text-center shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
        <p className="text-[15px] font-bold text-[var(--color-text-primary-2)]">
          还没有团队项目
        </p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          创建多人打卡项目后，这里会展示团队余额排行
        </p>
      </div>
    );
  }

  const ranks = competitionRanks(entries.map((e) => e.teamBalance));

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
      <ul>
        {entries.map((entry, index) => {
          const rank = ranks[index];
          return (
            <li
              key={entry.projectId}
              className={`flex items-center gap-3 px-4 py-3.5 ${
                index > 0 ? "border-t border-[#F3F4F6]" : ""
              }`}
            >
              <span
                aria-label={`第 ${rank} 名`}
                className={`w-6 shrink-0 text-center text-[15px] font-bold ${rankBadgeColor(rank)}`}
              >
                {rank}
              </span>
              <span
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#EFFAF3] text-lg"
              >
                {entry.projectIcon ?? "🎯"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-bold text-[var(--color-text-primary-2)]">
                  {entry.projectName}
                </span>
                <span className="block text-xs text-[var(--color-text-secondary)]">
                  {entry.memberCount} 人团队
                </span>
              </span>
              <span
                className={`flex shrink-0 items-center gap-1 text-[15px] font-bold ${amountColor(entry.teamBalance)}`}
              >
                <CoinIcon size={14} /> {entry.teamBalance}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
