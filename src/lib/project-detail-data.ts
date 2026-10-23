import "server-only";

import { createSupabaseServerClient } from "@/utils/supabase/server";
import type { Database } from "@/utils/supabase/types";
import type { RewardMode } from "@/lib/reward";
import {
  buildMonthCalendar,
  computeMyStreaks,
  dateInTimeZone,
  isTodayFailed,
  type CalendarDay,
  type OccurrenceFinalStatus,
} from "@/lib/project-detail-calendar";

/** 生成类型的 RPC 返回元素（列漂移直接编译失败，不手写合同） */
type Db = Database["public"];
type ActivityRow = Db["Functions"]["get_my_checkin_activity"]["Returns"][number];
type OverviewRow = Db["Functions"]["get_project_member_overview"]["Returns"][number];

/** 成员总览（多人项目；members 为 RPC jsonb 列的窄化） */
export type MemberOverview = {
  today: string;
  checkinMode: "any_one" | "all" | null;
  maxMembers: number;
  todayDone: number;
  todayTotal: number;
  teamStreak: number;
  isOwner: boolean;
  myStatus: "pending" | "active" | "quit" | "removed" | "expired" | null;
  members: MemberOverviewMember[];
  /** 每次结算池额度（00071） */
  poolPerSettlement: number;
  /** 我从团队结算累计分得（00071） */
  mySettlementEarned: number;
  /** 已结算次数（00071） */
  settlementCount: number;
  /** 奖励池总预算（批次 3；null = 未设） */
  lifetimeBudget: number | null;
  /** 已累计发放总额（批次 3，sum(total_pool)） */
  totalGranted: number;
};

export type MemberOverviewMember = {
  userId: string;
  nickname: string | null;
  avatar: string | null;
  role: "owner" | "admin" | "member";
  status: "pending" | "active";
  todayChecked: boolean;
  todayCheckedAt: string | null;
};

function parseMemberOverview(row: OverviewRow): MemberOverview {
  const raw = row.v_members as unknown;
  const members = (Array.isArray(raw) ? raw : []) as MemberOverviewMember[];
  return {
    today: row.v_today,
    checkinMode: row.v_checkin_mode,
    maxMembers: row.v_max_members,
    todayDone: row.v_today_done,
    todayTotal: row.v_today_total,
    teamStreak: row.v_team_streak,
    isOwner: row.v_is_owner,
    myStatus: row.v_my_status,
    members,
    poolPerSettlement: row.v_pool_per_settlement,
    mySettlementEarned: row.v_my_settlement_earned,
    settlementCount: row.v_settlement_count,
    lifetimeBudget: row.v_lifetime_budget ?? null,
    totalGranted: row.v_total_granted ?? 0,
  };
}

/**
 * 项目详情页数据访问层（DAL）
 *
 * - 项目基础信息：直查 checkin_projects（RLS 仅 owner/成员可见）
 * - 打卡历史：get_my_checkin_activity RPC（数据库仅返回本人记录；
 *   DAL 按 500 条/页循环读全量，规避 Data API 1000 行上限）
 * - 今日状态：get_today_checkin_status（按 project_id 过滤）
 * - 义务起点：get_my_obligation_start RPC（owner 的 starts_at /
 *   成员加入日是否顺延由 PostgreSQL 计算）
 * - 日历/统计的纯计算在 @/lib/project-detail-calendar
 *
 * 口径：
 *   - 软删除项目返回 null（404）；任一必需查询失败直接 throw，
 *     页面渲染统一失败态
 *   - 多人项目日历/统计口径为"我的记录"（isMyStatsOnly，页面标注）
 *   - 统计起点 = max(本月 1 日, 义务起点)；终点 = min(今天, 月末, 归档日)
 */

/** 今日打卡入口状态（详情页按钮按此渲染） */
export type CheckinEligibility =
  | "eligible" // 可打卡
  | "done" // 今日已打卡（可撤销时显示撤销）
  | "after_deadline" // 今日已截止
  | "not_started" // 项目未开始（pending，starts_at 在未来）
  | "ended"; // 项目已结束（cancelled/archived）

export type ProjectDetailData = {
  project: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
    rewardMode: RewardMode;
    rewardNValue: number | null;
    rewardAmount: number;
    penaltyAmount: number;
    deadlineTime: string;
    timezone: string;
    projectType: "personal" | "group";
    status: "pending" | "active" | "cancelled" | "archived";
    startsAt: string | null;
    /** 有限次目标（null=无限次） */
    targetCount: number | null;
  };
  /** 有限次进度（个人=实时含当日已打卡未截止；团队=完成日数缓存列 00087） */
  finiteProgress: { current: number; target: number } | null;
  /** 当前用户是否 owner（个人项目取消入口等） */
  isOwner: boolean;
  /** 补卡余量（independent=本人额度；shared=团队共享池） */
  makeupQuota:
    | { kind: "independent"; used: number; limit: number }
    | { kind: "shared"; remaining: number; limit: number };
  eligibility: CheckinEligibility;
  todayCheckinId: string | null;
  canRevoke: boolean;
  deadlineAt: string;
  calendar: CalendarDay[];
  calendarMonthLabel: string;
  /** 项目时区的今天（YYYY-MM-DD，供 aria-current） */
  calendarToday: string;
  /** 多人项目时统计口径为"我的记录"（页面需标注） */
  isMyStatsOnly: boolean;
  /** 多人项目成员总览（00067 RPC）；个人项目为 null */
  memberOverview: MemberOverview | null;
  stats: {
    monthChecked: number;
    monthDue: number;
    completionRate: number; // 0-100 整数
    totalCount: number;
    /** 本人最长连续（从本人 active 日期计算，不读项目级缓存字段） */
    currentStreak: number;
    maxStreak: number;
  };
};

