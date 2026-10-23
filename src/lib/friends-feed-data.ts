import "server-only";

import { createSupabaseServerClient } from "@/utils/supabase/server";

/**
 * 好友动态 DAL（00090 get_friends_feed 单行 jsonb 合同）
 *
 * 条目三类型（打卡 / streak 里程碑 / 今日缺卡推导），交互计数
 * （like_count / liked_by_me / nudged_by_me）服务端算好，组件零逻辑。
 * 相对时间在服务端格式化（避免 client 重算的 hydration 漂移）。
 */

export type FeedUser = {
  userId: string;
  nickname: string | null;
  avatar: string | null;
};

export type FeedProject = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  type: "personal" | "group";
};

/** 类型 1：好友打卡（多人项目并入，附今日 x/y 进度） */
export type CheckinFeedEntry = {
  kind: "checkin";
  targetId: string;
  user: FeedUser;
  project: FeedProject;
  note: string | null;
  reward: number;
  streak: number;
  groupDone: number | null;
  groupTotal: number | null;
  likeCount: number;
  likedByMe: boolean;
  timeLabel: string;
};

/** 类型 2：streak 里程碑解锁（achievements 无项目关联，不带项目名） */
export type AchievementFeedEntry = {
  kind: "achievement";
  targetId: string;
  user: FeedUser;
  value: number;
  likeCount: number;
  likedByMe: boolean;
  timeLabel: string;
};

/** 类型 4：今日缺卡推导（催打卡目标） */
export type MissedFeedEntry = {
  kind: "missed";
  user: FeedUser;
  project: FeedProject;
  nudgedByMe: boolean;
};

export type FeedEntry =
  | CheckinFeedEntry
  | AchievementFeedEntry
  | MissedFeedEntry;

export type FeedStats = {
  friendsTotal: number;
  friendsChecked: number;
  myStreak: number;
  myBalance: number;
};

export type FriendsFeedData = {
  entries: FeedEntry[];
  stats: FeedStats;
};

/** 服务端相对时间（7 天窗口内：刚刚/N 分钟前/N 小时前/昨天/N 天前） */
function relativeTimeLabel(iso: string, now: Date): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const minutes = Math.floor((now.getTime() - t) / 60000);
  if (minutes < 2) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "昨天";
  if (days < 7) return `${days} 天前`;
  return "";
}

function asUser(raw: Record<string, unknown>): FeedUser {
  return {
    userId: String(raw.user_id ?? ""),
    nickname: raw.nickname == null ? null : String(raw.nickname),
    avatar: raw.avatar == null ? null : String(raw.avatar),
  };
}

function asProject(raw: Record<string, unknown>): FeedProject {
  return {
    id: String(raw.project_id ?? ""),
    name: String(raw.project_name ?? "未知项目"),
    icon: raw.project_icon == null ? null : String(raw.project_icon),
    color: raw.project_color == null ? null : String(raw.project_color),
    type: raw.project_type === "group" ? "group" : "personal",
  };
}

function asNumber(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function parseEntries(items: unknown, now: Date): FeedEntry[] {
  if (!Array.isArray(items)) return [];
  return items.flatMap((raw): FeedEntry[] => {
    if (typeof raw !== "object" || raw === null) return [];
    const e = raw as Record<string, unknown>;
    const type = String(e.type ?? "");
    if (type === "checkin") {
      return [
        {
          kind: "checkin",
          targetId: String(e.id ?? ""),
          user: asUser(e),
          project: asProject(e),
          note: e.note == null ? null : String(e.note),
          reward: asNumber(e.reward),
          streak: asNumber(e.streak),
          groupDone:
            e.group_done == null ? null : asNumber(e.group_done),
          groupTotal:
            e.group_total == null ? null : asNumber(e.group_total),
          likeCount: asNumber(e.like_count),
          likedByMe: e.liked_by_me === true,
          timeLabel: relativeTimeLabel(String(e.ts ?? ""), now),
        },
      ];
    }
    if (type === "achievement") {
      return [
        {
          kind: "achievement",
          targetId: String(e.id ?? ""),
          user: asUser(e),
          value: asNumber(e.achievement_value),
          likeCount: asNumber(e.like_count),
          likedByMe: e.liked_by_me === true,
          timeLabel: relativeTimeLabel(String(e.ts ?? ""), now),
        },
      ];
    }
    if (type === "missed") {
      return [
        {
          kind: "missed",
          user: asUser(e),
          project: asProject(e),
          nudgedByMe: e.nudged_by_me === true,
        },
      ];
    }
    return [];
  });
}

export async function getFriendsFeedData(): Promise<FriendsFeedData> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      entries: [],
      stats: { friendsTotal: 0, friendsChecked: 0, myStreak: 0, myBalance: 0 },
    };
  }

  const { data, error } = await supabase.rpc("get_friends_feed");
  if (error) {
    throw new Error(`好友动态加载失败: ${error.message}`);
  }

  const row = (data ?? [])[0] as
    | { v_items?: unknown; v_stats?: unknown }
    | undefined;
  const statsRaw =
    typeof row?.v_stats === "object" && row.v_stats !== null
      ? (row.v_stats as Record<string, unknown>)
      : {};
  const now = new Date();

  return {
    entries: parseEntries(row?.v_items, now),
    stats: {
      friendsTotal: asNumber(statsRaw.friends_total),
      friendsChecked: asNumber(statsRaw.friends_checked),
      myStreak: asNumber(statsRaw.my_streak),
      myBalance: asNumber(statsRaw.my_balance),
    },
  };
}
