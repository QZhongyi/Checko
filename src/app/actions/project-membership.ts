"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase/server";

/**
 * 多人项目成员管理 Server Actions（00018 / 00026 / 00033 RPC）
 *
 * 成员集合只增不减契约：active 后禁止新邀请/移除/退出，pending 邀请
 * 可在 active 后继续接受（受 max_members 限制）——规则全部由 RPC 强制，
 * 本层只做参数校验、错误白名单透传与缓存刷新。
 */

export type MembershipActionState =
  | {
      error?: string;
      success?: boolean;
      /** 操作目标（成员/邀请行归属），用于结果定位到对应行 */
      targetUserId?: string;
    }
  | undefined;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const KNOWN_BUSINESS_ERRORS = [
  "未登录",
  "项目不存在",
  "被邀请用户不存在",
  "仅项目所有者可以邀请成员",
  "个人项目不能邀请成员",
  "仅待开始项目可以发出新邀请",
  "项目所有者已是项目成员",
  "只能邀请已接受的好友",
  "项目成员和待处理邀请已达到上限",
  "该用户已经是成员或已有待处理邀请",
  "未找到待接受的邀请",
  "项目当前状态（",
  "项目已满（",
  "项目不存在或当前状态不能拒绝邀请",
  "仅项目所有者可以取消邀请",
  "未找到待取消邀请",
  "当前项目状态不能取消邀请",
  "仅项目所有者可以移除成员",
  "未找到可移除的活跃成员",
  "项目开始后不能移除成员",
  "项目所有者不能被移除",
  "未找到可退出的活跃成员",
  "项目开始后不能退出",
  "项目所有者不能退出项目",
  "无权限：仅项目创建者可删除",
];

function toUserMessage(message: string): string {
  if (KNOWN_BUSINESS_ERRORS.some((prefix) => message.startsWith(prefix))) {
    return message;
  }
  console.error("membership RPC 未知错误:", message);
  return "操作失败，请稍后重试";
}

function revalidateProject(projectId: string) {
  revalidatePath("/", "layout");
  revalidatePath(`/projects/${projectId}`);
}

/**
 * 邀请好友加入多人项目（invite_project_member，仅 owner + pending 项目）。
 */
export async function inviteProjectMemberAction(
  _state: MembershipActionState,
  formData: FormData,
): Promise<MembershipActionState> {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const targetUserId = String(formData.get("targetUserId") ?? "").trim();
  if (!UUID_RE.test(projectId) || !UUID_RE.test(targetUserId)) {
    return { error: "参数无效", targetUserId };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("invite_project_member", {
    p_project_id: projectId,
    p_user_id: targetUserId,
  });

  if (error) {
    return { error: toUserMessage(error.message), targetUserId };
  }

  revalidateProject(projectId);
  return { success: true, targetUserId };
}

/**
 * 接受项目邀请（accept_invitation；pending 邀请在项目 active 后仍可接受）。
 */
export async function acceptProjectInvitationAction(
  _state: MembershipActionState,
  formData: FormData,
): Promise<MembershipActionState> {
  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!UUID_RE.test(projectId)) {
    return { error: "参数无效" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("accept_invitation", {
    p_project_id: projectId,
  });

  if (error) {
    return { error: toUserMessage(error.message) };
  }

  revalidateProject(projectId);
  return { success: true };
}

/**
 * 拒绝项目邀请（受邀人视角，reject_project_invitation）。
 */
export async function rejectProjectInvitationAction(
  _state: MembershipActionState,
  formData: FormData,
): Promise<MembershipActionState> {
  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!UUID_RE.test(projectId)) {
    return { error: "参数无效" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("reject_project_invitation", {
    p_project_id: projectId,
  });

  if (error) {
    return { error: toUserMessage(error.message) };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * 取消邀请（owner 视角，cancel_project_invitation）。
 */
export async function cancelProjectInvitationAction(
  _state: MembershipActionState,
  formData: FormData,
): Promise<MembershipActionState> {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const targetUserId = String(formData.get("targetUserId") ?? "").trim();
  if (!UUID_RE.test(projectId) || !UUID_RE.test(targetUserId)) {
    return { error: "参数无效", targetUserId };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("cancel_project_invitation", {
    p_project_id: projectId,
    p_user_id: targetUserId,
  });

  if (error) {
    return { error: toUserMessage(error.message), targetUserId };
  }

  revalidateProject(projectId);
  return { success: true, targetUserId };
}

/**
 * 移除已接受成员（owner + pending 项目，remove_project_member）。
 */
export async function removeProjectMemberAction(
  _state: MembershipActionState,
  formData: FormData,
): Promise<MembershipActionState> {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const targetUserId = String(formData.get("targetUserId") ?? "").trim();
  if (!UUID_RE.test(projectId) || !UUID_RE.test(targetUserId)) {
    return { error: "参数无效", targetUserId };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("remove_project_member", {
    p_project_id: projectId,
    p_user_id: targetUserId,
  });

  if (error) {
    return { error: toUserMessage(error.message), targetUserId };
  }

  revalidateProject(projectId);
  return { success: true, targetUserId };
}

/**
 * 退出项目（本人 + pending 项目 + 非 owner，quit_project）。
 */
export async function quitProjectAction(
  _state: MembershipActionState,
  formData: FormData,
): Promise<MembershipActionState> {
  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!UUID_RE.test(projectId)) {
    return { error: "参数无效" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("quit_project", {
    p_project_id: projectId,
  });

  if (error) {
    return { error: toUserMessage(error.message) };
  }

  revalidatePath("/", "layout");
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

/**
 * 取消项目（owner + pending/active，cancel_project 00062：软删
 * cancelled + deleted_at，已发放金币不回收）。
 */
export async function cancelProjectAction(
  _state: MembershipActionState,
  formData: FormData,
): Promise<MembershipActionState> {
  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!UUID_RE.test(projectId)) {
    return { error: "参数无效" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("cancel_project", {
    p_project_id: projectId,
  });

  if (error) {
    return { error: toUserMessage(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
