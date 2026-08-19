import type { TransactionItem, TxType } from "@/lib/wallet-data";

/**
 * 交易记录列表（纯展示，按 DAL 预格式化的 dayLabel 分组）
 *
 * 类型/原因 → 图标与标签（adjustment 按 reason 细分）；
 * 日期与时间标签均由服务端按用户时区（profile.timezone）格式化，
 * 消费项按其 expense_date 展示
 */
function metaOf(tx: TransactionItem): { icon: string; label: string; bg: string } {
  if (tx.type === "adjustment") {
    switch (tx.reason) {
      case "expense_delta_negative":
        return { icon: "✏️", label: "消费更正 · 补差", bg: "#F1E9FF" };
      case "expense_delta_positive":
        return { icon: "✏️", label: "消费更正 · 退回", bg: "#F1E9FF" };
      case "expense_refund":
        return { icon: "↩️", label: "删除消费返还", bg: "#F1E9FF" };
      case "manual_compensation":
        return { icon: "🎁", label: "运营补偿", bg: "#F1E9FF" };
      default:
        return { icon: "✏️", label: "更正", bg: "#F1E9FF" };
    }
  }
  const base: Record<TxType, { icon: string; label: string; bg: string }> = {
    reward: { icon: "🪙", label: "打卡奖励", bg: "var(--color-primary-soft)" },
    penalty: { icon: "⚠️", label: "缺卡惩罚", bg: "#FFEBEA" },
    expense: { icon: "🛒", label: "消费", bg: "#E8F5FE" },
    adjustment: { icon: "✏️", label: "更正", bg: "#F1E9FF" },
    revoke: { icon: "↩️", label: "撤销回滚", bg: "#F1F2F4" },
  };
  return base[tx.type];
}

export function TransactionList({
  transactions,
}: {
  transactions: TransactionItem[];
}) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-3xl bg-white px-4 py-10 text-center shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
        <p className="text-sm text-[var(--color-text-secondary)]">
          还没有收支记录
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          打卡获得奖励后会显示在这里
        </p>
      </div>
    );
  }

  // 账本顺序（sequence_no 倒序）分组：按 dayLabel 相邻归并。
  // 回填消费按 expense_date 展示，同一天可能因中间隔着其他日期交易
  // 出现多个分组——key 用组内首条交易 id 保证唯一。
  const groups: { day: string; key: string; items: TransactionItem[] }[] = [];
  for (const tx of transactions) {
    const last = groups[groups.length - 1];
    if (last && last.day === tx.dayLabel) {
      last.items.push(tx);
    } else {
      groups.push({ day: tx.dayLabel, key: tx.id, items: [tx] });
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => (
        <section
          key={group.key}
          className="rounded-3xl bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.045)]"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-[var(--color-text-primary-2)]">
              {group.day}
            </h3>
            <span className="text-xs text-[var(--color-text-secondary)]">
              净额{" "}
              {(() => {
                const net = group.items.reduce((s, t) => s + t.amount, 0);
                return `${net >= 0 ? "+" : ""}${net} 🪙`;
              })()}
            </span>
          </div>
          <div className="mt-2 flex flex-col divide-y divide-[#F3F4F6]">
            {group.items.map((tx) => {
              const meta = metaOf(tx);
              return (
                <div key={tx.id} className="flex items-center gap-3 py-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                    style={{ background: meta.bg }}
                  >
                    {meta.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-[var(--color-text-primary-2)]">
                      {tx.description || meta.label}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {meta.label}
                      {tx.timeLabel ? ` · ${tx.timeLabel}` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-[16px] font-bold ${
                      tx.amount >= 0
                        ? "text-[var(--color-primary)]"
                        : "text-[var(--color-debt-red)]"
                    }`}
                  >
                    {tx.amount >= 0 ? "+" : ""}
                    {tx.amount} 🪙
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
