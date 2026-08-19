import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { getWalletData } from "@/lib/wallet-data";
import { PhoneFrame } from "@/components/phone-frame";
import { TransactionList } from "@/components/wallet/transaction-list";
import { WalletActions } from "./record-expense-sheet";

export default async function WalletPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  let data;
  try {
    data = await getWalletData();
  } catch (error) {
    console.error("荷包数据加载失败:", error);
    return (
      <PhoneFrame variant="home">
        <main className="flex flex-1 flex-col px-5 pb-8 pt-6">
          <TopBar />
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="text-lg font-bold text-[var(--color-text-primary-2)]">
              荷包加载失败
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              数据暂时不可用，请稍后刷新重试
            </p>
          </div>
        </main>
      </PhoneFrame>
    );
  }

  const inDebt = data.balance < 0;

  return (
    <PhoneFrame variant="home">
      <main className="relative flex flex-1 flex-col px-5 pb-10 pt-6">
        <TopBar />

        {/* 余额 Hero 卡 */}
        <section
          className="mt-4 overflow-hidden rounded-3xl p-5 shadow-[0_8px_24px_rgba(255,200,40,0.25)]"
          style={{
            background: inDebt
              ? "linear-gradient(135deg, #FF6868, #FF4141)"
              : "linear-gradient(135deg, #FFC800, #FFD700)",
          }}
        >
          <div className="flex items-start justify-between">
            <p className="text-[13px] font-medium text-white/90">
              {inDebt ? "待偿还" : "当前余额"} 🪙
            </p>
            <span className="rounded-full bg-white/25 px-2.5 py-1 text-xs font-bold text-white">
              {inDebt ? "💨 连续中断" : "🔥 坚持打卡"}
            </span>
          </div>
          <p className="mt-2 text-[48px] font-bold leading-[56px] text-white">
            {inDebt ? `-${Math.abs(data.balance)}` : data.balance}
          </p>

          {/* 本月双栏 */}
          <div className="mt-4 flex gap-8">
            <div>
              <p className="text-xs font-medium text-white/80">本月获得</p>
              <p className="mt-0.5 text-[18px] font-bold text-white">
                +{data.monthEarned} 🪙
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-white/80">本月消费</p>
              <p className="mt-0.5 text-[18px] font-bold text-white">
                -{data.monthSpent} 🪙
              </p>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <WalletActions balance={data.balance} todayIso={data.todayIso} />
          </div>
        </section>

        {/* 三联统计 */}
        <section className="mt-4 grid grid-cols-3 rounded-3xl bg-white py-4 shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
          <Stat
            label="累计获得"
            value={`+${data.totalEarned}`}
            valueClass="text-[var(--color-coin-yellow)]"
          />
          <Stat
            label="累计消费"
            value={`-${data.totalSpent}`}
            valueClass="text-[var(--color-debt-red)]"
            divider
          />
          <Stat
            label="净金额"
            value={`${data.netAmount >= 0 ? "" : "-"}${Math.abs(data.netAmount)}`}
            valueClass={
              data.netAmount >= 0
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-debt-red)]"
            }
            divider
          />
        </section>

        {/* 交易记录 */}
        <div className="mt-5">
          <h2 className="mb-3 text-[22px] font-bold leading-[30px] text-[var(--color-text-primary-2)]">
            收支记录
          </h2>
          <TransactionList transactions={data.transactions} />
        </div>
      </main>
    </PhoneFrame>
  );
}

function TopBar() {
  return (
    <header className="flex items-center gap-3">
      <Link
        href="/"
        aria-label="返回首页"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.025)]"
      >
        <ChevronLeft size={24} />
      </Link>
      <h1 className="text-[20px] font-bold leading-7 text-[var(--color-text-primary-2)]">
        小荷包 🪙
      </h1>
    </header>
  );
}

function Stat({
  label,
  value,
  valueClass,
  divider,
}: {
  label: string;
  value: string;
  valueClass: string;
  divider?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center ${divider ? "border-l border-[#F3F4F6]" : ""}`}
    >
      <span className="text-xs font-medium text-[var(--color-text-secondary)]">
        {label}
      </span>
      <span className={`mt-1 text-[17px] font-bold ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}
