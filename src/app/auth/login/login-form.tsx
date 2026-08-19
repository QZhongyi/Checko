"use client";

import { useActionState } from "react";
import { Mail, KeyRound, Loader2 } from "lucide-react";
import { login, type AuthFormState } from "@/app/auth/actions";
import { AuthInput } from "@/components/auth-input";
import { RegisterBar } from "@/components/auth-widgets";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(
    login,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col">
      {/* 输入框 1：手机号 / 邮箱（高 56） */}
      <AuthInput
        name="email"
        type="email"
        placeholder="手机号 / 邮箱"
        label="账号"
        autoComplete="email"
        icon={<Mail size={24} />}
      />

      {/* 输入框间距 16 */}
      <div className="h-4" />

      {/* 输入框 2：密码（高 56） */}
      <AuthInput
        name="password"
        type="password"
        placeholder="密码"
        label="密码"
        autoComplete="current-password"
        icon={<KeyRound size={24} />}
      />

      {/* 错误提示 */}
      {state?.error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      {/* 到登录按钮 20 */}
      <div className="mt-5" />

      {/* 登录按钮：高 56 / 圆角 28（胶囊）/ 绿色渐变 / 阴影 */}
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
        {pending ? "登录中…" : "登录"}
      </button>

      {/* 到注册栏 28 */}
      <div className="mt-7">
        <RegisterBar href="/auth/signup" />
      </div>
    </form>
  );
}
