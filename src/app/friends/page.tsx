import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import {
  getFriendData,
  getLeaderboardData,
  getTeamLeaderboardData,
  isLeaderboardDimension,
  type LeaderboardDimension,
} from "@/lib/friend-data";
import { getFriendsFeedData } from "@/lib/friends-feed-data";
import { PhoneFrame } from "@/components/phone-frame";
import { BottomNav } from "@/components/home/bottom-nav";
import { FriendsHeader } from "./friends-header";
import { FriendsTab } from "./friends-tab";
import { FeedTab } from "./feed-tab";
import { RankTab } from "./rank-tab";
import { TeamRankTab } from "./team-rank-tab";

/** 排行榜子维度（v2.0）：余额 / 累计收入 / 净金额 / 团队 */
const RANK_DIMENSIONS: { key: string; label: string }[] = [
  { key: "balance", label: "余额" },
  { key: "earned", label: "累计收入" },
  { key: "net", label: "净金额" },
  { key: "team", label: "团队" },
];

/**
 * 好友页：动态（默认）/ 好友列表 / 排行榜 三个 tab（URL searchParams
 * 切换，server component 按 tab 条件拉取，无 hydration 逻辑）。
 * 动态流为主视图（好友动态页_prompt §一），点赞/催打卡经 00090 RPC。
 * 排行榜含金额三维度 + 团队榜（v2.0，dim searchParam 切换）。
 */
export default async function FriendsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; dim?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const { tab, dim } = await searchParams;
  const activeTab =
    tab === "friends" ? "friends" : tab === "rank" ? "rank" : "feed";
  const isTeam = activeTab === "rank" && dim === "team";
  const dimension: LeaderboardDimension = isLeaderboardDimension(dim)
    ? dim
    : "balance";

  let friendData;
  try {
    friendData = await getFriendData();
  } catch (error) {
    console.error("好友数据加载失败:", error);
    return (
      <PhoneFrame variant="home">
        <main className="flex flex-1 flex-col px-5 pb-24 pt-6">
          <FriendsHeader requests={[]} pendingReceivedCount={0} />
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="text-lg font-bold text-[var(--color-text-primary-2)]">
              好友数据加载失败
            </p>
            <p className="text-sm text-[var(--color-text-secondary)]">
              数据暂时不可用，请稍后刷新重试
            </p>
          </div>
          <BottomNav active="friends" />
        </main>
      </PhoneFrame>
    );
  }

  let feedData = null;
  if (activeTab === "feed") {
    try {
      feedData = await getFriendsFeedData();
    } catch (error) {
      console.error("好友动态加载失败:", error);
    }
  }

  let leaderboard: Awaited<ReturnType<typeof getLeaderboardData>> | null = null;
  let teamLeaderboard: Awaited<ReturnType<typeof getTeamLeaderboardData>> | null =
    null;
  let rankLoadFailed = false;
  if (activeTab === "rank") {
    try {
      if (isTeam) {
        teamLeaderboard = await getTeamLeaderboardData();
      } else {
        leaderboard = await getLeaderboardData(dimension);
      }
    } catch (error) {
      console.error("排行榜加载失败:", error);
      rankLoadFailed = true;
    }
  }

  return (
    <PhoneFrame variant="home">
      <main className="flex flex-1 flex-col px-5 pb-24 pt-6">
        <FriendsHeader
          requests={friendData.requests}
          pendingReceivedCount={friendData.pendingReceivedCount}
        />

        {/* tab 胶囊（Link 切换，searchParams 驱动；原生链接语义，不声明 tablist/tab 角色） */}
        <div className="mt-4 flex rounded-2xl bg-white p-1 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <TabLink href="/friends" active={activeTab === "feed"}>
            动态
          </TabLink>
          <TabLink
            href="/friends?tab=friends"
            active={activeTab === "friends"}
          >
            好友
          </TabLink>
          <TabLink href="/friends?tab=rank" active={activeTab === "rank"}>
            排行榜
          </TabLink>
        </div>

        <div className="mt-4 flex-1">
          {activeTab === "feed" ? (
            <FeedTab
              data={feedData}
              hasFriends={friendData.friends.length > 0}
            />
          ) : activeTab === "friends" ? (
            <FriendsTab data={friendData} />
          ) : (
            <>
              {/* 排行榜子维度胶囊（Link 切换，dim searchParams 驱动） */}
              <div className="mb-3 flex gap-2 overflow-x-auto">
                {RANK_DIMENSIONS.map(({ key, label }) => (
                  <DimTabLink
                    key={key}
                    href={`/friends?tab=rank&dim=${key}`}
                    active={isTeam ? key === "team" : key === dimension}
                  >
                    {label}
                  </DimTabLink>
                ))}
              </div>
              {isTeam ? (
                <TeamRankTab
                  entries={teamLeaderboard ?? []}
                  loadFailed={rankLoadFailed}
                />
              ) : (
                <RankTab
                  entries={leaderboard?.entries ?? []}
                  myUserId={leaderboard?.myUserId ?? user.id}
                  dimension={dimension}
                  loadFailed={rankLoadFailed}
                />
              )}
            </>
          )}
        </div>

        <BottomNav active="friends" />
      </main>
    </PhoneFrame>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex-1 rounded-xl py-2 text-center text-[15px] font-bold transition ${
        active
          ? "bg-[var(--color-primary)] text-white"
          : "text-[var(--color-text-secondary)]"
      }`}
    >
      {children}
    </Link>
  );
}

function DimTabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-bold transition ${
        active
          ? "bg-[var(--color-primary)] text-white"
          : "bg-white text-[var(--color-text-secondary)] shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
      }`}
    >
      {children}
    </Link>
  );
}
