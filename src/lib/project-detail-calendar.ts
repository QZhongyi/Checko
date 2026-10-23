/**
 * 项目详情日历/统计的纯计算（项目时区日历日，无数据访问）。
 * 输入口径：
 * - 有效完成日 = 本人 active 打卡（checked/makeup）∪ occurrence 终态 exempted
 * - "缺卡"优先读本人 checkin_occurrences 的 Cron 终态，无数据时按自然日推算
 */

export type CalendarDayStatus =
  | "checked" // 绿：active 正常打卡
  | "makeup" // 黄：active 补卡
  | "missed" // 红：occurrence 终态 missed / penalty_capped，或（无 occurrence 时）按自然日推算
  | "exempted" // 蓝：occurrence 终态 exempted（任意一人模式免责，视为有效完成日）
  | "today" // 描边：今天且未打卡
  | "none"; // 灰：未来 / starts_at 之前 / 月外补位

export type CalendarDay = {
  date: string; // YYYY-MM-DD（项目时区日历日）
  inMonth: boolean;
  status: CalendarDayStatus;
};

export type OccurrenceFinalStatus =
  | "missed"
  | "penalty_capped"
  | "exempted"
  | "revoked"
  | "waived";

export function dateInTimeZone(tz: string, at: Date = new Date()): string {
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

/** 今天是否已形成失败终态（missed / penalty_capped / 截止后仍 revoked） */
export function isTodayFailed(
  occurrenceByDate: Map<string, OccurrenceFinalStatus>,
  today: string,
  afterDeadline: boolean,
): boolean {
  const occ = occurrenceByDate.get(today);
  return (
    occ === "missed" ||
    occ === "penalty_capped" ||
    (occ === "revoked" && afterDeadline)
  );
}

/**
 * 周一起始固定 42 格（6 行）的当月日历 + 本月应打/完成计数。
 * - statStart 之前的日期不产生任何标记（未开始）
 * - statEnd（今天/月末/归档日最早）之后的日期不产生缺卡
 * - 今天已形成失败终态时显示缺卡（与 streak 清零口径一致）
 */
export function buildMonthCalendar(input: {
  year: number;
  month: number;
  today: string;
  activeByDate: Map<string, boolean>;
  occurrenceByDate: Map<string, OccurrenceFinalStatus>;
  statStart: string;
  statEnd: string;
  todayFailed: boolean;
}): { calendar: CalendarDay[]; monthChecked: number; monthDue: number } {
  const { year, month, today, activeByDate, occurrenceByDate, statStart, statEnd, todayFailed } = input;
  const firstOfMonth = toYmd(year, month, 1);
  const leading = weekdayMondayFirst(firstOfMonth);
  const calendar: CalendarDay[] = [];
  let monthChecked = 0;
  let monthDue = 0;

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
      status = "none";
    } else if (ymd > statEnd || ymd > today) {
      status = "none";
    } else if (occurrenceByDate.get(ymd) === "exempted"
               || occurrenceByDate.get(ymd) === "waived") {
      // waived（有限次达标免除）仅作展示：蓝格 + 计入完成率，
      // 不进 streak 有效日（与 DB 00082 重算"未定跳过"口径一致）
      status = "exempted";
      monthChecked += 1;
    } else if (ymd === today && todayFailed) {
      status = "missed";
    } else if (ymd === today) {
      status = "today";
    } else {
      status = "missed";
    }
    if (ymd >= statStart && ymd <= statEnd) monthDue += 1;
    calendar.push({ date: ymd, inMonth: true, status });
  }

  return { calendar, monthChecked, monthDue };
}

/**
 * 本人 streak（从本人有效完成日起算，不读项目级缓存字段——
 * 多人项目的缓存是全体共享的，不能代表当前成员）。
 * 今日已形成失败终态时当前连续清零；截止前"今天尚未打卡"保留昨日起算。
 */
export function computeMyStreaks(
  validDays: Set<string>,
  today: string,
  todayFailed: boolean,
): { currentStreak: number; maxStreak: number } {
  let current = 0;
  if (!todayFailed) {
    let day = today;
    if (!validDays.has(day)) day = prevDay(day);
    while (validDays.has(day)) {
      current += 1;
      day = prevDay(day);
    }
  }
  return { currentStreak: current, maxStreak: longestRunOf([...validDays]) };
}
