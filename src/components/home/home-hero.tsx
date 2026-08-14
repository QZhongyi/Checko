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

  const ringGradient =
    variant === "active"
      ? "conic-gradient(var(--color-primary) 0deg, var(--color-coin-yellow) 360deg)"
      : variant === "debt"
        ? "conic-gradient(var(--color-primary), var(--color-debt-red), var(--color-coin-yellow))"
        : "conic-gradient(#A4E400, var(--color-primary), var(--color-purple), #FFCF28, #A4E400)";

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
            label={
              variant === "debt"
                ? "火焰\n疲惫"
                : variant === "completed"
                  ? "火焰\n开心"
                  : "火焰\n活跃"
            }
            className="h-[100px] w-[100px]"
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
    <div
      className="relative flex h-[180px] w-[180px] items-center justify-center"
      style={{
        background: gradient,
        borderRadius: "50%",
        // 通过 mask 实现环
        WebkitMask: "radial-gradient(circle, transparent 76px, black 78px)",
        mask: "radial-gradient(circle, transparent 76px, black 78px)",
        // 用 conic-gradient 的 percent（线性渐变）来表示完成进度
        backgroundImage: `conic-gradient(from -90deg, ${
          variant === "active" ? "var(--color-primary)" : "var(--color-primary)"
        } 0% ${percent}%, #EDF0F2 ${percent}% 100%)`,
      }}
    >
      <div className="flex flex-col items-center justify-center text-center">
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
