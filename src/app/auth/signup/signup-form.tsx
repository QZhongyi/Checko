"use client";

import { useActionState } from "react";
import { Mail, KeyRound, Loader2, ChevronRight } from "lucide-react";
import { signup, type AuthFormState } from "@/app/auth/actions";
import { AuthInput } from "@/components/auth-input";
import { RegisterBar } from "@/components/auth-widgets";

export function SignupForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    signup,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col">
      {/* 邮箱 */}
      <AuthInput
        name="email"
        type="email"
        placeholder="邮箱"
        label="邮箱"
        autoComplete="email"
        icon={<Mail size={24} />}
      />

      {/* 间距 16 */}
      <div className="h-4" />

      {/* 密码 */}
      <AuthInput
        name="password"
        type="password"
        placeholder="密码（至少 6 位）"
        label="密码"
        autoComplete="new-password"
        icon={<KeyRound size={24} />}
      />

      {/* 错误提示 */}
      {state?.error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      {/* 服务条款 */}
      <p className="mt-4 text-xs leading-relaxed text-[var(--color-text-secondary)]">
        注册即表示同意
        <span className="font-medium text-[var(--color-text-primary)]">
          《用户协议》
        </span>
        和
        <span className="font-medium text-[var(--color-text-primary)]">
          《隐私政策》
        </span>
      </p>

      {/* 注册按钮：高 56 / 圆角 28 */}
      <div className="mt-5" />
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
        {pending ? "创建中…" : "注册"}
      </button>

      {/* 切换登录 */}
      <div className="mt-7">
        <RegisterBar href="/auth/login">
          <span className="text-sm font-normal text-[var(--color-text-primary)]">
            已有账号？
          </span>
          <span className="text-sm font-semibold text-[var(--color-primary)]">
            立即登录
          </span>
          <ChevronRight size={16} className="text-[var(--color-primary)]" />
        </RegisterBar>
      </div>
    </form>
  );
}
