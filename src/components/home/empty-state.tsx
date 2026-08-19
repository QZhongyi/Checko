import Link from "next/link";
import { IllustrationPlaceholder } from "./illustration";

/**
 * 空状态（home-ui-spec.md §13）
 *
 * EMPTY 状态隐藏 Hero / 项目列表，但保留 Header 和 BottomNav。
 * 这里只渲染中央插画 + 标题 + 描述 + 创建按钮。
 */
export function EmptyState() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-8 py-8">
      {/* 中央插画（真实资产就位前的精制替身） */}
      <IllustrationPlaceholder
        label="空状态插画：花盆与小植物"
        emoji="🌱"
        className="h-[260px] w-[270px] text-[96px]"
      />

      {/* 标题 */}
      <h2 className="mt-8 text-center text-[30px] font-bold leading-10 text-[var(--color-text-primary-2)]">
        还没有项目
      </h2>

      {/* 描述 */}
      <p className="mt-3 max-w-[300px] text-center text-base font-medium leading-[26px] text-[#707895]">
        创建你的第一个项目，种下一项新习惯，开始积累连续打卡。
      </p>

      {/* CTA */}
      <Link
        href="/create-project"
        className="mt-8 flex h-[60px] w-full max-w-[310px] items-center justify-center rounded-[28px] text-lg font-semibold text-white shadow-[0_10px_24px_rgba(34,197,94,0.16)] transition active:scale-[0.98]"
        style={{
          background:
            "linear-gradient(90deg, var(--color-primary), #2ED32C)",
        }}
      >
        创建第一个项目
      </Link>
    </section>
  );
}
