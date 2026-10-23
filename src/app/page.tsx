import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { getHomeData } from "@/lib/home-data";
import { PhoneFrame } from "@/components/phone-frame";
import { HomeHeader } from "@/components/home/header";
import { HomeHero } from "@/components/home/home-hero";
import { HabitCard, type HabitCardData } from "@/components/home/habit-card";
import { BottomNav } from "@/components/home/bottom-nav";
import { EmptyState } from "@/components/home/empty-state";
import { InvitationBanner } from "@/components/home/invitation-banner";
import { DebtStrip } from "@/components/home/debt-strip";

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
    groupBadge: p.groupBadge,
    inDebt: data.state === "DEBT",
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
        />

        {data.invitations.length > 0 ? (
          <div className="px-5 pt-4">
            <InvitationBanner invitations={data.invitations} />
          </div>
        ) : null}

        {data.pendingProjects.length > 0 ? (
          <section aria-label="待开始的项目" className="px-5 pt-4">
            {data.pendingProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.045)] transition active:scale-[0.98]"
              >
                <span
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-icon-bg)] text-xl"
                >
                  {project.icon ?? "📝"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-5 text-[var(--color-text-primary)]">
                    {project.name}
                  </p>
                  <p className="mt-0.5 text-xs leading-4 text-[var(--color-text-secondary)]">
                    {project.projectType === "group"
                      ? "👥 多人项目"
                      : "📝 个人项目"}{" "}
                    · {project.startsAt ?? "待定"} 开始
                    {project.isOwner && project.projectType === "group"
                      ? " · 可邀请好友"
                      : ""}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-[var(--color-text-secondary)]">
                  待开始
                </span>
              </Link>
            ))}
          </section>
        ) : null}

        {data.finishedProjects.length > 0 ? (
          <section aria-label="已完成的项目" className="px-5 pt-4">
            {data.finishedProjects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.045)] transition active:scale-[0.98]"
              >
                <span
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-icon-bg)] text-xl"
                >
                  {project.icon ?? "📝"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-5 text-[var(--color-text-primary)]">
                    {project.name}
                  </p>
                  <p className="mt-0.5 text-xs leading-4 text-[var(--color-text-secondary)]">
                    🎯 有限次任务 · {project.current}/{project.target} 次
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium text-[var(--color-primary)]">
                  已完成
                </span>
              </Link>
            ))}
          </section>
        ) : null}

        {isEmpty ? (
          <EmptyState />
        ) : (
          <>
            {/* Hero 仅在确有今日义务时展示（00080 评审 P3-3）：
                只有已完成/待开始/邀请时不再渲染"今日 0/0 已打卡" */}
            {data.totalToday > 0 ? (
              <HomeHero
                variant={heroVariant}
                completed={data.completedToday}
                total={data.totalToday}
                streak={data.streak}
              />
            ) : null}

            {/* 负债信息条（DEBT 态常驻，不依赖 hero 渲染条件） */}
            {data.state === "DEBT" ? (
              <DebtStrip debtAmount={data.debtAmount} />
            ) : null}

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
