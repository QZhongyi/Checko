"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { HABIT_ICON_KEYS } from "@/components/home/habit-icons";

export type CreateProjectFormState =
  | { error?: string }
  | undefined;

const MAX_AMOUNT = 999;

/**
 * 创建打卡项目（个人 / 多人）：名称 + 图标 + 奖励金额 + 惩罚金额 +
 * 项目类型（多人时含打卡模式）+ 奖励方式（个人：每次 / 每 N 次 / 完成时）。
 * 其余字段（补卡 / 截止时间等）走 create_project RPC 数据库默认值；
 * 频率固定 daily（v1-v4 仅支持每日）。
 */
export async function createProject(
  state: CreateProjectFormState,
  formData: FormData,
) {
  const name = String(formData.get("name") ?? "").trim();
  const rewardRaw = String(formData.get("rewardAmount") ?? "").trim();
  const penaltyRaw = String(formData.get("penaltyAmount") ?? "").trim();
  const iconRaw = String(formData.get("icon") ?? "").trim();
  const projectTypeRaw = String(formData.get("projectType") ?? "personal");
  const checkinModeRaw = String(formData.get("checkinMode") ?? "").trim();
  const targetCountRaw = String(formData.get("targetCount") ?? "").trim();
  const rewardModeRaw = String(formData.get("rewardMode") ?? "every_time");
  const rewardNValueRaw = String(formData.get("rewardNValue") ?? "").trim();
  const budgetRaw = String(formData.get("budgetAmount") ?? "").trim();

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
  // 图标白名单（与 RPC 00056 一致）；空 = 未选择
  if (iconRaw !== "" && !HABIT_ICON_KEYS.includes(iconRaw)) {
    return { error: "不支持的项目图标" };
  }

  const isGroup = projectTypeRaw === "group";
  const checkinMode: "any_one" | "all" | null = isGroup
    ? checkinModeRaw === "any_one" || checkinModeRaw === "all"
      ? checkinModeRaw
      : null
    : null;
  if (isGroup && checkinMode === null) {
    return { error: "请选择打卡模式（任意一人 / 全员完成）" };
  }

  // 有限次目标（仅个人项目渲染该输入；与 RPC 00077 校验同规则）
  let targetCount: number | undefined;
  if (targetCountRaw !== "") {
    if (
      !/^\d+$/.test(targetCountRaw) ||
      Number(targetCountRaw) < 2 ||
      Number(targetCountRaw) > MAX_AMOUNT
    ) {
      return { error: `目标次数需为 2-${MAX_AMOUNT} 的整数` };
    }
    targetCount = Number(targetCountRaw);
  }

  // 奖励方式（仅个人项目提交；与 RPC 00083 组合矩阵同规则）
  let rewardMode: "every_time" | "every_n" | "completed" = "every_time";
  let rewardNValue: number | undefined;
  if (!isGroup) {
    if (
      rewardModeRaw === "every_time" ||
      rewardModeRaw === "every_n" ||
      rewardModeRaw === "completed"
    ) {
      rewardMode = rewardModeRaw;
    } else {
      return { error: "不支持的奖励方式" };
    }
    if (rewardNValueRaw !== "") {
      if (
        rewardMode !== "every_n" ||
        !/^\d+$/.test(rewardNValueRaw) ||
        Number(rewardNValueRaw) < 2 ||
        Number(rewardNValueRaw) > MAX_AMOUNT
      ) {
        return { error: `N 值需为 2-${MAX_AMOUNT} 的整数（仅每 N 次奖励可填）` };
      }
      rewardNValue = Number(rewardNValueRaw);
    }
    if (rewardMode === "every_n" && rewardNValue === undefined) {
      return { error: "每 N 次奖励需填写 N 值" };
    }
    if (rewardMode === "completed" && targetCount === undefined) {
      return { error: "完成时奖励仅支持有限次任务" };
    }
  }

  // 奖励池总预算（仅多人有限次渲染该输入；与 RPC 00086 矩阵同规则）
  let budget: number | undefined;
  if (budgetRaw !== "") {
    if (
      !isGroup ||
      targetCount === undefined ||
      !/^\d+$/.test(budgetRaw) ||
      Number(budgetRaw) < 1 ||
      Number(budgetRaw) > MAX_AMOUNT
    ) {
      return { error: `奖励池总预算需为 1-${MAX_AMOUNT} 的整数（仅多人有限次项目可填）` };
    }
    budget = Number(budgetRaw);
  }

  const supabase = await createSupabaseServerClient();

  // RPC 参数名与函数签名一致（snake_case），由生成的 Database 类型校验
  const { data: projectId, error } = await supabase.rpc("create_project", {
    p_name: name,
    p_project_type: isGroup ? "group" : "personal",
    p_frequency: "daily",
    p_reward_amount: Number(rewardRaw),
    p_penalty_amount: Number(penaltyRaw),
    ...(isGroup && checkinMode ? { p_checkin_mode: checkinMode } : {}),
    ...(targetCount !== undefined ? { p_target_count: targetCount } : {}),
    ...(!isGroup ? { p_reward_mode: rewardMode } : {}),
    ...(rewardNValue !== undefined ? { p_reward_n_value: rewardNValue } : {}),
    ...(budget !== undefined ? { p_reward_pool_lifetime_budget: budget } : {}),
    p_icon: iconRaw || undefined,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  // 多人项目创建后直达详情页发邀请（pending 期首页主集合不可见）
  redirect(isGroup && projectId ? `/projects/${projectId}` : "/");
}
