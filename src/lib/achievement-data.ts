import "server-only";

import { createSupabaseServerClient } from "@/utils/supabase/server";
import { getProfileData } from "@/lib/profile-data";

/**
 * 成就页数据访问层（DAL）
 *
 * get_my_achievements RPC（00089）：本人 streak 徽章 + 跨项目
 * max(max_streak) / max(current_streak)（与解锁口径同源：任一项目
 * owner 或 active 成员、未软删）。小荷包统计复用 get_my_profile。
 * 任一 RPC 失败抛错，由页面渲染失败态。
 */

/** streak 徽章阈值（需求 §5.3.1） */
export const STREAK_THRESHOLDS = [7, 30, 100, 365] as const;

export type StreakBadge = {
  value: number;
  /** 解锁日期（用户时区 YYYY.MM.DD，服务端格式化） */
  unlockedDate: string;
};

export type AchievementsData = {
  walletBalance: number;
  totalEarned: number;
  /** 已解锁 streak 徽章（仅阈值内，按阈值升序） */
  streakBadges: StreakBadge[];
  /** 跨项目 max(max_streak) */
  maxStreak: number;
  /** 跨项目 max(current_streak) */
  maxCurrentStreak: number;
};

const DEFAULT_TZ = "Asia/Shanghai";

export async function getAchievementsData(): Promise<AchievementsData> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("未登录");
  }

  const [profile, achRes] = await Promise.all([
    getProfileData(),
    supabase.rpc("get_my_achievements").single(),
  ]);
  if (achRes.error || !achRes.data) {
    throw new Error(`成就数据加载失败: ${achRes.error?.message ?? "空结果"}`);
  }

  const tz = profile?.timezone ?? DEFAULT_TZ;
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const rows =
    (achRes.data.v_streak_badges as { value: number; unlocked_at: string }[] | null) ?? [];
  const thresholdSet = new Set<number>(STREAK_THRESHOLDS);
  const streakBadges = rows
    .filter((b) => thresholdSet.has(b.value))
    .sort((a, b) => a.value - b.value)
    .map((b) => ({
      value: b.value,
      unlockedDate: fmt.format(new Date(b.unlocked_at)).replaceAll("-", "."),
    }));

  return {
    walletBalance: profile?.walletBalance ?? 0,
    totalEarned: profile?.totalEarned ?? 0,
    streakBadges,
    maxStreak: achRes.data.v_max_streak ?? 0,
    maxCurrentStreak: achRes.data.v_max_current_streak ?? 0,
  };
}
