import type { StreakBadge } from "@/lib/achievement-data";

/**
 * streak 徽章墙（成就页_prompt §4.6 据实裁剪：仅连续打卡 4 枚）
 * 已获得：稀有度色环 + 微光 + 解锁日期；未解锁：灰阶 + 🔒 + 进度 x/N
 */

/** 稀有度配色（成就页_prompt §六：铜/银/金/铂金） */
export const RARITY_COLORS: Record<number, string> = {
  7: "#CD7F32",
  30: "#C0C0C0",
  100: "#FFD700",
  365: "#E5E4E2",
};

const LOCKED_BORDER = "#D5D8DE";

export function StreakBadgeWall({
  thresholds,
  badges,
  maxStreak,
}: {
  thresholds: readonly number[];
  badges: StreakBadge[];
  maxStreak: number;
}) {
  const unlocked = new Map(badges.map((b) => [b.value, b.unlockedDate]));
  return (
    <section className="mt-5">
      <h2 className="text-[22px] font-bold leading-[30px] text-[var(--color-text-primary-2)]">
        🏅 徽章墙
      </h2>
      <div className="mt-3 grid grid-cols-4 gap-2.5">
        {thresholds.map((value) => {
          const unlockedDate = unlocked.get(value);
          const color = RARITY_COLORS[value];
          const locked = unlockedDate === undefined;
          return (
            <div
              key={value}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-white p-3 shadow-[0_6px_20px_rgba(0,0,0,0.045)]"
            >
              <span
                aria-hidden
                className={`flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl ${
                  locked ? "opacity-60 grayscale" : ""
                }`}
                style={
                  locked
                    ? { border: `2px solid ${LOCKED_BORDER}` }
                    : {
                        border: `3px solid ${color}`,
                        boxShadow: `0 0 12px ${color}66`,
                      }
                }
              >
                {locked ? "🔒" : "🔥"}
              </span>
              <p className="text-xs font-bold text-[var(--color-text-primary-2)]">
                {value} 天连续
              </p>
              <p className="text-[10px] font-medium text-[var(--color-text-secondary)]">
                {locked ? `${maxStreak}/${value}` : `${unlockedDate} 解锁`}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
