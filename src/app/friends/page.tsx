import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { getFriendData, getLeaderboardData } from "@/lib/friend-data";
import { PhoneFrame } from "@/components/phone-frame";
import { BottomNav } from "@/components/home/bottom-nav";
import { FriendsHeader } from "./friends-header";
import { FriendsTab } from "./friends-tab";
import { RankTab } from "./rank-tab";

/**
 * 好友页（基础版）：好友列表 / 排行榜 两个 tab（URL searchParams 切换，
 * server component 按 tab 条件拉取，无 hydration 逻辑）。
 * 动态流 / 点赞 / 催打卡不在本轮范围。
 */
export default async function FriendsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const { tab } = await searchParams;
  const activeTab = tab === "rank" ? "rank" : "friends";

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

  let leaderboard: Awaited<ReturnType<typeof getLeaderboardData>> | null = null;
  if (activeTab === "rank") {
    try {
      leaderboard = await getLeaderboardData();
    } catch (error) {
      console.error("排行榜加载失败:", error);
      leaderboard = null;
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
          <TabLink href="/friends" active={activeTab === "friends"}>
            好友
          </TabLink>
          <TabLink href="/friends?tab=rank" active={activeTab === "rank"}>
            排行榜
          </TabLink>
        </div>

        <div className="mt-4 flex-1">
          {activeTab === "friends" ? (
            <FriendsTab data={friendData} />
          ) : (
            <RankTab
              entries={leaderboard?.entries ?? []}
              myUserId={leaderboard?.myUserId ?? user.id}
              loadFailed={leaderboard === null}
            />
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
