import "server-only";

import { createSupabaseServerClient } from "@/utils/supabase/server";
import type { Database } from "@/utils/supabase/types";
import type { RewardMode } from "@/lib/reward";

/** 生成类型的 RPC 返回元素（列漂移直接编译失败，不手写合同） */
type Db = Database["public"];
type ActivityRow = Db["Functions"]["get_my_checkin_activity"]["Returns"][number];

/**
 * 项目详情页数据访问层（DAL）
 *
 * - 项目基础信息：直查 checkin_projects（RLS 仅 owner/成员可见）
 * - 打卡历史：get_my_checkin_activity RPC（数据库仅返回**本人**记录；
 *   DAL 按 500 条/页循环读全量，规避 Data API 1000 行上限；
 *   多人项目日历/统计口径为"我的记录"，页面明确标注）
 * - 今日状态：复用 get_today_checkin_status（按 project_id 过滤）
 * - 义务起点：get_my_obligation_start RPC（PostgreSQL 按 00037 口径
 *   计算 owner 的 starts_at / 成员加入日是否顺延，前端不做墙钟换算）
 *
 * 口径：
 *   - "今天"、日历状态、统计、截止时间全部在服务端按项目时区计算
 *   - "缺卡"按自然日推算（不依赖 checkin_occurrences）
 *   - 生命周期：软删除项目返回 null（404）；归档项目统计终点截至
 *     archived_at 对应项目日期（不再新增应打/缺卡）；pending 项目
 *     （未开始）显示"项目未开始"
 *   - 打卡资格（eligibility）：active 项目 + 本人（owner 或 active 成员）
 *     + 未过截止。注：pending 成员被项目 RLS 挡在详情页外（读不到完整行），
 *     不存在"等待接受邀请"分支
 *   - 任一必需查询失败直接 throw，页面渲染统一失败态
 */

export type CalendarDayStatus =
  | "checked" // 绿：active 正常打卡
  | "makeup" // 黄：active 补卡
  | "missed" // 红：过去应打未打（>= starts_at）
  | "today" // 描边：今天且未打卡
  | "none"; // 灰：未来 / starts_at 之前 / 月外补位

export type CalendarDay = {
  date: string; // YYYY-MM-DD（项目时区日历日）
  inMonth: boolean;
  status: CalendarDayStatus;
};

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
  };
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

function dateInTimeZone(tz: string, at: Date = new Date()): string {
  // en-CA locale 恰好输出 YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

function toYmd(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** 周一为 0 ... 周日为 6 */
function weekdayMondayFirst(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** 返回 null = 项目不存在/不可见/已软删除；查询失败 throw */
export async function getProjectDetailData(
  projectId: string,
): Promise<ProjectDetailData | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // 行类型已在文件头从生成的 Database 类型提取（不手写合同）

  // 阶段 1：仅项目可见性（RLS）——不存在/无权限/软删除在此返回 null（404）。
  // 不与其他请求并行，确保任何无关 RPC 故障都不会覆盖 404 契约
  const projectRes = await supabase
    .from("checkin_projects")
    .select(
      "id,name,icon,color,reward_mode,reward_n_value,reward_amount,penalty_amount,deadline_time,timezone,project_type,status,starts_at,deleted_at,archived_at,owner_id",
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
    // 义务起点由 PostgreSQL 按 00037 口径计算（owner=starts_at；
    // 成员起点不早于 starts_at，加入晚于当日 deadline 则次日）
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
  };

  const memberRow = memberRes.data;
  const memberStatus = memberRow?.status ?? null;
  const isOwner = p.owner_id === user.id;
  const isActiveMember = memberStatus === "active";

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
    eligibility = "not_started"; // starts_at 在未来
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

  // ---- 日历与统计（项目时区；活动记录已由 RPC 限定为本人）----
  const [year, month] = tzToday.split("-").map(Number);
  const activeByDate = new Map<string, boolean>();
  let totalCount = 0;
  for (const row of activityRows) {
    if (row.status !== "active") continue;
    activeByDate.set(row.checkin_date, row.is_makeup);
    totalCount += 1;
  }

  const firstOfMonth = toYmd(year, month, 1);
  // 统计起点：本月与本人义务起点（PostgreSQL 按 00037 口径计算：
  // owner=starts_at；成员加入晚于当日 deadline 则从次日开始）取最晚
  const obligationStart =
    obligationRes.data ?? null;
  const statStart =
    obligationStart && obligationStart > firstOfMonth
      ? obligationStart
      : firstOfMonth;
  const lastOfMonth = toYmd(year, month, daysInMonth(year, month));
  // 统计终点：今天/月末/归档日（项目时区）三者最早
  let statEnd = tzToday < lastOfMonth ? tzToday : lastOfMonth;
  if (p.archived_at != null) {
    const archivedDate = dateInTimeZone(p.timezone, new Date(p.archived_at));
    if (archivedDate < statEnd) statEnd = archivedDate;
  }

  // 本人 streak（从本人 active 日期计算；项目级缓存字段是全体共享的，
  // 多人项目不能代表当前成员）
  let myCurrentStreak = 0;
  {
    let day = tzToday;
    if (!activeByDate.has(day)) day = prevDay(day);
    while (activeByDate.has(day)) {
      myCurrentStreak += 1;
      day = prevDay(day);
    }
  }
  const myMaxStreak = longestRunOf([...activeByDate.keys()]);

  let monthChecked = 0;
  let monthDue = 0;

  // 周一起始固定 42 格（6 行）
  const leading = weekdayMondayFirst(firstOfMonth);
  const calendar: CalendarDay[] = [];

  for (let i = 0; i < 42; i++) {
    const dayOfMonth = i - leading + 1;
    if (dayOfMonth < 1 || dayOfMonth > daysInMonth(year, month)) {
      calendar.push({ date: "", inMonth: false, status: "none" });
      continue;
    }
    const ymd = toYmd(year, month, dayOfMonth);
    let status: CalendarDayStatus;
    if (activeByDate.has(ymd)) {
      status = activeByDate.get(ymd) ? "makeup" : "checked";
      if (ymd >= statStart) monthChecked += 1;
    } else if (ymd < statStart) {
      // 未开始（starts_at / 加入日之前，含 pending 项目的今天）：不产生任何标记
      status = "none";
    } else if (ymd > statEnd || ymd > tzToday) {
      // 归档后或未来：不产生缺卡/待打卡
      status = "none";
    } else if (ymd === tzToday) {
      status = "today";
    } else {
      status = "missed";
    }
    if (ymd >= statStart && ymd <= statEnd) monthDue += 1;
    calendar.push({ date: ymd, inMonth: true, status });
  }

  const completionRate =
    monthDue > 0 ? Math.round((monthChecked / monthDue) * 100) : 0;

  return {
    project,
    eligibility,
    todayCheckinId,
    canRevoke,
    deadlineAt,
    calendar,
    calendarMonthLabel: `${year}年${month}月`,
    calendarToday: tzToday,
    isMyStatsOnly: p.project_type === "group",
    stats: {
      monthChecked,
      monthDue,
      completionRate,
      totalCount,
      currentStreak: myCurrentStreak,
      maxStreak: myMaxStreak,
    },
  };
}

function prevDay(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const ts = Date.UTC(y, m - 1, d) - 86400000;
  const dt = new Date(ts);
  return toYmd(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

/** gaps-and-islands：日期集合的最长连续段长度 */
function longestRunOf(dates: string[]): number {
  const sorted = [...new Set(dates)].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    run = prev != null && prevDay(d) === prev ? run + 1 : 1;
    if (run > best) best = run;
    prev = d;
  }
  return best;
}
