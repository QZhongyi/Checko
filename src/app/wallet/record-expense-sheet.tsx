"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, X } from "lucide-react";
import {
  recordExpense,
  type ExpenseActionState,
} from "@/app/actions/expense";

/**
 * 小荷包操作区（"记一笔"按钮 + 底部弹窗）
 *
 * - 弹窗：fixed 定位到视口（宽 430px 内容列居中，与 PhoneFrame 桌面
 *   呈现对齐；长列表滚动后面板始终可见）
 * - 余额实时预览：记录后余额 < 0 时变红并禁用提交（RPC 兜底）
 * - 成功关闭：渲染期检测 action state 引用变化（第二次成功也会关闭）
 * - 幂等：每次打开弹窗生成一次性 requestId，随表单提交（00046 RPC
 *   以其构造幂等键；同小时多笔同额消费不再被误拒）
 */
export function WalletActions({
  balance,
  todayIso,
}: {
  balance: number;
  todayIso: string;
}) {
  const inDebt = balance < 0;
  const [open, setOpen] = useState(false);
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [state, formAction] = useActionState<ExpenseActionState, FormData>(
    recordExpense,
    undefined,
  );

  // 成功后关闭弹窗（比较 state 引用：每次 action 完成都是新对象，
  // 第二次及以后的成功同样触发；渲染期调整模式）
  const [prevState, setPrevState] = useState(state);
  if (prevState !== state) {
    setPrevState(state);
    if (state?.success) {
      setOpen(false);
      setRequestId(crypto.randomUUID()); // 下一次记账动作使用新幂等键
    }
  }

  // Esc 关闭（事件回调内 setState 允许）
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        disabled={inDebt}
        onClick={() => setOpen(true)}
        className="flex-1 rounded-2xl bg-white/25 py-3 text-[15px] font-bold text-white transition active:scale-[0.98] disabled:bg-white/15 disabled:font-medium disabled:text-white/60"
        style={inDebt ? undefined : { boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }}
      >
        {inDebt ? "🔒 负债中不可记账" : "+ 记一笔"}
      </button>

      {open ? (
        <ExpenseSheet
          balance={balance}
          todayIso={todayIso}
          requestId={requestId}
          formAction={formAction}
          errorMsg={state?.error}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function ExpenseSheet({
  balance,
  todayIso,
  requestId,
  formAction,
  errorMsg,
  onClose,
}: {
  balance: number;
  todayIso: string;
  requestId: string;
  formAction: (formData: FormData) => void;
  errorMsg: string | undefined;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
  const amountNum = Number(amount) || 0;
  const after = balance - amountNum;
  const invalid =
    amount.trim() !== "" && (!/^\d+$/.test(amount.trim()) || after < 0);

  return (
    // fixed 视口定位：面板贴屏幕底部、宽 430px 内容列（与 PhoneFrame 一致），
    // 长列表滚动后仍可见
    <div className="fixed inset-0 z-50 flex justify-center">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* 面板（max-height + 内部滚动：短视口/软键盘弹出时顶部仍可达） */}
      <div className="absolute bottom-0 left-1/2 max-h-[100dvh] w-full max-w-[430px] -translate-x-1/2 overflow-y-auto rounded-t-[24px] bg-white p-5 pb-8">
        {/* 抓取条 + 头部 */}
        <div className="mx-auto h-1.5 w-10 rounded-full bg-[#E5E7EB]" />
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F6] text-[var(--color-text-secondary)]"
          >
            <X size={18} />
          </button>
          <h3 className="text-[17px] font-bold text-[var(--color-text-primary-2)]">
            记一笔
          </h3>
          <span className="w-8" />
        </div>

        <form action={formAction} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="requestId" value={requestId} />

          {/* 余额预览 */}
          <div
            className="rounded-2xl px-4 py-4"
            style={{
              background: invalid
                ? "#FFEBEA"
                : "linear-gradient(135deg, #FFC800, #FFD700)",
            }}
          >
            <p
              className={`text-xs font-medium ${invalid ? "text-[var(--color-debt-red)]" : "text-white/90"}`}
            >
              {invalid ? "⚠️ 金额无效或余额不足" : "当前余额"}
            </p>
            <p className="mt-1 text-[26px] font-bold leading-8 text-white">
              🪙 {balance}
            </p>
            {amount.trim() !== "" && !invalid ? (
              <p className="mt-1 text-sm font-medium text-white/90">
                记录后余额 🪙 {after}
              </p>
            ) : null}
            {after < 0 && amount.trim() !== "" ? (
              <p className="mt-1 text-sm font-bold text-[var(--color-debt-red)]">
                记录后余额 🪙 {after}（不足）
              </p>
            ) : null}
          </div>

          {/* 金额 */}
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">
              金额
            </span>
            <input
              name="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="请输入金币数"
              className="h-12 rounded-2xl border border-[#E5E7EB] bg-white px-4 text-[18px] font-bold text-[var(--color-text-primary-2)] outline-none focus:border-[var(--color-primary)]"
            />
          </label>

          {/* 备注 */}
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">
              备注（可选）
            </span>
            <input
              name="note"
              type="text"
              maxLength={100}
              placeholder="奖励自己一杯奶茶？"
              className="h-12 rounded-2xl border border-[#E5E7EB] bg-white px-4 text-[15px] text-[var(--color-text-primary-2)] outline-none focus:border-[var(--color-primary)]"
            />
          </label>

          {/* 日期 */}
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">
              日期
            </span>
            <input
              name="expenseDate"
              type="date"
              defaultValue={todayIso}
              max={todayIso}
              className="h-12 rounded-2xl border border-[#E5E7EB] bg-white px-4 text-[15px] text-[var(--color-text-primary-2)] outline-none focus:border-[var(--color-primary)]"
            />
          </label>

          {errorMsg ? (
            <p className="text-xs font-medium text-[var(--color-debt-red)]">
              {errorMsg}
            </p>
          ) : null}

          <SheetSubmitButton disabled={invalid || amount.trim() === ""} />
        </form>
      </div>
    </div>
  );
}

function SheetSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="mt-1 flex h-14 w-full items-center justify-center gap-2 rounded-3xl text-[17px] font-bold text-white transition active:scale-[0.98] disabled:bg-[#E5E7EB] disabled:text-[var(--color-text-secondary)]"
      style={
        disabled || pending
          ? undefined
          : {
              background:
                "linear-gradient(135deg, var(--color-primary), var(--color-primary-bright))",
            }
      }
    >
      {pending ? <Loader2 size={20} className="animate-spin" /> : "✓ 确认记录"}
    </button>
  );
}
