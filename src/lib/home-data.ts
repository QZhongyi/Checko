import "server-only";

import { createSupabaseServerClient } from "@/utils/supabase/server";

/**
 * 首页数据访问层（DAL）
 *
 * 调用 Supabase RPC 获取当前用户的项目列表 + 个人资料，
 * 计算 HomeState（EMPTY / ACTIVE / DEBT / ALL_COMPLETED）。
 *
 * 当前限制：
 *   - get_visible_project_summaries 不返回"今日是否完成"，
 *     需逐项目调 get_visible_checkin_activity 算（N+1）。
 *   - profile 不直接返回 debt，debt 在 debt_records 表，需独立查询。
 *   - 当前阶段先只做 EMPTY 判定（项目数 == 0）；非 EMPTY 状态留 TODO。
 */

export type HomeState = "EMPTY" | "ACTIVE" | "DEBT" | "ALL_COMPLETED";

export type ProjectSummary = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  targetDescription: string | null;
  projectType: "personal" | "group";
  status: "pending" | "active" | "cancelled" | "expired";
  startsAt: string | null;
  currentStreak: number;
  maxStreak: number;
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
  // 以下字段在非 EMPTY 状态才需要，目前留空
  completedToday: number;
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

  // RPC 返回类型当前由 Database=unknown 退化为 untyped，
  // 用显式 row 类型在边界处转换。
  type ProfileRow = {
    id: string;
    nickname: string | null;
    avatar: string | null;
    wallet_balance: number;
    total_earned: number;
    total_spent: number;
    total_penalty: number;
    total_revoked: number;
    timezone: string | null;
    profile_visibility: string;
    created_at: string;
    updated_at: string;
  };
  type ProjectSummaryRow = {
    id: string;
    owner_id: string;
    name: string;
    icon: string | null;
    color: string | null;
    target_description: string | null;
    project_type: "personal" | "group";
    status: "pending" | "active" | "cancelled" | "expired";
    starts_at: string | null;
    current_streak: number;
    max_streak: number;
    visibility: string;
  };

  // 并行拉取 profile + 项目列表
  // 注意：这两个是 RPC 函数，必须走 .rpc()（PostgREST 不把返回集合的
  // 函数当表暴露，.from() 会 404 PGRST205 且被 ?? [] 静默吞掉）。
  const [profileRes, projectsRes] = await Promise.all([
    supabase.rpc("get_my_profile").single(),
    supabase.rpc("get_visible_project_summaries"),
  ]);

  // RPC 失败时记录错误，避免 DB 故障被静默折算成"空状态"
  if (profileRes.error) {
    console.error("get_my_profile 失败:", profileRes.error.message);
  }
  if (projectsRes.error) {
    console.error("get_visible_project_summaries 失败:", projectsRes.error.message);
  }

  const profileRow = profileRes.data as ProfileRow | null;
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

  const rawProjects = (projectsRes.data ?? []) as ProjectSummaryRow[];
  const projects: ProjectSummary[] = rawProjects.map((p) => ({
    id: p.id,
    name: p.name,
    icon: p.icon,
    color: p.color,
    targetDescription: p.target_description,
    projectType: p.project_type,
    status: p.status,
    startsAt: p.starts_at,
    currentStreak: p.current_streak,
    maxStreak: p.max_streak,
  }));

  // 状态判定（规范 §14）：
  //   EMPTY > DEBT > ALL_COMPLETED > ACTIVE
  //   当前阶段只精确实现 EMPTY；DEBT/ALL_COMPLETED/ACTIVE 留 TODO。
  let state: HomeState = "ACTIVE";
  if (projects.length === 0) {
    state = "EMPTY";
  }
  // TODO: 查 debt_records 算 debtAmount → 若 > 0 则 state = "DEBT"
  // TODO: 逐项目算今日完成 → 若 completedToday === totalToday 则 state = "ALL_COMPLETED"

  return {
    state,
    profile,
    projects,
    completedToday: 0, // TODO
    totalToday: projects.length, // 暂用项目数近似（不准确，后续改）
    streak: 0, // TODO: streak 概念待与数据库口径对齐
    debtAmount: 0, // TODO
  };
}
