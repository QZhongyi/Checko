import { IllustrationPlaceholder } from "./illustration";

/**
 * 首页 Hero 区域（home-ui-spec.md §10 / §11 / §12）
 *
 * 三种 variant：
 *   - active：绿色进度环 + 正常火焰 + "今日 N/M 习惯已打卡"
 *   - debt：三段色环 + 灰色疲惫火焰 + 警示
 *   - completed：彩色环 + 庆祝文案 + 开心火焰 + sparkle
 *
 * EMPTY 状态不渲染 Hero（§13）。
 */
export function HomeHero({
  variant,
  completed,
  total,
  streak,
}: {
  variant: "active" | "debt" | "completed";
  completed: number;
  total: number;
  streak: number;
}) {
  const ratio = total > 0 ? completed / total : 0;
  const percent = Math.round(ratio * 100);

  // 进度弧配色（三态差异化，直接驱动环形渐变）
  const ringGradient =
    variant === "active"
      ? "var(--color-primary), var(--color-primary-bright)"
      : variant === "debt"
        ? "var(--color-primary), var(--color-debt-red), var(--color-coin-yellow)"
        : "#A4E400, var(--color-primary), var(--color-purple), #FFCF28";

  return (
    <section className="flex flex-col items-center gap-3 px-5 pt-4">
      {/* 环 + 火焰并排 */}
      <div className="flex w-full items-center justify-center gap-3">
        {/* 进度环 */}
        <ProgressRing
          percent={percent}
          gradient={ringGradient}
          variant={variant}
          completed={completed}
          total={total}
        />

        {/* 火焰角色（占位）+ streak */}
        <div className="flex flex-col items-center gap-1">
          <IllustrationPlaceholder
            label="火焰角色"
            emoji={variant === "debt" ? "💨" : variant === "completed" ? "🎉" : "🔥"}
            tone={variant === "debt" ? "neutral" : "warm"}
            className="h-[100px] w-[100px] text-[52px]"
          />
          <FlameStreak variant={variant} streak={streak} />
        </div>
      </div>

      {/* 庆祝文案（仅 completed） */}
      {variant === "completed" && (
        <p className="text-center text-[22px] font-bold leading-8 text-[var(--color-text-primary-2)]">
          完美！今日全部完成
        </p>
      )}

      {/* Debt 警示条 */}
      {variant === "debt" && (
        <div className="flex h-10 w-full items-center justify-center rounded-xl bg-[#FFF2F2] text-sm font-medium text-[var(--color-debt-red)]">
          ⚠ 小荷包处于负债态，打卡回血吧
        </div>
      )}
    </section>
  );
}

function ProgressRing({
  percent,
  gradient,
  variant,
  completed,
  total,
}: {
  percent: number;
  gradient: string;
  variant: "active" | "debt" | "completed";
  completed: number;
  total: number;
}) {
  const mainColor =
    variant === "debt" ? "var(--color-debt-red)" : "var(--color-primary)";

  return (
    <div className="relative flex h-[180px] w-[180px] items-center justify-center">
      {/* 灰色底环（独立元素，mask 只作用于自身，不影响中心文案） */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background: "#EDF0F2",
          WebkitMask: "radial-gradient(circle, transparent 74px, black 78px)",
          mask: "radial-gradient(circle, transparent 74px, black 78px)",
        }}
      />
      {/* 进度环：变体配色 conic 渐变，percent 之后透明（露出底环） */}
      {percent > 0 && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from -90deg, ${gradient} 0% ${percent}%, transparent ${percent}% 100%)`,
            WebkitMask: "radial-gradient(circle, transparent 74px, black 78px)",
            mask: "radial-gradient(circle, transparent 74px, black 78px)",
          }}
        />
      )}

      {/* 中心文案：不带 mask 的兄弟层，不会被环遮罩裁掉 */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <span
          className="text-base font-semibold"
          style={{ color: mainColor }}
        >
          今日
        </span>
        <div className="flex items-baseline">
          <span
            className="text-[52px] font-bold leading-none"
            style={{ color: mainColor }}
          >
            {completed}
          </span>
          <span className="text-[42px] font-bold leading-none text-[var(--color-text-primary-2)]">
            /{total}
          </span>
        </div>
        <span className="text-base font-medium text-[var(--color-text-secondary)]">
          习惯已打卡
        </span>
      </div>
    </div>
  );
}

function FlameStreak({
  variant,
  streak,
}: {
  variant: "active" | "debt" | "completed";
  streak: number;
}) {
  const color =
    variant === "debt"
      ? "var(--color-debt-red)"
      : "var(--color-orange)";
  return (
    <div className="flex items-baseline gap-1">
      <span
        className="text-[30px] font-bold leading-none"
        style={{ color }}
      >
        🔥 {streak}
      </span>
      <span className="text-sm font-medium text-[var(--color-text-secondary-2)]">
        天连续
      </span>
    </div>
  );
}
