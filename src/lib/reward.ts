/**
 * 奖励文案口径（需求：every_time 每次即时发奖；every_n 每 N 次由结算
 * 任务发；completed 完成时发。文案必须与实际发奖时机一致，避免误导）
 * 金币图标由调用方使用 CoinIcon 组件拼接（不再内嵌 emoji）。
 */
export type RewardMode = "every_time" | "every_n" | "completed";

export function rewardLabel(
  mode: RewardMode,
  amount: number,
  nValue: number | null,
): string {
  switch (mode) {
    case "every_n":
      return `每 ${nValue ?? "N"} 次 +${amount}`;
    case "completed":
      return `完成时 +${amount}`;
    case "every_time":
    default:
      return `每次 +${amount}`;
  }
}
