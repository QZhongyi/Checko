import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { getHomeData } from "@/lib/home-data";
import { PhoneFrame } from "@/components/phone-frame";
import { HomeHeader } from "@/components/home/header";
import { HomeHero } from "@/components/home/home-hero";
import { HabitCard, type HabitCardData } from "@/components/home/habit-card";
import { BottomNav } from "@/components/home/bottom-nav";
import { EmptyState } from "@/components/home/empty-state";
import { LogoutButton } from "./logout-button";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const data = await getHomeData();

  // 项目 → HabitCard 数据映射（当前 RPC 返回的字段尚未含 theme/今日完成，
  // 暂用默认 green 主题、completedToday=false 占位）。
  const habits: HabitCardData[] = data.projects.map((p) => ({
    id: p.id,
    title: p.name,
    theme: "green",
    currentStreak: p.currentStreak,
    targetStreak: Math.max(p.maxStreak, p.currentStreak, 1),
    completedToday: false,
  }));

  const isEmpty = data.state === "EMPTY";
  const heroVariant: "active" | "debt" | "completed" =
    data.state === "DEBT" ? "debt" : "active";

  return (
    <PhoneFrame variant="home">
      <main className="flex flex-1 flex-col pb-2">
        <HomeHeader
          nickname={data.profile?.nickname}
          walletBalance={data.profile?.walletBalance ?? 0}
          debtAmount={data.debtAmount}
          isEmpty={isEmpty}
        />

        {/* 临时登出入口（放在底部 nav "我的" 真正实现前） */}
        <div className="flex justify-end px-6 pt-2">
          <LogoutButton />
        </div>

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

        <div className="mt-4">
          <BottomNav />
        </div>
      </main>
    </PhoneFrame>
  );
}
