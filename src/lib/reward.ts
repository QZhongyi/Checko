/**
 * 奖励文案口径（需求：every_time 每次即时发奖；every_n 第 N 次打卡成功
 * 时发放里程碑；completed 达成全部目标归档时发放。文案必须与实际发奖
 * 时机一致，避免误导）
 * 负债态（debt）下 every_time 即时奖励改展示"还债 +N"（打卡回血口径，
 * draft/首页-待偿还.png）；every_n/completed 保留发奖时机描述。
 * 金币图标由调用方使用 CoinIcon 组件拼接（不再内嵌 emoji）。
 */
export type RewardMode = "every_time" | "every_n" | "completed";

export function rewardLabel(
  mode: RewardMode,
  amount: number,
  nValue: number | null,
  debt = false,
): string {
  switch (mode) {
    case "every_n":
      return `每 ${nValue ?? "N"} 次 +${amount}`;
    case "completed":
      return `完成时 +${amount}`;
    case "every_time":
    default:
      return debt ? `还债 +${amount}` : `每次 +${amount}`;
  }
}
