"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type CommonProps = {
  name: string;
  type?: "text" | "email" | "password" | "number";
  placeholder?: string;
  autoComplete?: string;
  icon: React.ReactNode;
  defaultValue?: string;
  rightAccessory?: React.ReactNode; // 自定义右侧内容（如验证码按钮）
  maxLength?: number;
  min?: number;
  max?: number;
};

/**
 * Auth 表单输入框（规格：draft/设计规范及标注.md §十一 / §二十二 InputItem）
 *   高 56px / 圆角 16px / 1px #F0F1F3 边框
 *   左侧 icon 容器 40×40 圆角 12 背景 #F1FAF4，icon 24px 品牌绿
 *   icon 到文字 12px
 *   type=password 右侧自动加眼睛切换（20px #8A8FA3）
 *   水平 padding 16px
 */
export function AuthInput({
  name,
  type = "text",
  placeholder,
  autoComplete,
  icon,
  defaultValue,
  rightAccessory,
  maxLength,
  min,
  max,
}: CommonProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="flex h-14 w-full items-center gap-3 rounded-2xl border border-line bg-white px-4 shadow-[0_2px_8px_rgba(0,0,0,0.025)] transition focus-within:border-[var(--color-primary)] focus-within:shadow-[0_2px_8px_rgba(34,197,94,0.12)]">
      {/* 左侧 icon 容器 40×40 / 圆角 12 / 浅绿底 / icon 24 绿色 */}
      <span
        aria-hidden
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--color-primary)]"
        style={{ background: "var(--color-brand-icon-bg)" }}
      >
        {icon}
      </span>
      <input
        name={name}
        type={inputType}
        placeholder={placeholder}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        maxLength={maxLength}
        min={min}
        max={max}
        required
        className="flex-1 bg-transparent text-base font-normal leading-[22px] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
      />
      {/* 右侧：自定义 accessory 优先，否则密码框自动加眼睛 */}
      {rightAccessory ? (
        rightAccessory
      ) : isPassword ? (
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
          tabIndex={-1}
          aria-label={show ? "隐藏密码" : "显示密码"}
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      ) : null}
    </div>
  );
}
