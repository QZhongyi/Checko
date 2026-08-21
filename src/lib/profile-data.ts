import "server-only";

import { createSupabaseServerClient } from "@/utils/supabase/server";

/**
 * 个人中心数据访问层（DAL）
 *
 * get_my_profile RPC（00030）：返回本人全字段，失败抛错由页面渲染失败态。
 */

export type ProfileData = {
  nickname: string | null;
  avatar: string | null;
  walletBalance: number;
  totalEarned: number;
  totalSpent: number;
  totalPenalty: number;
  timezone: string;
  profileVisibility: "private" | "friends" | "public";
};

export async function getProfileData(): Promise<ProfileData | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data, error } = await supabase.rpc("get_my_profile").single();
  if (error) {
    throw new Error(`个人资料加载失败: ${error.message}`);
  }
  if (!data) {
    return null;
  }

  return {
    nickname: data.nickname,
    avatar: data.avatar,
    walletBalance: data.wallet_balance,
    totalEarned: data.total_earned,
    totalSpent: data.total_spent,
    totalPenalty: data.total_penalty,
    timezone: data.timezone,
    profileVisibility: data.profile_visibility,
  };
}
