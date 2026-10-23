"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import {
  cancelProjectAction,
  type MembershipActionState,
} from "@/app/actions/project-membership";

/**
 * 取消项目按钮（owner + pending/active；cancel_project 软删，
 * 已发放金币不回收——confirm 文案明示）。成功后 action 层 redirect 首页。
 */
export function CancelProjectButton({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState<
    MembershipActionState,
    FormData
  >(cancelProjectAction, undefined);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !window.confirm(
            "取消后项目与打卡记录将不再展示，已发放的金币不会退回，确定取消？",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="projectId" value={projectId} />
      <button
        type="submit"
        disabled={pending}
        className="h-10 w-full rounded-2xl border border-[#FFD4D0] bg-white text-sm font-medium text-[var(--color-debt-red)] transition active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? (
          <span className="flex items-center justify-center gap-1.5">
            <Loader2 size={14} className="animate-spin" /> 取消中…
          </span>
        ) : (
          "取消项目"
        )}
      </button>
      {state?.error ? (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
