"use client";

import { useActionState } from "react";
import {
  Pencil,
  Coins,
  HandCoins,
  CalendarCheck,
  Loader2,
} from "lucide-react";
import {
  createProject,
  type CreateProjectFormState,
} from "@/app/create-project/actions";
import { AuthInput } from "@/components/auth-input";

export function CreateProjectForm() {
  const [state, action, pending] = useActionState<
    CreateProjectFormState,
    FormData
  >(createProject, undefined);

  return (
    <form action={action} className="flex flex-col">
      {/* 金额语义说明（AuthInput 无 label，用副标题代替） */}
      <p className="mb-4 text-xs leading-5 text-[var(--color-text-secondary)]">
        完成每日打卡获得奖励金额，漏卡扣除惩罚金额（单位：金币）
      </p>

      {/* 输入框 1：项目名称（1-30 字，原生 maxLength 防超长提交触发表单重置） */}
      <AuthInput
        name="name"
        type="text"
        placeholder="项目名称（1-30 字）"
        label="项目名称"
        maxLength={30}
        icon={<Pencil size={24} />}
      />

      <div className="h-4" />

      {/* 输入框 2：奖励金额（必填，原生 min/max 与服务端校验同规则） */}
      <AuthInput
        name="rewardAmount"
        type="number"
        placeholder="奖励金额，如：5"
        label="奖励金额（每次打卡奖励的金币）"
        min={0}
        max={999}
        icon={<Coins size={24} />}
      />

      <div className="h-4" />

      {/* 输入框 3：惩罚金额（默认 0，与 RPC p_penalty_amount default 0 一致） */}
      <AuthInput
        name="penaltyAmount"
        type="number"
        placeholder="惩罚金额（默认 0）"
        label="惩罚金额（缺卡一天扣除的金币）"
        defaultValue="0"
        min={0}
        max={999}
        icon={<HandCoins size={24} />}
      />

      <div className="h-4" />

      {/* 频率：v1-v4 固定"每日"，静态展示不可交互 */}
      <div className="flex h-14 w-full items-center gap-3 rounded-2xl border border-line bg-white px-4 shadow-[0_2px_8px_rgba(0,0,0,0.025)]">
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-primary)]"
          style={{ background: "var(--color-brand-icon-bg)" }}
        >
          <CalendarCheck size={24} />
        </span>
        <span className="flex-1 text-base font-normal leading-[22px] text-[var(--color-text-primary)]">
          每日打卡
        </span>
        <span className="text-sm text-[var(--color-text-secondary)]">固定</span>
      </div>

      {/* 错误提示 */}
      {state?.error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <div className="mt-6" />

      {/* 创建按钮（与登录按钮同规格） */}
      <button
        type="submit"
        disabled={pending}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-[28px] text-lg font-semibold leading-6 text-white shadow-[0_8px_20px_rgba(34,197,94,0.15)] transition active:scale-[0.98] disabled:opacity-60"
        style={{
          background:
            "linear-gradient(90deg, var(--color-primary), var(--color-primary-bright))",
        }}
      >
        {pending && <Loader2 size={20} className="animate-spin" />}
        {pending ? "创建中…" : "创建项目"}
      </button>
    </form>
  );
}