/** 返回 null = 项目不存在/不可见/已软删除；查询失败 throw */
export async function getProjectDetailData(
  projectId: string,
): Promise<ProjectDetailData | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // 阶段 1：仅项目可见性（RLS）——不存在/无权限/软删除在此返回 null（404）。
  // 不与其他请求并行，确保任何无关 RPC 故障都不会覆盖 404 契约
  const projectRes = await supabase
    .from("checkin_projects")
    .select(
      "id,name,icon,color,reward_mode,reward_n_value,reward_amount,penalty_amount,deadline_time,timezone,project_type,status,starts_at,deleted_at,archived_at,owner_id,target_count,current_progress,makeup_count,makeup_type,shared_makeup_remaining",
    )
    .eq("id", projectId)
    .maybeSingle();

  if (projectRes.error) {
    throw new Error(`项目信息加载失败: ${projectRes.error.message}`);
  }

  const p = projectRes.data;
  if (!p || p.deleted_at != null) return null; // 不存在/无权限/已软删除

  // 阶段 2：项目已确认可见，再并行取今日状态/成员状态/义务起点
  const [todayRes, memberRes, obligationRes] = await Promise.all([
    supabase.rpc("get_today_checkin_status"),
    supabase
      .from("project_members")
      .select("status")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.rpc("get_my_obligation_start", {
      p_project_id: projectId,
    }),
  ]);

  if (todayRes.error) {
    throw new Error(`今日状态加载失败: ${todayRes.error.message}`);
  }
  if (memberRes.error) {
    throw new Error(`成员信息加载失败: ${memberRes.error.message}`);
  }
  if (obligationRes.error) {
    throw new Error(`义务起点加载失败: ${obligationRes.error.message}`);
  }

  // 本人活动记录：分页读全量（500 条/页，规避 Data API 1000 行上限）
  const activityRows: ActivityRow[] = [];
  const PAGE_SIZE = 500;
  for (let from = 0; ; from += PAGE_SIZE) {
    const pageRes = await supabase
      .rpc("get_my_checkin_activity", {
        p_project_id: projectId,
      })
      .range(from, from + PAGE_SIZE - 1);
    if (pageRes.error) {
      throw new Error(`打卡历史加载失败: ${pageRes.error.message}`);
    }
    const page = pageRes.data ?? [];
    activityRows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }

  // 本人 occurrence 终态（RLS user_id = auth.uid()）：Cron 处理后的
  // missed / penalty_capped / exempted / waived 优先于自然日推算；
  // revoked（撤销未重打）用于"截止后仍 revoked → 今日连续清零"判定
  const occurrenceByDate = new Map<string, OccurrenceFinalStatus>();
  for (let from = 0; ; from += PAGE_SIZE) {
    const pageRes = await supabase
      .from("checkin_occurrences")
      .select("status, period_start")
      .eq("project_id", projectId)
      .in("status", ["missed", "penalty_capped", "exempted", "revoked", "waived"])
      .order("period_start", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (pageRes.error) {
      throw new Error(`打卡状态加载失败: ${pageRes.error.message}`);
    }
    const page = pageRes.data ?? [];
    for (const row of page) {
      occurrenceByDate.set(
        dateInTimeZone(p.timezone, new Date(row.period_start)),
        row.status as OccurrenceFinalStatus,
      );
    }
    if (page.length < PAGE_SIZE) break;
  }

  const project: ProjectDetailData["project"] = {
    id: p.id,
    name: p.name,
    icon: p.icon,
    color: p.color,
    rewardMode: p.reward_mode,
    rewardNValue: p.reward_n_value,
    rewardAmount: p.reward_amount,
    penaltyAmount: p.penalty_amount,
    deadlineTime: String(p.deadline_time).slice(0, 5),
    timezone: p.timezone,
    projectType: p.project_type,
    status: p.status,
    startsAt: p.starts_at,
    targetCount: p.target_count,
  };

  const memberRow = memberRes.data;
  const memberStatus = memberRow?.status ?? null;
  const isOwner = p.owner_id === user.id;
  const isActiveMember = memberStatus === "active";

  // 补卡余量：independent = 本人已用（makeup_usages 权威计数，RLS 仅本人
  // 行可见 00035）；shared = 团队共享池缓存列（00025 触发器维护）
  let makeupUsed = 0;
  if (p.makeup_type !== "shared") {
    const usedRes = await supabase
      .from("makeup_usages")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId)
      .eq("user_id", user.id);
    if (usedRes.error) {
      throw new Error(`补卡记录加载失败: ${usedRes.error.message}`);
    }
    makeupUsed = usedRes.count ?? 0;
  }

  // 多人项目成员总览（个人项目跳过）
  let memberOverview: MemberOverview | null = null;
  if (p.project_type === "group") {
    const overviewRes = await supabase.rpc("get_project_member_overview", {
      p_project_id: projectId,
    });
    if (overviewRes.error) {
      throw new Error(`成员总览加载失败: ${overviewRes.error.message}`);
    }
    const row = (overviewRes.data ?? [])[0];
    if (row) {
      memberOverview = parseMemberOverview(row);
    }
  }

  // ---- 今日状态与打卡资格（项目时区）----
  const todayRow = (todayRes.data ?? []).find(
    (r) => r.project_id === projectId,
  );
  const tzToday = dateInTimeZone(p.timezone);
  // 今日截止时间（today RPC 行缺失时按项目配置重算）
  const deadlineAt =
    todayRow?.deadline_at ??
    new Date(
      `${tzToday}T${String(p.deadline_time).slice(0, 8)}Z`,
    ).toISOString(); // 仅非 active 项目用作兜底显示，不再参与判定
  const nowMs = Date.now();
  const afterDeadline = nowMs >= new Date(deadlineAt).getTime();

  let eligibility: CheckinEligibility;
  let todayCheckinId: string | null = null;
  let canRevoke = false;
  if (p.status === "pending") {
    eligibility = "not_started";
  } else if (p.status !== "active") {
    eligibility = "ended";
  } else if (!isOwner && !isActiveMember) {
    // 项目 RLS 只允许 owner/active 成员读到完整行，此分支正常不可达
    eligibility = "ended";
  } else if (todayRow?.checkin_id != null) {
    eligibility = "done";
    todayCheckinId = todayRow.checkin_id;
    canRevoke = !afterDeadline;
  } else if (afterDeadline) {
    eligibility = "after_deadline";
  } else {
    eligibility = "eligible";
  }

  // ---- 日历与统计（纯计算在 project-detail-calendar）----
  const [year, month] = tzToday.split("-").map(Number);
  const activeByDate = new Map<string, boolean>();
  let totalCount = 0;
  for (const row of activityRows) {
    if (row.status !== "active") continue;
    activeByDate.set(row.checkin_date, row.is_makeup);
    totalCount += 1;
  }

  // 有效完成日 = 本人 active 打卡 ∪ occurrence 终态 exempted
  // （waived 不进有效日——与 DB 00082 streak"未定跳过"口径一致，
  //  仅在月历作蓝格展示并计入完成率，见 project-detail-calendar）
  const validDays = new Set<string>(activeByDate.keys());
  for (const [ymd, status] of occurrenceByDate) {
    if (status === "exempted") validDays.add(ymd);
  }

  // 统计起点：本月 1 日与义务起点取最晚；终点：今天/月末/归档日最早
  const firstOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
  const obligationStart = obligationRes.data ?? null;
  const statStart =
    obligationStart && obligationStart > firstOfMonth
      ? obligationStart
      : firstOfMonth;
  const lastOfMonth = `${year}-${String(month).padStart(2, "0")}-${String(
    new Date(Date.UTC(year, month, 0)).getUTCDate(),
  ).padStart(2, "0")}`;
  let statEnd = tzToday < lastOfMonth ? tzToday : lastOfMonth;
  if (p.archived_at != null) {
    const archivedDate = dateInTimeZone(p.timezone, new Date(p.archived_at));
    if (archivedDate < statEnd) statEnd = archivedDate;
  }

  const todayFailed = isTodayFailed(occurrenceByDate, tzToday, afterDeadline);
  const { calendar, monthChecked, monthDue } = buildMonthCalendar({
    year,
    month,
    today: tzToday,
    activeByDate,
    occurrenceByDate,
    statStart,
    statEnd,
    todayFailed,
  });
  const { currentStreak, maxStreak } = computeMyStreaks(validDays, tzToday, todayFailed);
  const completionRate =
    monthDue > 0 ? Math.round((monthChecked / monthDue) * 100) : 0;

  return {
    project,
    finiteProgress:
      p.target_count != null
        ? p.project_type === "personal"
          ? { current: Math.min(activeByDate.size, p.target_count), target: p.target_count }
          : { current: p.current_progress ?? 0, target: p.target_count }
        : null,
    isOwner,
    makeupQuota:
      p.makeup_type === "shared"
        ? {
            kind: "shared",
            remaining: p.shared_makeup_remaining ?? p.makeup_count,
            limit: p.makeup_count,
          }
        : { kind: "independent", used: makeupUsed, limit: p.makeup_count },
    eligibility,
    todayCheckinId,
    canRevoke,
    deadlineAt,
    calendar,
    calendarMonthLabel: `${year}年${month}月`,
    calendarToday: tzToday,
    isMyStatsOnly: p.project_type === "group",
    memberOverview,
    stats: {
      monthChecked,
      monthDue,
      completionRate,
      totalCount,
      currentStreak,
      maxStreak,
    },
  };
}
