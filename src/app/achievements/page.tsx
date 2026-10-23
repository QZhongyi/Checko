import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Trophy } from "lucide-react";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import {
  getAchievementsData,
  STREAK_THRESHOLDS,
} from "@/lib/achievement-data";
import { PhoneFrame } from "@/components/phone-frame";
import { BottomNav } from "@/components/home/bottom-nav";
import { AchievementStatCards } from "@/components/achievements/stat-cards";
import { MilestoneCard } from "@/components/achievements/milestone-card";
import {
  StreakBadgeWall,
  RARITY_COLORS,
} from "@/components/achievements/streak-badge-wall";

/**
 * 成就页（需求 §9.2.5 / 成就页_prompt 据实裁剪）：三联统计卡 +
 * 下一个里程碑 + streak 徽章墙 4 枚。筛选 chip/排序/最近解锁时间线/
 * 好友排行预览/解锁动效不在本批（无数据/动效批）。
 */
export default async function AchievementsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  let data;
  try {
    data = await getAchievementsData();
  } catch (error) {
    console.error("成就数据加载失败:", error);
    return (
      <PhoneFrame variant="home">
        <main className="flex flex-1 flex-col px-5 pb-24 pt-6">
          <TopBar />
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="text-lg font-bold text-[var(--color-text-primary-2)]">
              成就加载失败
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              数据暂时不可用，请稍后刷新重试
            </p>
          </div>
          <BottomNav active="achievements" />
        </main>
      </PhoneFrame>
    );
  }

  const unlockedCount = data.streakBadges.length;
  // 全部解锁时无下一里程碑，不渲染里程碑卡（任务书允许的最简终态）
  const nextThreshold = STREAK_THRESHOLDS.find(
    (t) => !data.streakBadges.some((b) => b.value === t),
  );

  return (
    <PhoneFrame variant="home">
      <main className="flex flex-1 flex-col px-5 pb-24 pt-6">
        <TopBar />

        <AchievementStatCards
          walletBalance={data.walletBalance}
          totalEarned={data.totalEarned}
          badgeCount={unlockedCount}
          badgeTotal={STREAK_THRESHOLDS.length}
          currentStreak={data.maxCurrentStreak}
          longestStreak={data.maxStreak}
        />

        {nextThreshold ? (
          <MilestoneCard
            threshold={nextThreshold}
            maxStreak={data.maxStreak}
            rarityColor={RARITY_COLORS[nextThreshold]}
          />
        ) : null}

        {unlockedCount === 0 ? (
          <section className="mt-4 rounded-3xl bg-white p-5 text-center shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
            <p className="text-sm font-bold text-[var(--color-text-primary-2)]">
              还没有解锁徽章
            </p>
            <p className="mt-1 text-xs font-medium text-[var(--color-text-secondary)]">
              完成第一次打卡，解锁你的第一个徽章吧
            </p>
          </section>
        ) : null}

        <StreakBadgeWall
          thresholds={STREAK_THRESHOLDS}
          badges={data.streakBadges}
          maxStreak={data.maxStreak}
        />

        <BottomNav active="achievements" />
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
      <h1 className="flex items-center gap-1.5 text-[20px] font-bold leading-7 text-[var(--color-text-primary-2)]">
        成就
        <Trophy size={18} className="text-[var(--color-coin-yellow)]" />
      </h1>
    </header>
  );
}
