import "server-only";

import { createSupabaseServerClient } from "@/utils/supabase/server";

/**
 * 首页数据访问层（DAL）
 *
 * 调用 Supabase RPC 获取当前用户的项目列表 + 个人资料 + 今日打卡状态，
 * 计算 HomeState（EMPTY / ACTIVE / DEBT / ALL_COMPLETED）。
 *
 * 口径：
 *   - 首页主集合 = get_today_checkin_status() 返回的项目（本人拥有或 active
 *     成员的 active+daily 项目）。get_visible_project_summaries 范围更宽
 *     （含 pending 邀请 / 公开 / 好友可见项目），仅作为补充字段来源，
 *     不得作为主集合（否则无关项目会污染打卡进度与 ALL_COMPLETED 判定）。
 *   - 任一必需 RPC 失败直接抛错，由页面渲染失败态；不把基础设施故障
 *     伪装成"空项目 / 余额 0 / 未完成"等业务状态。
 *
 * 当前限制：
 *   - DEBT 状态未实现（debt 在 debt_records 表，需独立查询），留 TODO。
 *   - streak 口径：hero 展示所有项目中最大的 current_streak。
 */

export type HomeState = "EMPTY" | "ACTIVE" | "DEBT" | "ALL_COMPLETED";

export type { RewardMode } from "@/lib/reward";
import type { RewardMode } from "@/lib/reward";
import type { Database } from "@/utils/supabase/types";

/** 生成类型的 RPC 返回元素（列/枚举漂移直接编译失败，不手写合同） */
type Db = Database["public"];
type ProjectSummaryRow =
  Db["Functions"]["get_visible_project_summaries"]["Returns"][number];

export type ProjectSummary = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  targetDescription: string | null;
  projectType: "personal" | "group";
  status: "pending" | "active" | "cancelled" | "archived";
  startsAt: string | null;
  currentStreak: number;
  maxStreak: number;
  /** 今日（项目时区）是否有 active 打卡 */
  completedToday: boolean;
  /** 今日 active 打卡 id（供撤销），无则 null */
  todayCheckinId: string | null;
  /** 项目奖励金额（every_time=每次 / every_n=每N次 / completed=完成时） */
  rewardCoins: number;
  /** 奖励模式（决定奖励文案口径） */
  rewardMode: RewardMode;
  /** every_n 模式的 N */
  rewardNValue: number | null;
  /** 今日打卡是否仍可撤销（今日且未过项目时区截止时间，服务端判定） */
  canRevoke: boolean;
  /** 今日截止时间（ISO 字符串，供客户端到点隐藏撤销入口） */
  deadlineAt: string;
};

export type MyProfile = {
  id: string;
  nickname: string | null;
  avatar: string | null;
  walletBalance: number;
  totalEarned: number;
  totalSpent: number;
  totalPenalty: number;
};

export type HomeData = {
  state: HomeState;
  profile: MyProfile | null;
  projects: ProjectSummary[];
  /** 今日已完成打卡数 */
  completedToday: number;
  /** 今日应打卡项目数 */
  totalToday: number;
  streak: number;
  debtAmount: number;
};

export async function getHomeData(): Promise<HomeData> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      state: "EMPTY",
      profile: null,
      projects: [],
      completedToday: 0,
      totalToday: 0,
      streak: 0,
      debtAmount: 0,
    };
  }

  // 行类型已在文件头从生成的 Database 类型提取

  // 并行拉取 profile + 项目列表 + 今日打卡状态
  // 注意：这三个是 RPC 函数，必须走 .rpc()（PostgREST 不把返回集合的
  // 函数当表暴露，.from() 会 404 PGRST205 且被 ?? [] 静默吞掉）。
  const [profileRes, projectsRes, todayRes] = await Promise.all([
    supabase.rpc("get_my_profile").single(),
    supabase.rpc("get_visible_project_summaries"),
    supabase.rpc("get_today_checkin_status"),
  ]);

  // 任一必需 RPC 失败即抛错：基础设施故障不允许伪装成业务状态
  // （空项目列表 / 余额 0 / 全部未完成）。
  if (profileRes.error) {
    throw new Error(`首页资料加载失败: ${profileRes.error.message}`);
  }
  if (projectsRes.error) {
    throw new Error(`项目列表加载失败: ${projectsRes.error.message}`);
  }
  if (todayRes.error) {
    throw new Error(`今日打卡状态加载失败: ${todayRes.error.message}`);
  }

  const profileRow = profileRes.data;
  const profile: MyProfile | null = profileRow
    ? {
        id: profileRow.id,
        nickname: profileRow.nickname,
        avatar: profileRow.avatar,
        walletBalance: profileRow.wallet_balance,
        totalEarned: profileRow.total_earned,
        totalSpent: profileRow.total_spent,
        totalPenalty: profileRow.total_penalty,
      }
    : null;

  // 今日打卡状态：project_id → 行（时区在 DB 内计算）
  const todayRows = (todayRes.data ?? []).filter(
    (row) => row.project_id,
  );

  // 摘要列表只作为补充字段来源；主集合以今日状态 RPC 的项目范围为准
  const summaryMap = new Map<string, ProjectSummaryRow>(
    (projectsRes.data ?? []).map((p) => [p.id, p]),
  );
  const now = Date.now();
  const projects: ProjectSummary[] = todayRows.map((today) => {
    const p = summaryMap.get(today.project_id);
    return {
      id: today.project_id,
      name: p?.name ?? "未知项目",
      icon: p?.icon ?? null,
      color: p?.color ?? null,
      targetDescription: p?.target_description ?? null,
      projectType: p?.project_type ?? "personal",
      status: p?.status ?? "active",
      startsAt: p?.starts_at ?? null,
      currentStreak: p?.current_streak ?? 0,
      maxStreak: p?.max_streak ?? 0,
      completedToday: today.checkin_id != null,
      todayCheckinId: today.checkin_id ?? null,
      rewardCoins: today.reward_amount ?? 0,
      rewardMode: today.reward_mode ?? "every_time",
      rewardNValue: today.reward_n_value ?? null,
      // 截止判定在服务端完成，避免客户端时钟偏差
      canRevoke:
        today.checkin_id != null && new Date(today.deadline_at).getTime() > now,
      deadlineAt: today.deadline_at,
    };
  });

  const totalToday = projects.length;
  const completedToday = projects.filter((p) => p.completedToday).length;

  // 状态判定（规范 §14）：
  //   EMPTY > DEBT > ALL_COMPLETED > ACTIVE
  // TODO: 查 debt_records 算 debtAmount → 若 > 0 则 state = "DEBT"
  let state: HomeState = "ACTIVE";
  if (totalToday === 0) {
    state = "EMPTY";
  } else if (completedToday === totalToday) {
    state = "ALL_COMPLETED";
  }

  return {
    state,
    profile,
    projects,
    completedToday,
    totalToday,
    streak: projects.reduce((max, p) => Math.max(max, p.currentStreak), 0),
    debtAmount: 0, // TODO: DEBT 状态待实现
  };
}
