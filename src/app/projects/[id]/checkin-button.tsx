"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Loader2 } from "lucide-react";
import {
  performCheckin,
  revokeCheckin,
  type CheckinActionState,
} from "@/app/actions/checkin";
import type { CheckinEligibility } from "@/lib/project-detail-data";

/**
 * 详情页全宽打卡按钮（按 eligibility 渲染，数据库为最终权限边界）
 *
 * eligible      → 绿渐变全宽按钮（every_time 模式才显示 +N）
 * done          → 浅绿"今日已打卡" + 撤销链接（confirm + 到点隐藏）
 * after_deadline→ 灰态"今日已截止"（含长驻页面到点切换）
 * not_started   → 灰态"项目未开始"
 * ended         → 灰态"项目已结束"
 */
export function CheckinButton({
  projectId,
  eligibility,
  rewardMode,
  rewardAmount,
  todayCheckinId,
  canRevoke,
  deadlineAt,
}: {
  projectId: string;
  eligibility: CheckinEligibility;
  rewardMode: "every_time" | "every_n" | "completed";
  rewardAmount: number;
  todayCheckinId: string | null;
  canRevoke: boolean;
  deadlineAt: string;
}) {
  const [checkinState, checkinFormAction] = useActionState<
    CheckinActionState,
    FormData
  >(performCheckin, undefined);
  const [revokeState, revokeFormAction] = useActionState<
    CheckinActionState,
    FormData
  >(revokeCheckin, undefined);
  const errorMsg = checkinState?.error ?? revokeState?.error;

  // 到点隐藏撤销入口（渲染期调整 + setTimeout 回调，与 habit-card 同模式）
  const [expired, setExpired] = useState(
    () => Date.now() >= new Date(deadlineAt).getTime(),
  );
  const [prevDeadline, setPrevDeadline] = useState(deadlineAt);
  if (prevDeadline !== deadlineAt) {
    setPrevDeadline(deadlineAt);
    setExpired(false);
  }
  const revocable = canRevoke && !expired;
  useEffect(() => {
    if (expired) return;
    const remaining = new Date(deadlineAt).getTime() - Date.now();
    const timer = setTimeout(() => setExpired(true), Math.max(remaining, 0));
    return () => clearTimeout(timer);
  }, [deadlineAt, expired]);

  if (eligibility === "after_deadline" || (eligibility === "eligible" && expired)) {
    // 服务端首次加载派生 after_deadline；长驻页面跨截止时间由 expired
    // 定时器到点切换（数据库仍是最终权限边界）
    return <DisabledState>今日已截止，明天再来吧</DisabledState>;
  }
  if (eligibility === "not_started") {
    return <DisabledState>项目未开始</DisabledState>;
  }
  if (eligibility === "ended") {
    return <DisabledState>项目已结束</DisabledState>;
  }

  if (eligibility === "done") {
    return (
      <div>
        <div className="relative">
          <div className="flex h-14 w-full items-center justify-center gap-2 rounded-3xl bg-[var(--color-primary-soft)] text-[15px] font-bold text-[var(--color-primary)]">
            <Check size={20} strokeWidth={3} />
            今日已打卡
          </div>
          {revocable && todayCheckinId ? (
            <form
              action={revokeFormAction}
              className="absolute -bottom-7 left-0 right-0 text-center"
              onSubmit={(e) => {
                if (!confirm("撤销后奖励将被回收，确定？")) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="checkinId" value={todayCheckinId} />
              <input type="hidden" name="projectId" value={projectId} />
              <RevokeButton />
            </form>
          ) : null}
        </div>
        {errorMsg ? (
          <p
            className={`mt-2 text-center text-xs font-medium text-[var(--color-debt-red)] ${revocable ? "mt-9" : ""}`}
          >
            {errorMsg}
          </p>
        ) : null}
      </div>
    );
  }

  // eligible
  return (
    <div>
      <form action={checkinFormAction}>
        <input type="hidden" name="projectId" value={projectId} />
        <SubmitButton
          rewardAmount={rewardMode === "every_time" ? rewardAmount : 0}
        />
      </form>
      {errorMsg ? (
        <p className="mt-2 text-center text-xs font-medium text-[var(--color-debt-red)]">
          {errorMsg}
        </p>
      ) : null}
    </div>
  );
}

function DisabledState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-14 w-full items-center justify-center rounded-3xl bg-[#F1F2F4] text-[15px] font-medium text-[var(--color-text-secondary)]">
      {children}
    </div>
  );
}

function SubmitButton({ rewardAmount }: { rewardAmount: number }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-3xl text-[17px] font-bold text-white shadow-[0_8px_20px_rgba(34,197,94,0.25)] transition active:scale-[0.98] disabled:opacity-60"
      style={{
        background:
          "linear-gradient(135deg, var(--color-primary), var(--color-primary-bright))",
      }}
    >
      {pending ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        <>
          打卡
          {rewardAmount > 0 ? <span>+{rewardAmount} 🪙</span> : null}
        </>
      )}
    </button>
  );
}

function RevokeButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs font-medium text-[var(--color-text-secondary)] underline underline-offset-2 disabled:opacity-60"
    >
      {pending ? "撤销中…" : "撤销"}
    </button>
  );
}
