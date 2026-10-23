/**
 * 下一个里程碑卡（成就页_prompt §4.4）：徽章预览 + 还差 N 天 +
 * 绿→金渐变进度条；进度口径 = 跨项目 max(max_streak)/阈值（与解锁一致）
 */
export function MilestoneCard({
  threshold,
  maxStreak,
  rarityColor,
}: {
  threshold: number;
  maxStreak: number;
  rarityColor: string;
}) {
  const remaining = threshold - maxStreak;
  const pct = Math.min(100, Math.round((maxStreak / threshold) * 100));
  return (
    <section className="mt-4 rounded-3xl bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
      <h2 className="text-[16px] font-bold text-[var(--color-text-primary-2)]">
        🎯 下一个里程碑
      </h2>
      <div className="mt-3 flex items-center gap-4">
        {/* 徽章预览（稀有度色环 + 微光） */}
        <span
          aria-hidden
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-2xl"
          style={{
            border: `3px solid ${rarityColor}`,
            boxShadow: `0 0 12px ${rarityColor}55`,
          }}
        >
          🔥
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-[var(--color-text-primary-2)]">
            {threshold} 天连续徽章
          </p>
          <p className="mt-0.5 text-xs font-medium text-[var(--color-text-secondary)]">
            还差 {remaining} 天即可解锁
          </p>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#ECEEEF]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #58CC02, #FFD700)",
              }}
            />
          </div>
          <p className="mt-1 text-[11px] font-medium text-[var(--color-text-secondary)]">
            {maxStreak}/{threshold} 天
          </p>
        </div>
      </div>
    </section>
  );
}
