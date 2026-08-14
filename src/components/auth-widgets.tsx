"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * Auth 页面公共部件（规格：draft/设计规范及标注.md）
 *
 * 当前已实现的部件：
 *   - IllustrationSlot  顶部插画占位（等 SVG/Lottie 资产替换）
 *   - SunBadge          标题左侧太阳 badge
 *   - ProgressDots      副标题下方装饰进度条
 *   - RegisterBar       底部"还没有账号？立即注册"切换条
 *
 * 暂未接通、已隐藏的部件（等真要接时再恢复）：
 *   - 忘记密码 / 验证码登录 / 竖分隔线（SecondaryActions）
 *   - "或"分割线（OrDivider）
 *   - 微信 / Apple / 手机快捷登录（SocialLoginRow + CircleSocialButton）
 *   - useComingSoon 提示（仅未接通按钮用得到）
 */

/** 顶部插画占位（规格 §九.1：约 145×150px，右侧偏上） */
export function IllustrationSlot({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center rounded-3xl border border-dashed border-[var(--color-primary)]/30 bg-[var(--color-primary-soft)]/60 ${className}`}
    >
      <span className="px-3 text-center text-[11px] leading-tight text-[var(--color-primary)]/70">
        插画占位
        <br />
        145 × 150
      </span>
    </div>
  );
}

/** 太阳 icon（标题左侧，规格 §九.2：32×32） */
export function SunBadge() {
  return (
    <span
      aria-hidden
      className="flex h-8 w-8 items-center justify-center rounded-full text-2xl"
      style={{
        background:
          "radial-gradient(circle at 50% 50%, #FFE082 0%, #FFC107 70%, #FFA000 100%)",
        boxShadow: "0 4px 12px rgba(255,193,7,0.35)",
      }}
    >
      ☀️
    </span>
  );
}

/** 装饰进度条（规格 §九.4） */
export function ProgressDots() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      <span className="h-1 w-5 rounded-full bg-[var(--color-primary)]" />
      <span className="h-1 w-1 rounded-full bg-[var(--color-primary-soft)] ring-1 ring-[var(--color-primary)]/40" />
    </div>
  );
}

/** 注册条（规格 §十六：高 56 圆角 16 背景 #F2FBF6） */
export function RegisterBar({
  href,
  children,
}: {
  href: string;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex h-14 w-full items-center justify-center gap-1 rounded-2xl border border-[var(--color-register-border)] bg-[var(--color-register-bg)] transition hover:bg-[var(--color-primary-soft)]"
    >
      {children ?? (
        <>
          <span className="text-sm font-normal text-[var(--color-text-primary)]">
            还没有账号？
          </span>
          <span className="text-sm font-semibold text-[var(--color-primary)]">
            立即注册
          </span>
          <ChevronRight size={16} className="text-[var(--color-primary)]" />
        </>
      )}
    </Link>
  );
}
