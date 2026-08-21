import type { LeaderboardEntry } from "@/lib/friend-data";

/**
 * 好友排行榜 tab（server component，纯展示）：
 * DAL 已按余额排序（00042：RPC 的 ORDER BY 不是公共合同），
 * 前端编号并高亮本人行。private 好友被 RPC 过滤，剩本人是正常态。
 */
export function RankTab({
  entries,
  myUserId,
  loadFailed,
}: {
  entries: LeaderboardEntry[];
  myUserId: string;
  loadFailed: boolean;
}) {
  if (loadFailed) {
    return (
      <div className="rounded-3xl bg-white px-6 py-10 text-center shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
        <p className="text-[15px] font-bold text-[var(--color-text-primary-2)]">
          排行榜加载失败
        </p>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          请稍后刷新重试
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
      <ul>
        {entries.map((entry, index) => {
          const isMe = entry.userId === myUserId;
          const rank = index + 1;
          return (
            <li
              key={entry.userId}
              className={`flex items-center gap-3 px-4 py-3.5 ${
                rank > 1 ? "border-t border-[#F3F4F6]" : ""
              } ${isMe ? "bg-[#EFFAF3]" : ""}`}
            >
              <span
                aria-label={`第 ${rank} 名`}
                className={`w-6 shrink-0 text-center text-[15px] font-bold ${
                  rank === 1
                    ? "text-[#F5A623]"
                    : rank === 2
                      ? "text-[#9CA3AF]"
                      : rank === 3
                        ? "text-[#C77B42]"
                        : "text-[var(--color-text-secondary)]"
                }`}
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
                className={`shrink-0 text-[15px] font-bold ${
                  entry.walletBalance >= 0
                    ? "text-[var(--color-text-primary-2)]"
                    : "text-[var(--color-debt-red)]"
                }`}
              >
                🪙 {entry.walletBalance}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
