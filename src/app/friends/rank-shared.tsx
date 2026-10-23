/**
 * 好友榜 / 团队榜共享的排名展示原语：
 * 失败态卡片、同分同名次计算、名次配色、金额配色。
 */

export function RankLoadFailedCard({ label }: { label: string }) {
  return (
    <div className="rounded-3xl bg-white px-6 py-10 text-center shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
      <p className="text-[15px] font-bold text-[var(--color-text-primary-2)]">
        {label}加载失败
      </p>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        请稍后刷新重试
      </p>
    </div>
  );
}

/** 同分同名次（1、1、3）：与前一项 metric 相同则沿用其名次 */
export function competitionRanks(metrics: number[]): number[] {
  const ranks: number[] = [];
  for (let i = 0; i < metrics.length; i++) {
    ranks[i] = i > 0 && metrics[i - 1] === metrics[i] ? ranks[i - 1] : i + 1;
  }
  return ranks;
}

export function rankBadgeColor(rank: number): string {
  if (rank === 1) return "text-[#F5A623]";
  if (rank === 2) return "text-[#9CA3AF]";
  if (rank === 3) return "text-[#C77B42]";
  return "text-[var(--color-text-secondary)]";
}

export function amountColor(value: number): string {
  return value >= 0
    ? "text-[var(--color-text-primary-2)]"
    : "text-[var(--color-debt-red)]";
}
