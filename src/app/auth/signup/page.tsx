import { SignupForm } from "./signup-form";
import {
  IllustrationSlot,
  SunBadge,
  ProgressDots,
} from "@/components/auth-widgets";
import { PhoneFrame } from "@/components/phone-frame";

export default function SignupPage() {
  return (
    <PhoneFrame>
      <main className="relative flex flex-1 flex-col px-5 pb-6 pt-12">
        {/* Header 区域（沿用登录页规格） */}
        <header className="relative mb-5">
          <IllustrationSlot className="absolute right-0 top-0 h-[120px] w-[40%] max-w-[145px] sm:h-[150px]" />

          <div className="relative mt-[90px] flex items-center gap-2 sm:mt-[110px]">
            <SunBadge />
            <h1 className="text-[28px] font-bold leading-[34px] tracking-[-0.5px] text-[var(--color-text-primary)]">
              创建账号
            </h1>
          </div>

          <p className="mt-2 text-sm font-normal leading-5 text-[var(--color-text-secondary)]">
            开启你的打卡旅程
          </p>

          <div className="mt-3">
            <ProgressDots />
          </div>
        </header>

        {/* 主卡片 */}
        <section className="rounded-[30px] bg-white px-5 pb-6 pt-8 shadow-[0_8px_30px_rgba(0,0,0,0.035)] sm:px-6">
          <SignupForm />
        </section>
      </main>
    </PhoneFrame>
  );
}
