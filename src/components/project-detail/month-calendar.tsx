import type { CalendarDay, CalendarDayStatus } from "@/lib/project-detail-data";

/**
 * 本月打卡日历（纯展示，状态判定在 DAL 完成）
 *
 * - 周一起始，固定 6×7=42 格
 * - 状态配色：checked 绿 / makeup 黄 / missed 红 / today 绿描边 / none 灰
 * - 状态同时以文本输出（aria-label / title），不依赖颜色区分
 */
const STATUS_STYLES: Record<CalendarDayStatus, string> = {
  checked: "bg-[var(--color-primary)] text-white",
  makeup: "bg-[var(--color-coin-yellow)] text-white",
  missed: "bg-[var(--color-debt-red)] text-white",
  today: "border-2 border-[var(--color-primary)] bg-white text-[var(--color-primary)] font-bold",
  none: "bg-[#F1F2F4] text-[var(--color-text-secondary)]",
};

const STATUS_LABELS: Record<CalendarDayStatus, string> = {
  checked: "已打卡",
  makeup: "补卡",
  missed: "缺卡",
  today: "今天待打卡",
  none: "未开始",
};

const LEGEND: { status: CalendarDayStatus; label: string }[] = [
  { status: "checked", label: "已打卡" },
  { status: "makeup", label: "补卡" },
  { status: "missed", label: "缺卡" },
  { status: "today", label: "今天" },
];

const WEEK_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

function formatCnDate(ymd: string): string {
  const [, m, d] = ymd.split("-").map(Number);
  return `${m}月${d}日`;
}

export function MonthCalendar({
  monthLabel,
  days,
  today,
}: {
  monthLabel: string;
  days: CalendarDay[];
  /** 项目时区的今天（YYYY-MM-DD），无论当日状态如何都标记 aria-current */
  today: string;
}) {
  return (
    <section className="mt-4 rounded-3xl bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--color-text-primary-2)]">
          打卡日历
        </h2>
        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
          {monthLabel}
        </span>
      </div>

      {/* 周头（周一起始） */}
      <div className="mt-3 grid grid-cols-7 text-center">
        {WEEK_LABELS.map((label) => (
          <span
            key={label}
            className="text-xs font-medium text-[var(--color-text-secondary)]"
          >
            {label}
          </span>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="mt-2 grid grid-cols-7 gap-y-2">
        {days.map((day, i) => (
          <div key={i} className="flex justify-center">
            {day.inMonth ? (
              <span
                role="img"
                aria-label={`${formatCnDate(day.date)} ${STATUS_LABELS[day.status]}`}
                aria-current={day.date === today ? "date" : undefined}
                title={`${formatCnDate(day.date)} ${STATUS_LABELS[day.status]}`}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm ${STATUS_STYLES[day.status]}`}
              >
                {Number(day.date.slice(8))}
              </span>
            ) : (
              <span className="h-9 w-9" aria-hidden />
            )}
          </div>
        ))}
      </div>

      {/* 图例 */}
      <div className="mt-4 flex items-center justify-center gap-4">
        {LEGEND.map(({ status, label }) => (
          <span
            key={status}
            className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]"
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                status === "today"
                  ? "border-2 border-[var(--color-primary)]"
                  : STATUS_STYLES[status].split(" ")[0]
              }`}
            />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
