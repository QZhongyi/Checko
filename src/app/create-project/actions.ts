"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export type CreateProjectFormState =
  | { error?: string }
  | undefined;

const MAX_AMOUNT = 999;

/**
 * 创建个人打卡项目（MVP：名称 + 奖励金额 + 惩罚金额）。
 * 其余字段（奖励模式 / 补卡 / 截止时间等）走 create_project RPC 数据库默认值；
 * 频率固定 daily（需求文档：v1-v4 仅支持每日）。
 */
export async function createProject(
  state: CreateProjectFormState,
  formData: FormData,
) {
  const name = String(formData.get("name") ?? "").trim();
  const rewardRaw = String(formData.get("rewardAmount") ?? "").trim();
  const penaltyRaw = String(formData.get("penaltyAmount") ?? "").trim();

  if (name.length < 1 || name.length > 30) {
    return { error: "项目名称需为 1-30 个字符" };
  }
  // 正则严格限定非负整数：挡掉空串、小数、负数、科学计数法
  // （parseInt 会静默截断 "1e3"→1、"12.5"→12，不能用于校验）
  if (!/^\d+$/.test(rewardRaw) || Number(rewardRaw) > MAX_AMOUNT) {
    return { error: `奖励金额需为 0-${MAX_AMOUNT} 的整数` };
  }
  if (!/^\d+$/.test(penaltyRaw) || Number(penaltyRaw) > MAX_AMOUNT) {
    return { error: `惩罚金额需为 0-${MAX_AMOUNT} 的整数` };
  }

  const supabase = await createSupabaseServerClient();

  // Database 类型尚未生成（types.ts 为占位），rpc 参数类型退化为 undefined，
  // 这里用显式类型在边界处约束（与 home-data.ts 的边界类型转换同一策略）。
  // 注意：RPC 参数名必须与函数签名一致（snake_case），PostgREST 不做 camelCase 映射。
  // TODO: supabase gen types 生成 Database 类型后移除 as never 断言。
  type CreateProjectArgs = {
    p_name: string;
    p_project_type: "personal";
    p_frequency: "daily";
    p_reward_amount: number;
    p_penalty_amount: number;
  };
  const args: CreateProjectArgs = {
    p_name: name,
    p_project_type: "personal",
    p_frequency: "daily",
    p_reward_amount: Number(rewardRaw),
    p_penalty_amount: Number(penaltyRaw),
  };
  const { error } = await supabase.rpc("create_project", args as never);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
