import { CoinIcon } from "@/components/ui/coin-icon";

/**
 * 三联统计卡（成就页_prompt §4.3）：小荷包（金渐变）/ 徽章（银渐变）/
 * 连续（橙渐变），大号数字 + 副信息
 */
export function AchievementStatCards({
  walletBalance,
  totalEarned,
  badgeCount,
  badgeTotal,
  currentStreak,
  longestStreak,
}: {
  walletBalance: number;
  totalEarned: number;
  badgeCount: number;
  badgeTotal: number;
  currentStreak: number;
  longestStreak: number;
}) {
  return (
    <section className="mt-4 grid grid-cols-3 gap-3" aria-label="成就统计">
      <div
        className="rounded-2xl p-3.5"
        style={{ background: "linear-gradient(135deg, #FFC800, #FFD700)" }}
      >
        <p className="text-xs font-medium text-[#5B4200]">小荷包</p>
        <p className="mt-1 flex items-center gap-1 text-[18px] font-bold leading-6 text-[#3D2E00]">
          {walletBalance} <CoinIcon size={14} />
        </p>
        <p className="mt-0.5 flex items-center gap-0.5 text-[11px] font-medium text-[#5B4200]">
          累计获得 +{totalEarned} <CoinIcon size={10} />
        </p>
      </div>

      <div
        className="rounded-2xl p-3.5"
        style={{ background: "linear-gradient(135deg, #DADDE3, #B8BDC7)" }}
      >
        <p className="text-xs font-medium text-[#4A4F58]">徽章</p>
        <p className="mt-1 text-[18px] font-bold leading-6 text-[#2E333B]">
          {badgeCount}/{badgeTotal}
        </p>
        <p className="mt-0.5 text-[11px] font-medium text-[#4A4F58]">
          解锁率 {Math.round((badgeCount / badgeTotal) * 100)}%
        </p>
      </div>

      <div
        className="rounded-2xl p-3.5"
        style={{ background: "linear-gradient(135deg, #FF9F43, #FF6B00)" }}
      >
        <p className="text-xs font-medium text-white/90">当前连续</p>
        <p className="mt-1 text-[18px] font-bold leading-6 text-white">
          🔥 {currentStreak}
        </p>
        <p className="mt-0.5 text-[11px] font-medium text-white/90">
          最长 {longestStreak} 天
        </p>
      </div>
    </section>
  );
}
