"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/utils/supabase/server";

/**
 * 个人中心 Server Actions（update_profile / update_profile_visibility RPC）
 */

export type ProfileActionState =
  | {
      error?: string;
      success?: boolean;
      /** 本次提交的可见性值（仅 updateVisibilityAction），用于失败回滚 */
      visibility?: "private" | "friends" | "public";
    }
  | undefined;

const KNOWN_BUSINESS_ERRORS = [
  "未登录",
  "当前用户不存在",
  "昵称",
  "时区",
];

function toUserMessage(message: string): string {
  if (KNOWN_BUSINESS_ERRORS.some((prefix) => message.startsWith(prefix))) {
    return message;
  }
  console.error("profile RPC 未知错误:", message);
  return "操作失败，请稍后重试";
}

/**
 * 修改昵称（1-50 字符，DB 侧 profiles.nickname 约束兜底）。
 * 成功同时刷新首页（header 昵称）与个人中心。
 */
export async function updateNicknameAction(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const nickname = String(formData.get("nickname") ?? "").trim();
  if (nickname.length < 1 || nickname.length > 50) {
    return { error: "昵称长度需在 1-50 个字符之间" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("update_profile", {
    p_nickname: nickname,
  });

  if (error) {
    return { error: toUserMessage(error.message) };
  }

  revalidatePath("/profile");
  revalidatePath("/");
  return { success: true };
}

/**
 * 修改资料可见性（private / friends / public）。
 * 影响好友搜索可见性与好友排行榜。
 */
export async function updateVisibilityAction(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const raw = String(formData.get("visibility") ?? "");
  if (raw !== "private" && raw !== "friends" && raw !== "public") {
    return { error: "参数无效" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("update_profile_visibility", {
    p_visibility: raw,
  });

  if (error) {
    return { error: toUserMessage(error.message), visibility: raw };
  }

  revalidatePath("/profile");
  return { success: true, visibility: raw };
}
