import { rewardLabel, type RewardMode } from "@/lib/reward";
import { CoinIcon } from "@/components/ui/coin-icon";

/**
 * 奖励规则卡（纯展示，文案按奖励模式生成准确口径）
 */
export function RewardCard({
  rewardMode,
  rewardNValue,
  rewardAmount,
  penaltyAmount,
  deadlineTime,
  timezone,
}: {
  rewardMode: RewardMode;
  rewardNValue: number | null;
  rewardAmount: number;
  penaltyAmount: number;
  deadlineTime: string;
  timezone: string;
}) {
  const rewardText = rewardLabel(rewardMode, rewardAmount, rewardNValue);
  const rewardTitle =
    rewardMode === "every_time"
      ? "每次打卡奖励"
      : rewardMode === "every_n"
        ? `每 ${rewardNValue ?? "N"} 次打卡奖励`
        : "完成项目时奖励";

  return (
    <section className="mt-4 rounded-3xl bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
      <h2 className="text-lg font-bold text-[var(--color-text-primary-2)]">
        奖励规则
      </h2>
      <div className="mt-3 flex flex-col gap-3">
        <div className="flex items-center justify-between rounded-2xl bg-[#FFF7E0] px-4 py-3">
          <span className="text-[15px] font-medium text-[var(--color-text-primary-2)]">
            {rewardTitle}
          </span>
          <span className="flex items-center gap-1 text-[17px] font-bold text-[var(--color-coin-yellow)]">
            +{rewardAmount}
            <CoinIcon size={16} />
          </span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-[#FFEBEA] px-4 py-3">
          <span className="text-[15px] font-medium text-[var(--color-text-primary-2)]">
            缺卡一天
          </span>
          <span className="flex items-center gap-1 text-[17px] font-bold text-[var(--color-debt-red)]">
            -{penaltyAmount}
            <CoinIcon size={16} />
          </span>
        </div>
      </div>
      {rewardMode !== "every_time" ? (
        <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
          奖励由结算任务发放，非打卡即时到账（{rewardText}）
        </p>
      ) : null}
      <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
        每日 {deadlineTime}（{timezone}）截止，截止后不可打卡/撤销
      </p>
    </section>
  );
}
