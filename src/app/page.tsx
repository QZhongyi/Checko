import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { getHomeData } from "@/lib/home-data";
import { PhoneFrame } from "@/components/phone-frame";
import { HomeHeader } from "@/components/home/header";
import { HomeHero } from "@/components/home/home-hero";
import { HabitCard, type HabitCardData } from "@/components/home/habit-card";
import { BottomNav } from "@/components/home/bottom-nav";
import { EmptyState } from "@/components/home/empty-state";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  let data;
  try {
    data = await getHomeData();
  } catch (error) {
    // 必需 RPC 失败：明确渲染失败态，不降级成空项目/余额 0 等业务状态
    console.error("首页数据加载失败:", error);
    return (
      <PhoneFrame variant="home">
        <main className="flex flex-1 flex-col items-center justify-center gap-3 px-8 pb-2 text-center">
          <p className="text-lg font-bold text-[var(--color-text-primary-2)]">
            首页加载失败
          </p>
          <p className="text-sm text-[var(--color-text-secondary)]">
            数据暂时不可用，请稍后刷新重试
          </p>
        </main>
        <div className="mt-4">
          <BottomNav />
        </div>
      </PhoneFrame>
    );
  }

  // 项目 → HabitCard 数据映射（icon/color 来自项目行，无则用卡片默认色）。
  const habits: HabitCardData[] = data.projects.map((p) => ({
    id: p.id,
    title: p.name,
    icon: p.icon,
    color: p.color,
    currentStreak: p.currentStreak,
    targetStreak: Math.max(p.maxStreak, p.currentStreak, 1),
    completedToday: p.completedToday,
    rewardCoins: p.rewardCoins,
    rewardMode: p.rewardMode,
    rewardNValue: p.rewardNValue,
    todayCheckinId: p.todayCheckinId,
    canRevoke: p.canRevoke,
    deadlineAt: p.deadlineAt,
  }));

  const isEmpty = data.state === "EMPTY";
  const heroVariant: "active" | "debt" | "completed" =
    data.state === "DEBT"
      ? "debt"
      : data.state === "ALL_COMPLETED"
        ? "completed"
        : "active";

  return (
    <PhoneFrame variant="home">
      <main className="flex flex-1 flex-col pb-24">
        <HomeHeader
          nickname={data.profile?.nickname}
          walletBalance={data.profile?.walletBalance ?? 0}
          debtAmount={data.debtAmount}
          isEmpty={isEmpty}
        />

        {isEmpty ? (
          <EmptyState />
        ) : (
          <>
            <HomeHero
              variant={heroVariant}
              completed={data.completedToday}
              total={data.totalToday}
              streak={data.streak}
            />

            {/* 今日打卡 Section */}
            <section className="flex flex-col gap-3 px-5 pt-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[22px] font-bold leading-[30px] text-[var(--color-text-primary-2)]">
                  今日打卡
                </h2>
              </div>

              <div className="flex flex-col gap-3">
                {habits.length === 0 ? (
                  <p className="rounded-2xl bg-white/60 px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">
                    暂无今日打卡项
                  </p>
                ) : (
                  habits.map((habit) => (
                    <HabitCard key={habit.id} habit={habit} />
                  ))
                )}
              </div>
            </section>
          </>
        )}

        {/* 底部导航：绝对定位常驻视口（PhoneFrame relative），内容预留底部空间 */}
        <BottomNav active="home" />
      </main>
    </PhoneFrame>
  );
}
