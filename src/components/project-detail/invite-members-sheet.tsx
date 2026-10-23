"use client";

import { useActionState, useState } from "react";
import { UserRoundPlus, Loader2 } from "lucide-react";
import { BottomSheet, SheetHeader } from "@/components/ui/bottom-sheet";
import type { InvitableFriend } from "@/lib/friend-data";
import {
  inviteProjectMemberAction,
  type MembershipActionState,
} from "@/app/actions/project-membership";

/**
 * 邀请成员弹窗（owner + pending 项目）：好友列表逐个邀请；
 * 已是成员/已有邀请的好友由后端拒绝并透传文案，行级展示错误。
 */
export function InviteMembersSheet({
  projectId,
  friends,
}: {
  projectId: string;
  friends: InvitableFriend[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-white transition active:scale-95"
        style={{
          background:
            "linear-gradient(90deg, var(--color-primary), var(--color-primary-bright))",
        }}
      >
        <UserRoundPlus size={16} />
        邀请
      </button>

      {open ? (
        <BottomSheet titleId="invite-members-title" onClose={() => setOpen(false)}>
          <SheetHeader
            titleId="invite-members-title"
            title="邀请好友"
            onClose={() => setOpen(false)}
          />
          <p className="mt-2 text-xs leading-5 text-[var(--color-text-secondary)]">
            好友接受邀请后加入项目；项目开始后不能再发新邀请
          </p>
          <ul className="mt-3 flex flex-col divide-y divide-[#F3F4F6]">
            {friends.length === 0 ? (
              <li className="py-6 text-center text-sm text-[var(--color-text-secondary)]">
                还没有好友，先去添加好友吧
              </li>
            ) : (
              friends.map((friend) => (
                <FriendInviteRow
                  key={friend.userId}
                  projectId={projectId}
                  friend={friend}
                />
              ))
            )}
          </ul>
        </BottomSheet>
      ) : null}
    </>
  );
}

function FriendInviteRow({
  projectId,
  friend,
}: {
  projectId: string;
  friend: InvitableFriend;
}) {
  const [state, action, pending] = useActionState<
    MembershipActionState,
    FormData
  >(inviteProjectMemberAction, undefined);

  const invited = state?.success === true && state.targetUserId === friend.userId;
  const error =
    state?.error && state.targetUserId === friend.userId ? state.error : null;
  const initial = (friend.nickname ?? "友").slice(0, 1).toUpperCase();

  return (
    <li className="flex items-center gap-3 py-3">
      <span
        aria-hidden
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F5F6F8] text-sm font-semibold text-[var(--color-text-secondary)]"
      >
        {initial}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-5 text-[var(--color-text-primary)]">
          {friend.nickname ?? "未命名"}
        </p>
        {error ? (
          <p className="mt-0.5 text-xs leading-4 text-red-500">{error}</p>
        ) : null}
      </div>
      {invited ? (
        <span className="text-xs text-[var(--color-text-secondary)]">已邀请</span>
      ) : (
        <form action={action}>
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="targetUserId" value={friend.userId} />
          <button
            type="submit"
            disabled={pending}
            className="flex h-8 items-center gap-1 rounded-full bg-[var(--color-brand-icon-bg)] px-3 text-xs font-medium text-[var(--color-primary)] transition active:scale-95 disabled:opacity-60"
          >
            {pending ? <Loader2 size={12} className="animate-spin" /> : null}
            邀请
          </button>
        </form>
      )}
    </li>
  );
}
