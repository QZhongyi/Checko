import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { getProfileData } from "@/lib/profile-data";
import { PhoneFrame } from "@/components/phone-frame";
import { BottomNav } from "@/components/home/bottom-nav";
import { CoinIcon } from "@/components/ui/coin-icon";
import { LogoutButton } from "@/app/logout-button";
import { NicknameEditor } from "./nickname-editor";
import { VisibilitySwitch } from "./visibility-switch";

/**
 * 个人中心（基础版）：昵称编辑 + 钱包统计概览 + 隐私设置 + 登出。
 * 头像上传、成就、设置详情页不在本轮范围。
 */
export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  let data;
  try {
    data = await getProfileData();
  } catch (error) {
    console.error("个人资料加载失败:", error);
    return (
      <PhoneFrame variant="home">
        <main className="flex flex-1 flex-col px-5 pb-24 pt-6">
          <h1 className="text-[22px] font-bold leading-[30px] text-[var(--color-text-primary-2)]">
            我的
          </h1>
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="text-lg font-bold text-[var(--color-text-primary-2)]">
              资料加载失败
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              数据暂时不可用，请稍后刷新重试
            </p>
          </div>
          <BottomNav active="profile" />
        </main>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame variant="home">
      <main className="flex flex-1 flex-col px-5 pb-24 pt-6">
        <h1 className="text-[22px] font-bold leading-[30px] text-[var(--color-text-primary-2)]">
          我的
        </h1>

        {/* 头像占位 + 昵称编辑 */}
        <section className="mt-4 flex items-center gap-4 rounded-3xl bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
          <span
            aria-hidden
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#EFFAF3] text-2xl font-bold text-[var(--color-primary)]"
          >
            {(data?.nickname ?? "?").slice(0, 1).toUpperCase()}
          </span>
          <NicknameEditor initialNickname={data?.nickname ?? ""} />
        </section>

        {/* 钱包统计概览 */}
        <section className="mt-4 rounded-3xl bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[16px] font-bold text-[var(--color-text-primary-2)]">
              小荷包概览
            </h2>
            <p className="flex items-center gap-1 text-[13px] font-medium text-[var(--color-text-secondary)]">
              余额 <CoinIcon size={13} /> {data?.walletBalance ?? 0}
            </p>
          </div>
          <div className="mt-3 grid grid-cols-3 divide-x divide-[#F3F4F6]">
            <Stat label="累计获得" value={`+${data?.totalEarned ?? 0}`} valueClass="text-[var(--color-coin-yellow)]" />
            <Stat label="累计消费" value={`-${data?.totalSpent ?? 0}`} valueClass="text-[var(--color-debt-red)]" />
            <Stat label="累计惩罚" value={`-${data?.totalPenalty ?? 0}`} valueClass="text-[var(--color-debt-red)]" />
          </div>
        </section>

        {/* 隐私设置 */}
        <section className="mt-4 rounded-3xl bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
          <h2 className="text-[16px] font-bold text-[var(--color-text-primary-2)]">
            资料可见性
          </h2>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            影响好友搜索与排行榜可见范围
          </p>
          <VisibilitySwitch initialVisibility={data?.profileVisibility ?? "friends"} />
        </section>

        {/* 登出收口（原首页临时按钮移到这里） */}
        <div className="mt-6 flex justify-center">
          <LogoutButton />
        </div>

        <BottomNav active="profile" />
      </main>
    </PhoneFrame>
  );
}

function Stat({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs font-medium text-[var(--color-text-secondary)]">
        {label}
      </span>
      <span className={`mt-1 text-[16px] font-bold ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}
