"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export type CheckinActionState =
  | { error?: string; success?: boolean }
  | undefined;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 已知业务错误文案白名单（RPC 内 RAISE 的中文消息，按前缀匹配）。
 * 命中才透传给用户；其余错误只在服务端记录，客户端返回统一提示，
 * 避免向浏览器暴露内部实现细节。
 */
const KNOWN_BUSINESS_ERRORS = [
  "未登录",
  "项目不存在",
  "项目当前状态",
  "当前版本仅支持",
  "无权限",
  "当日打卡已截止",
  "打卡记录不存在或已撤销",
  "只能撤销自己的打卡",
  "只能撤销今天的打卡",
  "已超过今日截止时间",
  // 00046 起 create_checkin 在目标 attempt INSERT 处捕获唯一索引冲突
  // 并抛此明确业务错误（不再按 SQLSTATE 23505 猜测，避免其他唯一
  // 约束冲突被误报为重复打卡）
  "今日已打卡",
];

function toUserMessage(message: string): string {
  if (KNOWN_BUSINESS_ERRORS.some((prefix) => message.startsWith(prefix))) {
    return message;
  }
  console.error("checkin RPC 未知错误:", message);
  return "操作失败，请稍后重试";
}

/**
 * 每日打卡：调 create_checkin RPC（服务端完成归属/状态/截止校验与发奖）。
 */
export async function performCheckin(
  state: CheckinActionState,
  formData: FormData,
): Promise<CheckinActionState> {
  const projectId = String(formData.get("projectId") ?? "").trim();
  if (!UUID_RE.test(projectId)) {
    return { error: "参数无效" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("create_checkin", {
    p_project_id: projectId,
    p_note: undefined,
    p_photo: undefined,
  });

  if (error) {
    return { error: toUserMessage(error.message) };
  }

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

/**
 * 撤销今日打卡：调 revoke_checkin RPC（回收奖励、重算 streak、允许重打）。
 * 仅当日且未过截止时间可撤销（数据库强制）。
 * 表单需携带 projectId（隐藏域）用于刷新详情页缓存。
 */
export async function revokeCheckin(
  state: CheckinActionState,
  formData: FormData,
): Promise<CheckinActionState> {
  const checkinId = String(formData.get("checkinId") ?? "").trim();
  if (!UUID_RE.test(checkinId)) {
    return { error: "参数无效" };
  }
  const projectId = String(formData.get("projectId") ?? "").trim();

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("revoke_checkin", {
    p_checkin_id: checkinId,
    p_reason: undefined,
  });

  if (error) {
    return { error: toUserMessage(error.message) };
  }

  revalidatePath("/");
  if (UUID_RE.test(projectId)) {
    revalidatePath(`/projects/${projectId}`);
  }
  return { success: true };
}
