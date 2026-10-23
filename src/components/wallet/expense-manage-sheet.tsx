"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, X } from "lucide-react";
import {
  updateExpense,
  deleteExpense,
  type ExpenseActionState,
} from "@/app/actions/expense";

/**
 * 消费管理弹窗（编辑金额/备注/日期 + 删除返还）。
 * - 编辑：update_expense RPC（金额差额走 adjustment；备注/日期 coalesce
 *   语义——传空 = 保留原值，只能改不能清空）
 * - 删除：原生 confirm（先例 checkin-button）→ delete_expense 软删 + 返还
 * - 两个 action 各自 useActionState；任一成功关窗（state 引用比较模式，
 *   先例 record-expense-sheet）
 */
export function ExpenseManageSheet({
  expense,
  todayIso,
  onClose,
}: {
  expense: {
    id: string;
    amount: number; // 原始支出为负数，展示/预填用绝对值
    note: string | null;
    expenseDate: string;
  };
  todayIso: string;
  onClose: () => void;
}) {
  const [updateState, updateAction] = useActionState<
    ExpenseActionState,
    FormData
  >(updateExpense, undefined);
  const [deleteState, deleteAction] = useActionState<
    ExpenseActionState,
    FormData
  >(deleteExpense, undefined);

  const [prevUpdate, setPrevUpdate] = useState(updateState);
  const [prevDelete, setPrevDelete] = useState(deleteState);
  if (prevUpdate !== updateState || prevDelete !== deleteState) {
    setPrevUpdate(updateState);
    setPrevDelete(deleteState);
    if (updateState?.success || deleteState?.success) onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-expense-title"
        className="absolute bottom-0 left-1/2 max-h-[100dvh] w-full max-w-[430px] -translate-x-1/2 overflow-y-auto rounded-t-[24px] bg-white p-5 pb-8"
      >
        <div className="mx-auto h-1.5 w-10 rounded-full bg-[#E5E7EB]" />
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            autoFocus
            aria-label="关闭"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F6] text-[var(--color-text-secondary)]"
          >
            <X size={20} />
          </button>
          <h3
            id="manage-expense-title"
            className="text-[17px] font-bold text-[var(--color-text-primary-2)]"
          >
            管理消费
          </h3>
          <span className="w-10" />
        </div>

        <form action={updateAction} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="expenseId" value={expense.id} />

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">
              金额
            </span>
            <input
              name="amount"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              defaultValue={String(Math.abs(expense.amount))}
              className="h-12 rounded-2xl border border-[#E5E7EB] bg-white px-4 text-[18px] font-bold text-[var(--color-text-primary-2)] outline-none focus:border-[var(--color-primary)]"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">
              备注（留空 = 保留原备注，不可清空）
            </span>
            <input
              name="note"
              type="text"
              maxLength={100}
              defaultValue={expense.note ?? ""}
              className="h-12 rounded-2xl border border-[#E5E7EB] bg-white px-4 text-[15px] text-[var(--color-text-primary-2)] outline-none focus:border-[var(--color-primary)]"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">
              日期（不可清除，仅可更改）
            </span>
            <input
              name="expenseDate"
              type="date"
              defaultValue={expense.expenseDate}
              max={todayIso}
              className="h-12 rounded-2xl border border-[#E5E7EB] bg-white px-4 text-[15px] text-[var(--color-text-primary-2)] outline-none focus:border-[var(--color-primary)]"
            />
          </label>

          {updateState?.error ? (
            <p className="text-xs font-medium text-[var(--color-debt-red)]">
              {updateState.error}
            </p>
          ) : null}

          <UpdateSubmitButton />
        </form>

        <form
          action={deleteAction}
          onSubmit={(e) => {
            if (!confirm("删除后该笔消费金额将全额返还小荷包，确定？")) {
              e.preventDefault();
            }
          }}
          className="mt-3"
        >
          <input type="hidden" name="expenseId" value={expense.id} />
          <DeleteSubmitButton />
          {deleteState?.error ? (
            <p className="mt-2 text-xs font-medium text-[var(--color-debt-red)]">
              {deleteState.error}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}

function UpdateSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-3xl text-[17px] font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
      style={{
        background:
          "linear-gradient(135deg, var(--color-primary), var(--color-primary-bright))",
      }}
    >
      {pending ? <Loader2 size={20} className="animate-spin" /> : "✓ 保存修改"}
    </button>
  );
}

function DeleteSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-3xl bg-[#FFEBEA] text-[15px] font-bold text-[var(--color-debt-red)] transition active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? <Loader2 size={18} className="animate-spin" /> : "删除这笔消费"}
    </button>
  );
}
