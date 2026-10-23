import Link from "next/link";
import Image from "next/image";
import sunIcon from "@/assets/images/home-complete/sun.png";
import { CoinIcon } from "@/components/ui/coin-icon";

/**
 * 首页 Header（首页设计图_prompt.md §4.1 顶部区）
 *
 * 结构：
 *   Greeting (SunIcon + 文本 + WaveIcon)
 *   Date?
 *   CoinPill (右侧)
 *
 * CoinPill 两种变体：normal / debt（由 props 控制）。
 * 空态不改变余额数值：EMPTY 只是"暂无进行中的项目"，不得把真实余额改写成 0。
 */
export function HomeHeader({
  nickname,
  walletBalance,
  debtAmount,
}: {
  nickname?: string | null;
  walletBalance: number;
  debtAmount: number;
}) {
  const greeting = greetingText(nickname);
  const dateText = formatDate(new Date());

  return (
    <header className="flex min-w-0 items-start justify-between gap-2 px-6 pt-10">
      {/* 左侧：问候（长昵称单行截断） */}
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-2">
          {/* 当前时间段氛围图标（设计稿太阳） */}
          <Image src={sunIcon} alt="" width={31} height={32} priority />
          <h1 className="min-w-0 truncate text-xl font-bold leading-8 text-[var(--color-text-primary-2)]">
            {greeting}
          </h1>
          {/* WaveIcon 占位 ~28 */}
          <span className="text-xl" aria-hidden>
            👋
          </span>
        </div>
        <p className="text-sm font-medium leading-5 text-[var(--color-text-secondary-2)]">
          {dateText}
        </p>
      </div>

      {/* 右侧：CoinPill（点击进入小荷包） */}
      <Link href="/wallet" aria-label="查看小荷包">
        <CoinPill
          walletBalance={walletBalance}
          debtAmount={debtAmount}
        />
      </Link>
    </header>
  );
}

function CoinPill({
  walletBalance,
  debtAmount,
}: {
  walletBalance: number;
  debtAmount: number;
}) {
  // 优先级：debt > normal（空态不改写余额数值，只影响页面其他区域的呈现）
  if (debtAmount > 0) {
    return (
      <div
        className="flex h-12 min-w-[88px] items-center gap-1.5 rounded-[22px] px-4 text-white shadow-[0_6px_18px_rgba(255,65,65,0.2)]"
        style={{
          background:
            "linear-gradient(135deg, #FF6868 0%, #FF4141 100%)",
        }}
      >
        <span className="text-xs font-medium">待偿还</span>
        <CoinIcon size={16} />
        <span className="text-lg font-bold leading-none">
          {debtAmount}
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-12 min-w-[88px] items-center gap-1.5 rounded-[22px] bg-white px-4 shadow-[0_6px_18px_rgba(0,0,0,0.05)]">
      <CoinIcon size={20} />
      <span className="text-lg font-bold leading-none text-[var(--color-text-primary-2)]">
        {walletBalance}
      </span>
    </div>
  );
}

function greetingText(nickname?: string | null): string {
  const hour = new Date().getHours();
  let base: string;
  if (hour < 6) base = "凌晨好";
  else if (hour < 11) base = "早上好";
  else if (hour < 13) base = "中午好";
  else if (hour < 18) base = "下午好";
  else base = "晚上好";
  return nickname ? `${base}，${nickname}` : base;
}

function formatDate(d: Date): string {
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${month}月${day}日 ${weekdayNames[d.getDay()]}`;
}
