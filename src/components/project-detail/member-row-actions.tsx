"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import {
  cancelProjectInvitationAction,
  removeProjectMemberAction,
  quitProjectAction,
  type MembershipActionState,
} from "@/app/actions/project-membership";

/**
 * owner 对成员行的操作（规则由 RPC 强制，这里只按状态控制可见性）：
 * - pending 邀请：取消邀请（pending/active 项目均可）
 * - active 成员：移除（仅 pending 项目，confirm 二次确认）
 */
export function MemberRowActions({
  projectId,
  projectStatus,
  memberStatus,
  targetUserId,
}: {
  projectId: string;
  projectStatus: "pending" | "active" | "cancelled" | "archived";
  memberStatus: "pending" | "active";
  targetUserId: string;
}) {
  if (memberStatus === "pending") {
    return (
      <RowForm
        action={cancelProjectInvitationAction}
        projectId={projectId}
        targetUserId={targetUserId}
        label="取消邀请"
        confirmText={null}
      />
    );
  }
  if (projectStatus === "pending") {
    return (
      <RowForm
        action={removeProjectMemberAction}
        projectId={projectId}
        targetUserId={targetUserId}
        label="移除"
        confirmText="确定移除该成员吗？"
      />
    );
  }
  return null;
}

/** 本人退出项目（非 owner + pending 项目，面板底部按钮） */
export function QuitProjectButton({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState<
    MembershipActionState,
    FormData
  >(quitProjectAction, undefined);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm("确定退出该项目吗？退出后需对方重新邀请才能再次加入。")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="projectId" value={projectId} />
      <button
        type="submit"
        disabled={pending}
        className="h-10 w-full rounded-2xl border border-line bg-white text-sm font-medium text-[var(--color-text-secondary)] transition active:scale-[0.98] disabled:opacity-60"
      >
        {pending ? (
          <span className="flex items-center justify-center gap-1.5">
            <Loader2 size={14} className="animate-spin" /> 退出中…
          </span>
        ) : (
          "退出项目"
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

function RowForm({
  action,
  projectId,
  targetUserId,
  label,
  confirmText,
}: {
  action: (
    state: MembershipActionState,
    formData: FormData,
  ) => Promise<MembershipActionState>;
  projectId: string;
  targetUserId: string;
  label: string;
  confirmText: string | null;
}) {
  const [state, formAction, pending] = useActionState<
    MembershipActionState,
    FormData
  >(action, undefined);
  const error =
    state?.error && state.targetUserId === targetUserId ? state.error : null;

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <form
        action={formAction}
        onSubmit={
          confirmText
            ? (e) => {
                if (!window.confirm(confirmText)) e.preventDefault();
              }
            : undefined
        }
      >
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="targetUserId" value={targetUserId} />
        <button
          type="submit"
          disabled={pending}
          className="flex h-8 items-center rounded-full border border-line px-3 text-xs text-[var(--color-text-secondary)] transition active:scale-95 disabled:opacity-60"
        >
          {pending ? <Loader2 size={12} className="animate-spin" /> : null}
          {label}
        </button>
      </form>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
