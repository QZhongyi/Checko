import "server-only";

import { createSupabaseServerClient } from "@/utils/supabase/server";

/**
 * 小荷包数据访问层（DAL）
 *
 * - 余额与累计统计：get_my_profile RPC
 * - 交易列表：直查 transactions（RLS 仅本人），按 sequence_no 倒序
 *   （账本权威顺序）；expense 关联只查这 100 条对应记录
 * - 本月双栏合计：get_my_month_summary RPC（PostgreSQL 内聚合，规避
 *   Data API 隐式 1000 行上限；分桶镜像 00014 触发器口径）
 *
 * 口径：
 *   - 时区：使用 profile.timezone（需求：个人业务按用户时区计算），
 *     缺省 Asia/Shanghai
 *   - 月统计口径（在 RPC 内实现）：
 *     获得 = reward + adjustment(manual_compensation)
 *     消费 = expense + adjustment(expense_delta_negative)
 *            - adjustment(expense_delta_positive / expense_refund)（冲减消费）
 *     penalty / revoke 不计入获得/消费双栏
 *   - 列表为账本顺序；回填消费按 expense_date 展示，同一天可能因中间
 *     隔着其他日期交易出现多个分组（分组件按组内首条交易 id 作 key）
 *   - 任一必需查询失败直接 throw，页面渲染统一失败态
 */

export type TxType = "reward" | "penalty" | "expense" | "adjustment" | "revoke";

export type TransactionItem = {
  id: string;
  type: TxType;
  reason: string | null;
  amount: number; // 带符号
  description: string | null;
  createdAt: string;
  balanceAfter: number;
  /** 消费项的记账日期（YYYY-MM-DD，用户选择的 expense_date） */
  expenseDate: string | null;
  /** 分组用日期标签（如 "8月17日"；消费项按 expense_date，其余按用户时区 created_at） */
  dayLabel: string;
  /** 时间标签（HH:mm，用户时区；消费项无时间仅日期） */
  timeLabel: string | null;
};

export type WalletData = {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  netAmount: number;
  monthEarned: number;
  monthSpent: number;
  monthKey: string; // "YYYY-MM"
  /** 用户时区的今天（YYYY-MM-DD），弹窗日期默认值/上限 */
  todayIso: string;
  transactions: TransactionItem[];
};

const DEFAULT_TZ = "Asia/Shanghai";

function dateInTZ(tz: string, at: Date): string {
  // en-CA locale 恰好输出 YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

function timeInTZ(tz: string, at: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(at);
}

function dayLabelOf(ymd: string): string {
  const [, m, d] = ymd.split("-").map(Number);
  return `${m}月${d}日`;
}

export async function getWalletData(): Promise<WalletData> {
  const supabase = await createSupabaseServerClient();

  type ProfileRow = {
    id: string;
    wallet_balance: number;
    total_earned: number;
    total_spent: number;
    timezone: string | null;
  };
  type TxRow = {
    id: string;
    transaction_type: TxType;
    reason: string | null;
    amount: number;
    description: string | null;
    created_at: string;
    balance_after: number;
  };
  type ExpenseRow = { transaction_id: string; expense_date: string };

  // 时区取决于 profile，须先取 profile
  const profileRes = await supabase.rpc("get_my_profile").single();
  if (profileRes.error) {
    throw new Error(`荷包资料加载失败: ${profileRes.error.message}`);
  }
  const profileRow = profileRes.data as ProfileRow | null;
  if (!profileRow) {
    throw new Error("荷包资料为空");
  }

  const tz = profileRow.timezone || DEFAULT_TZ;
  const todayIso = dateInTZ(tz, new Date());
  const monthKey = todayIso.slice(0, 7);
  const monthStartDate = `${monthKey}-01`;

  // 流水列表（账本顺序，最近 100 条）
  const txRes = await supabase
    .from("transactions")
    .select(
      "id,transaction_type,reason,amount,description,created_at,balance_after",
    )
    .order("sequence_no", { ascending: false })
    .limit(100);
  if (txRes.error) {
    throw new Error(`交易记录加载失败: ${txRes.error.message}`);
  }
  const txRows = (txRes.data ?? []) as TxRow[];
  const listTxIds = txRows.map((t) => t.id);

  // 列表消费关联（只查列表涉及的 expense）+ 本月双栏合计（DB 内聚合）
  const [listExpenseRes, summaryRes] = await Promise.all([
    listTxIds.length > 0
      ? supabase
          .from("expenses")
          .select("transaction_id,expense_date")
          .in("transaction_id", listTxIds)
      : Promise.resolve({ data: [], error: null }),
    supabase.rpc("get_my_month_summary", {
      p_month_start: monthStartDate,
    }).single(),
  ]);

  if (listExpenseRes.error) {
    throw new Error(`消费记录关联加载失败: ${listExpenseRes.error.message}`);
  }
  if (summaryRes.error) {
    throw new Error(`本月统计加载失败: ${summaryRes.error.message}`);
  }

  type SummaryRow = { month_earned: number; month_spent: number };
  const summaryRow = summaryRes.data as SummaryRow | null;

  // transaction_id → expense_date（列表展示用）
  const expenseDateByTx = new Map<string, string>();
  for (const row of ((listExpenseRes.data ?? []) as ExpenseRow[])) {
    expenseDateByTx.set(row.transaction_id, row.expense_date);
  }

  const transactions: TransactionItem[] = txRows.map((t) => {
    const expenseDate = expenseDateByTx.get(t.id) ?? null;
    const created = new Date(t.created_at);
    if (expenseDate != null) {
      return {
        id: t.id,
        type: t.transaction_type,
        reason: t.reason,
        amount: t.amount,
        description: t.description,
        createdAt: t.created_at,
        balanceAfter: t.balance_after,
        expenseDate,
        dayLabel: dayLabelOf(expenseDate),
        timeLabel: null,
      };
    }
    return {
      id: t.id,
      type: t.transaction_type,
      reason: t.reason,
      amount: t.amount,
      description: t.description,
      createdAt: t.created_at,
      balanceAfter: t.balance_after,
      expenseDate: null,
      dayLabel: dayLabelOf(dateInTZ(tz, created)),
      timeLabel: timeInTZ(tz, created),
    };
  });

  return {
    balance: profileRow.wallet_balance,
    totalEarned: profileRow.total_earned,
    totalSpent: profileRow.total_spent,
    netAmount: profileRow.wallet_balance,
    monthEarned: summaryRow?.month_earned ?? 0,
    monthSpent: summaryRow?.month_spent ?? 0,
    monthKey,
    todayIso,
    transactions,
  };
}
