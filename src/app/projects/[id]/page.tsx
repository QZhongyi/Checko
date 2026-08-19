import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { getProjectDetailData } from "@/lib/project-detail-data";
import { PhoneFrame } from "@/components/phone-frame";
import { RewardCard } from "@/components/project-detail/reward-card";
import { MonthCalendar } from "@/components/project-detail/month-calendar";
import { CheckinButton } from "./checkin-button";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    notFound(); // 详情页不做登录引导，未登录回首页会跳登录
  }

  let data;
  try {
    data = await getProjectDetailData(id);
  } catch (error) {
    console.error("详情页数据加载失败:", error);
    return (
      <PhoneFrame variant="home">
        <main className="flex flex-1 flex-col px-5 pb-8 pt-6">
          <TopBar name="项目详情" />
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="text-lg font-bold text-[var(--color-text-primary-2)]">
              加载失败
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              数据暂时不可用，请稍后刷新重试
            </p>
          </div>
        </main>
      </PhoneFrame>
    );
  }

  if (!data) {
    notFound();
  }

  const { project, eligibility, todayCheckinId, canRevoke, deadlineAt, calendar, calendarMonthLabel, calendarToday, stats, isMyStatsOnly } = data;

  return (
    <PhoneFrame variant="home">
      <main className="flex flex-1 flex-col px-5 pb-10 pt-6">
        <TopBar name={project.name} />

        {/* Hero */}
        <section
          className="mt-4 rounded-3xl p-5 shadow-[0_6px_20px_rgba(0,0,0,0.045)]"
          style={{ background: "var(--color-primary-soft)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl"
              style={{ background: "#FFFFFF" }}
            >
              {project.icon ?? "📝"}
            </span>
            <div>
              <h1 className="text-xl font-bold leading-7 text-[var(--color-text-primary-2)]">
                {project.name}
              </h1>
              <span className="mt-1 inline-block rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-medium text-[var(--color-text-secondary)]">
                {project.projectType === "personal"
                  ? "👤 个人项目"
                  : "👥 多人项目"}
              </span>
            </div>
          </div>

          <p className="mt-4 text-[28px] font-bold leading-9 text-[var(--color-orange)]">
            🔥 连续 {stats.currentStreak} 天
          </p>

          {/* 统计 chip 行（多人项目口径为"我的记录"） */}
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip>完成率 {stats.completionRate}%</Chip>
            <Chip>总打卡 {stats.totalCount} 次</Chip>
            <Chip>最长连续 {stats.maxStreak} 天</Chip>
          </div>
          {isMyStatsOnly ? (
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
              以上统计与日历均为「我的记录」
            </p>
          ) : null}

          <div className="mt-5">
            <CheckinButton
              projectId={project.id}
              eligibility={eligibility}
              rewardMode={project.rewardMode}
              rewardAmount={project.rewardAmount}
              todayCheckinId={todayCheckinId}
              canRevoke={canRevoke}
              deadlineAt={deadlineAt}
            />
          </div>
        </section>

        <RewardCard
          rewardMode={project.rewardMode}
          rewardNValue={project.rewardNValue}
          rewardAmount={project.rewardAmount}
          penaltyAmount={project.penaltyAmount}
          deadlineTime={project.deadlineTime}
          timezone={project.timezone}
        />

        <MonthCalendar monthLabel={calendarMonthLabel} days={calendar} today={calendarToday} />
      </main>
    </PhoneFrame>
  );
}

function TopBar({ name }: { name: string }) {
  return (
    <header className="flex items-center gap-3">
      <Link
        href="/"
        aria-label="返回首页"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.025)]"
      >
        <ChevronLeft size={24} />
      </Link>
      <h2 className="truncate text-[20px] font-bold leading-7 text-[var(--color-text-primary-2)]">
        {name}
      </h2>
    </header>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-[var(--color-text-secondary-2, #7f879a)]">
      {children}
    </span>
  );
}
