import "server-only";

import { createSupabaseServerClient } from "@/utils/supabase/server";
import type { Database } from "@/utils/supabase/types";

/**
 * 好友页数据访问层（DAL）
 *
 * 口径（00052 RPC，服务端算好，组件零逻辑）：
 *   - 好友列表 = accepted 好友 + 今日打卡聚合（今日 x/y，个人 active+daily
 *     项目口径）+ 最大 current_streak。private 好友仍显示（关系事实，
 *     与排行榜过滤 private 的口径区分）。
 *   - 申请列表 = 我参与的全部 pending 行（direction 区分收到/发出）。
 *   - 排行榜 = get_friend_leaderboard（自己 + 非 private 好友）；
 *     排序非 RPC 合同，前端自行排序与编号。
 *   - 任一必需 RPC 失败直接抛错，由页面渲染失败态。
 */

type Db = Database["public"];
type FriendRow = Db["Functions"]["get_my_friends"]["Returns"][number];
type FriendshipRow =
  Db["Functions"]["get_my_friendships"]["Returns"][number];
type LeaderboardRow =
  Db["Functions"]["get_friend_leaderboard"]["Returns"][number];

export type FriendItem = {
  userId: string;
  nickname: string | null;
  avatar: string | null;
  todayTotal: number;
  todayCompleted: number;
  streak: number;
  /** 对应 friendships 行 id（删除好友用；表级 RLS 直查自己参与的关系行） */
  friendshipId: string | null;
};

export type FriendRequest = {
  friendshipId: string;
  direction: "received" | "sent";
  userId: string;
  nickname: string | null;
  avatar: string | null;
  requestedAt: string;
};

export type FriendData = {
  friends: FriendItem[];
  requests: FriendRequest[];
  /** 收到的待处理申请数（顶栏红点） */
  pendingReceivedCount: number;
};

/** 邀请成员弹窗用：我的好友（昵称 + 头像，不带聚合） */
export type InvitableFriend = {
  userId: string;
  nickname: string | null;
  avatar: string | null;
};

export async function getInvitableFriends(): Promise<InvitableFriend[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase.rpc("get_my_friends");
  if (error) {
    throw new Error(`好友列表加载失败: ${error.message}`);
  }
  return (data ?? []).map((row: FriendRow) => ({
    userId: row.user_id,
    nickname: row.nickname,
    avatar: row.avatar,
  }));
}

export async function getFriendData(): Promise<FriendData> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { friends: [], requests: [], pendingReceivedCount: 0 };
  }

  const [friendsRes, requestsRes] = await Promise.all([
    supabase.rpc("get_my_friends"),
    supabase.rpc("get_my_friendships"),
  ]);

  if (friendsRes.error) {
    throw new Error(`好友列表加载失败: ${friendsRes.error.message}`);
  }
  if (requestsRes.error) {
    throw new Error(`好友申请加载失败: ${requestsRes.error.message}`);
  }

  // friendship_id 补充来源：表级 RLS 允许查自己参与的关系行
  //（get_my_friends 聚合 RPC 不返回它）
  const pairsRes = await supabase
    .from("friendships")
    .select("id, user_low_id, user_high_id")
    .eq("status", "accepted");
  if (pairsRes.error) {
    throw new Error(`好友关系加载失败: ${pairsRes.error.message}`);
  }
  const friendshipIdByUser = new Map<string, string>();
  for (const row of pairsRes.data ?? []) {
    const other =
      row.user_low_id === user.id ? row.user_high_id : row.user_low_id;
    friendshipIdByUser.set(other, row.id);
  }

  const friends: FriendItem[] = (friendsRes.data ?? []).map(
    (row: FriendRow) => ({
      userId: row.user_id,
      nickname: row.nickname,
      avatar: row.avatar,
      todayTotal: Number(row.today_total),
      todayCompleted: Number(row.today_completed),
      streak: row.streak,
      friendshipId: friendshipIdByUser.get(row.user_id) ?? null,
    }),
  );

  const requests: FriendRequest[] = (requestsRes.data ?? []).map(
    (row: FriendshipRow) => ({
      friendshipId: row.friendship_id,
      direction: row.direction === "sent" ? "sent" : "received",
      userId: row.user_id,
      nickname: row.nickname,
      avatar: row.avatar,
      requestedAt: row.requested_at,
    }),
  );

  return {
    friends,
    requests,
    pendingReceivedCount: requests.filter((r) => r.direction === "received")
      .length,
  };
}

export type LeaderboardEntry = {
  userId: string;
  nickname: string | null;
  avatar: string | null;
  walletBalance: number;
  totalEarned: number;
  totalSpent: number;
};

/** 金额排行榜维度（v2.0）：余额 / 累计收入 / 净金额（= 累计收入 - 累计消费） */
export type LeaderboardDimension = "balance" | "earned" | "net";

export function isLeaderboardDimension(
  value: string | undefined,
): value is LeaderboardDimension {
  return value === "balance" || value === "earned" || value === "net";
}

/** 排序值：与 RankTab 展示值保持同一口径 */
export function leaderboardMetric(
  entry: LeaderboardEntry,
  dimension: LeaderboardDimension,
): number {
  if (dimension === "earned") {
    return entry.totalEarned;
  }
  if (dimension === "net") {
    return entry.totalEarned - entry.totalSpent;
  }
  return entry.walletBalance;
}

export async function getLeaderboardData(
  dimension: LeaderboardDimension = "balance",
): Promise<{
  entries: LeaderboardEntry[];
  myUserId: string | null;
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { entries: [], myUserId: null };
  }

  const { data, error } = await supabase.rpc("get_friend_leaderboard");
  if (error) {
    throw new Error(`排行榜加载失败: ${error.message}`);
  }

  // 排序责任在前端（00042：RPC 的 ORDER BY 不是公共合同）
  const entries: LeaderboardEntry[] = (data ?? [])
    .map((row: LeaderboardRow) => ({
      userId: row.user_id,
      nickname: row.nickname,
      avatar: row.avatar,
      walletBalance: row.wallet_balance,
      totalEarned: row.total_earned,
      totalSpent: row.total_spent,
    }))
    .sort(
      (a, b) =>
        leaderboardMetric(b, dimension) - leaderboardMetric(a, dimension) ||
        a.userId.localeCompare(b.userId),
    );

  return { entries, myUserId: user.id };
}

export type TeamLeaderboardEntry = {
  projectId: string;
  projectName: string;
  projectIcon: string | null;
  projectColor: string | null;
  memberCount: number;
  teamBalance: number;
};

/** 团队排行榜（v2.0）：我参与的多人项目按团队整体余额聚合（00042 RPC） */
export async function getTeamLeaderboardData(): Promise<
  TeamLeaderboardEntry[]
> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return [];
  }

  const { data, error } = await supabase.rpc("get_my_team_leaderboard");
  if (error) {
    throw new Error(`团队排行榜加载失败: ${error.message}`);
  }

  const entries: TeamLeaderboardEntry[] = (data ?? []).map(
    (row: Db["Functions"]["get_my_team_leaderboard"]["Returns"][number]) => ({
      projectId: row.project_id,
      projectName: row.project_name,
      projectIcon: row.project_icon,
      projectColor: row.project_color,
      memberCount: row.member_count,
      teamBalance: row.team_balance,
    }),
  );

  entries.sort(
    (a, b) =>
      b.teamBalance - a.teamBalance || a.projectId.localeCompare(b.projectId),
  );

  return entries;
}
