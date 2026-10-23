"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/utils/supabase/server";

/**
 * 好友系统 Server Actions（00029 / 00052 RPC）
 *
 * 错误白名单：命中 RPC 中文业务文案前缀才透传，其余仅服务端记录并
 * 返回统一提示，避免向浏览器暴露内部细节。
 */

export type FriendActionState =
  | {
      error?: string;
      success?: boolean;
      /** 本次提交的目标（好友申请为 targetUserId，行操作为 friendshipId），用于结果归属到对应行 */
      targetUserId?: string;
      friendshipId?: string;
    }
  | undefined;

export type SearchUserResult = {
  userId: string;
  nickname: string | null;
  avatar: string | null;
  relation: string;
};

export type SearchUserState =
  | { result?: SearchUserResult; error?: string }
  | undefined;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const KNOWN_BUSINESS_ERRORS = [
  "未登录",
  "目标用户不能为空",
  "不能添加自己为好友",
  "当前用户不存在",
  "目标用户不存在",
  "双方已经是好友",
  "好友申请已发送",
  "对方已向你发送申请",
  "该好友关系已存在",
  "好友申请不存在",
  "好友关系不存在",
  "只有好友申请接收方可以接受申请",
  "只有好友申请接收方可以拒绝申请",
  "只有关系参与者可以删除好友关系",
  "申请接收方应使用拒绝好友申请操作",
  "该好友申请已处理",
  "只能拒绝待处理的好友申请",
  "邮箱不能为空",
  "24小时内只能向该用户发起一次申请",
];

function toUserMessage(message: string): string {
  if (KNOWN_BUSINESS_ERRORS.some((prefix) => message.startsWith(prefix))) {
    return message;
  }
  console.error("friend RPC 未知错误:", message);
  return "操作失败，请稍后重试";
}

/**
 * 按邮箱精确搜索用户（search_users，00052）。
 * 未命中是正常业务态（result 为 undefined），不算 error。
 */
export async function searchUserAction(
  _state: SearchUserState,
  formData: FormData,
): Promise<SearchUserState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "请输入邮箱" };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("search_users", {
    p_email: email,
  });

  if (error) {
    return { error: toUserMessage(error.message) };
  }

  const row = (data ?? [])[0];
  return row
    ? {
        result: {
          userId: row.user_id,
          nickname: row.nickname,
          avatar: row.avatar,
          relation: row.relation,
        },
      }
    : {};
}

/**
 * 发送好友申请（request_friendship，00029）。
 */
export async function requestFriendshipAction(
  _state: FriendActionState,
  formData: FormData,
): Promise<FriendActionState> {
  const targetUserId = String(formData.get("targetUserId") ?? "").trim();
  if (!UUID_RE.test(targetUserId)) {
    return { error: "参数无效", targetUserId };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("request_friendship", {
    p_target_id: targetUserId,
  });

  if (error) {
    return { error: toUserMessage(error.message), targetUserId };
  }

  revalidatePath("/friends");
  return { success: true, targetUserId };
}

/**
 * 接受好友申请（accept_friendship）。
 */
export async function acceptFriendRequestAction(
  _state: FriendActionState,
  formData: FormData,
): Promise<FriendActionState> {
  const friendshipId = String(formData.get("friendshipId") ?? "").trim();
  if (!UUID_RE.test(friendshipId)) {
    return { error: "参数无效", friendshipId };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("accept_friendship", {
    p_friendship_id: friendshipId,
  });

  if (error) {
    return { error: toUserMessage(error.message), friendshipId };
  }

  revalidatePath("/friends");
  return { success: true, friendshipId };
}

/**
 * 拒绝好友申请（reject_friendship，物理删除，可重新申请）。
 */
export async function rejectFriendRequestAction(
  _state: FriendActionState,
  formData: FormData,
): Promise<FriendActionState> {
  const friendshipId = String(formData.get("friendshipId") ?? "").trim();
  if (!UUID_RE.test(friendshipId)) {
    return { error: "参数无效", friendshipId };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("reject_friendship", {
    p_friendship_id: friendshipId,
  });

  if (error) {
    return { error: toUserMessage(error.message), friendshipId };
  }

  revalidatePath("/friends");
  return { success: true, friendshipId };
}

/**
 * 删除好友 / 撤回已发出的申请（delete_friendship）。
 * 确认弹窗由调用方表单负责。
 */
export async function deleteFriendshipAction(
  _state: FriendActionState,
  formData: FormData,
): Promise<FriendActionState> {
  const friendshipId = String(formData.get("friendshipId") ?? "").trim();
  if (!UUID_RE.test(friendshipId)) {
    return { error: "参数无效", friendshipId };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("delete_friendship", {
    p_friendship_id: friendshipId,
  });

  if (error) {
    return { error: toUserMessage(error.message), friendshipId };
  }

  revalidatePath("/friends");
  return { success: true, friendshipId };
}

/** 动态互动（00090）结果归属键：`{targetType}:{targetId}` 或 `{userId}` */
export type FeedInteractionState =
  | { error?: string; success?: boolean; targetKey?: string }
  | undefined;

const FEED_BUSINESS_ERRORS = [
  "未登录",
  "点赞目标不能为空",
  "无效的点赞目标类型",
  "只能点赞好友的动态",
  "目标用户不能为空",
  "不能催自己打卡",
  "只有好友可以催打卡",
  "对方今日没有待完成的打卡",
  "24小时内已提醒过，明天再来看看",
];

function toFeedUserMessage(message: string): string {
  if (FEED_BUSINESS_ERRORS.some((prefix) => message.startsWith(prefix))) {
    return message;
  }
  console.error("feed RPC 未知错误:", message);
  return "操作失败，请稍后重试";
}

/**
 * 点赞 toggle（toggle_activity_like，00090）。可见性由 RPC 强制
 * （仅好友的动态可赞）；成功后 revalidate 刷新服务端 like 状态。
 */
export async function toggleActivityLikeAction(
  _state: FeedInteractionState,
  formData: FormData,
): Promise<FeedInteractionState> {
  const targetType = String(formData.get("targetType") ?? "").trim();
  const targetId = String(formData.get("targetId") ?? "").trim();
  if (
    (targetType !== "checkin" && targetType !== "achievement") ||
    !UUID_RE.test(targetId)
  ) {
    return { error: "参数无效", targetKey: `${targetType}:${targetId}` };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("toggle_activity_like", {
    p_target_type: targetType,
    p_target_id: targetId,
  });

  if (error) {
    return {
      error: toFeedUserMessage(error.message),
      targetKey: `${targetType}:${targetId}`,
    };
  }

  revalidatePath("/friends");
  return { success: true, targetKey: `${targetType}:${targetId}` };
}

/**
 * 催打卡（nudge_friend，00090）：好友关系 + 今日未完成义务 + 24h 冷却
 * 均由 RPC 强制；成功后服务端 nudged 翻转按钮为"已提醒"态。
 */
export async function nudgeFriendAction(
  _state: FeedInteractionState,
  formData: FormData,
): Promise<FeedInteractionState> {
  const userId = String(formData.get("userId") ?? "").trim();
  if (!UUID_RE.test(userId)) {
    return { error: "参数无效", targetKey: userId };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("nudge_friend", {
    p_user_id: userId,
  });

  if (error) {
    return { error: toFeedUserMessage(error.message), targetKey: userId };
  }

  revalidatePath("/friends");
  return { success: true, targetKey: userId };
}
