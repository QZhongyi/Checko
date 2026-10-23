import Link from "next/link";
import { CoinIcon } from "@/components/ui/coin-icon";

/**
 * 负债信息条（draft/首页-待偿还.png：Hero 与"今日打卡"之间的提示区）
 */
export function DebtStrip({ debtAmount }: { debtAmount: number }) {
  return (
    <section aria-label="负债提示" className="px-5 pt-4">
      <div className="flex h-11 items-center justify-between rounded-xl bg-[#FFF2F2] px-4 text-sm font-medium text-[var(--color-debt-red)]">
        <p className="flex items-center gap-1">
          当前待偿还 <CoinIcon size={14} /> {debtAmount} · 打卡赚取金币即可偿还
        </p>
        <Link href="/wallet" className="shrink-0 text-xs">
          了解 ›
        </Link>
      </div>
    </section>
  );
}
