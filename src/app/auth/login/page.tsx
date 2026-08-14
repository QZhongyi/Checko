import { LoginForm } from "./login-form";
import {
  IllustrationSlot,
  SunBadge,
  ProgressDots,
} from "@/components/auth-widgets";
import { PhoneFrame } from "@/components/phone-frame";

export default function LoginPage() {
  return (
    <PhoneFrame>
      <main className="relative flex flex-1 flex-col px-5 pb-6 pt-12">
        {/* ============ Header 区域（规格 §九）============ */}
        <header className="relative mb-5">
          {/* 顶部插画：右侧偏上，规格 §九.1，约 145×150 */}
          <IllustrationSlot className="absolute right-0 top-0 h-[120px] w-[40%] max-w-[145px] sm:h-[150px]" />

          {/* 欢迎标题：左侧，规格 §九.2 */}
          <div className="relative mt-[90px] flex items-center gap-2 sm:mt-[110px]">
            <SunBadge />
            <h1 className="text-[28px] font-bold leading-[34px] tracking-[-0.5px] text-[var(--color-text-primary)]">
              欢迎回来
            </h1>
          </div>

          {/* 副标题：规格 §九.3，margin-top 8 */}
          <p className="mt-2 text-sm font-normal leading-5 text-[var(--color-text-secondary)]">
            登录后继续你的打卡旅程
          </p>

          {/* 装饰进度条：规格 §九.4，margin-top 12 */}
          <div className="mt-3">
            <ProgressDots />
          </div>
        </header>

        {/* ============ LoginCard（规格 §十）============ */}
        <section className="rounded-[30px] bg-white px-5 pb-6 pt-8 shadow-[0_8px_30px_rgba(0,0,0,0.035)] sm:px-6">
          <LoginForm />
        </section>
      </main>
    </PhoneFrame>
  );
}
