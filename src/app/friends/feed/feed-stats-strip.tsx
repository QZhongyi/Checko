import { CoinIcon } from "@/components/ui/coin-icon";
import type { FeedStats } from "@/lib/friends-feed-data";

/** 统计条（好友动态页_prompt §4.3）：今日好友 x/y（迷你进度条）/ 我的连续 / 我的余额 */
export function FeedStatsStrip({ stats }: { stats: FeedStats }) {
  const pct =
    stats.friendsTotal > 0
      ? Math.min(
          100,
          Math.round((stats.friendsChecked / stats.friendsTotal) * 100),
        )
      : 0;

  return (
    <section
      aria-label="好友动态统计"
      className="grid grid-cols-3 gap-3"
    >
      <div className="rounded-2xl bg-white p-3 shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
        <p className="text-xs font-medium text-[var(--color-text-secondary)]">
          今日好友
        </p>
        <p className="mt-1 text-[16px] font-bold leading-6 text-[var(--color-text-primary-2)]">
          {stats.friendsChecked}/{stats.friendsTotal}
        </p>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#ECEEEF]">
          <div
            className="h-full rounded-full bg-[var(--color-primary)]"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-3 shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
        <p className="text-xs font-medium text-[var(--color-text-secondary)]">
          我的连续
        </p>
        <p className="mt-1 text-[16px] font-bold leading-6 text-[var(--color-text-primary-2)]">
          🔥 {stats.myStreak}
        </p>
        <p className="mt-1.5 text-[11px] font-medium text-[var(--color-text-secondary)]">
          天
        </p>
      </div>

      <div className="rounded-2xl bg-white p-3 shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
        <p className="text-xs font-medium text-[var(--color-text-secondary)]">
          我的余额
        </p>
        <p className="mt-1 flex items-center gap-1 text-[16px] font-bold leading-6 text-[var(--color-text-primary-2)]">
          {stats.myBalance} <CoinIcon size={13} />
        </p>
        <p className="mt-1.5 text-[11px] font-medium text-[var(--color-text-secondary)]">
          小荷包
        </p>
      </div>
    </section>
  );
}
