"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export type ExpenseActionState =
  | { error?: string; success?: boolean }
  | undefined;

const MAX_AMOUNT = 1_000_000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 已知业务错误文案白名单（RPC 内 RAISE 的中文消息，按前缀匹配）。
 */
const KNOWN_BUSINESS_ERRORS = [
  "未登录",
  "小荷包余额不足",
  "消费金额必须为正数",
  "该消费已记录",
  "用户不存在",
  "缺少请求标识",
  "消费日期不能晚于今天",
];

function toUserMessage(message: string): string {
  if (KNOWN_BUSINESS_ERRORS.some((prefix) => message.startsWith(prefix))) {
    return message;
  }
  console.error("record_expense RPC 未知错误:", message);
  return "操作失败，请稍后重试";
}

/**
 * 记一笔消费：调 record_expense RPC（自动写 transactions + expenses、
 * 扣减 wallet_balance；余额不足由数据库兜底拒绝）。
 */
export async function recordExpense(
  state: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const expenseDate = String(formData.get("expenseDate") ?? "").trim();
  const requestId = String(formData.get("requestId") ?? "").trim();

  // 正则严格限定正整数，挡掉空串/小数/负数/科学计数法（parseInt 会静默截断）
  if (!/^\d+$/.test(amountRaw) || Number(amountRaw) > MAX_AMOUNT) {
    return { error: `金额需为 1-${MAX_AMOUNT} 的整数` };
  }
  if (Number(amountRaw) < 1) {
    return { error: "金额需为 1-" + MAX_AMOUNT + " 的整数" };
  }
  if (note.length > 100) {
    return { error: "备注最多 100 个字符" };
  }
  if (expenseDate !== "" && !DATE_RE.test(expenseDate)) {
    return { error: "日期格式无效" };
  }

  // request_id 必填（00047）：非法值直接拒绝而非静默降级（旧小时桶路径已删除）
  if (!UUID_RE.test(requestId)) {
    return { error: "请求标识无效，请重新打开弹窗再试" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("record_expense", {
    p_amount: Number(amountRaw),
    p_category: undefined,
    p_note: note || undefined,
    p_expense_date: expenseDate || undefined,
    p_request_id: requestId,
  });

  if (error) {
    return { error: toUserMessage(error.message) };
  }

  revalidatePath("/wallet");
  revalidatePath("/");
  return { success: true };
}
