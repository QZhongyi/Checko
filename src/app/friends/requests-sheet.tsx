"use client";

import { useActionState, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { BottomSheet, SheetHeader } from "@/components/ui/bottom-sheet";
import type { FriendRequest } from "@/lib/friend-data";
import {
  acceptFriendRequestAction,
  rejectFriendRequestAction,
  deleteFriendshipAction,
  type FriendActionState,
} from "@/app/actions/friend";

/**
 * 好友申请列表弹窗（复制 record-expense-sheet 骨架）：
 * - 收到的申请：接受 / 拒绝
 * - 发出的申请：展示 + 撤回（delete_friendship，00029 支持撤回 pending 行）
 * - 成功后由 revalidatePath("/friends") 刷新服务端数据，行自然消失
 */
export function RequestsSheet({
  requests,
  onClose,
}: {
  requests: FriendRequest[];
  onClose: () => void;
}) {
  const received = requests.filter((r) => r.direction === "received");
  const sent = requests.filter((r) => r.direction === "sent");

  const [acceptState, acceptAction, isAccepting] = useActionState<
    FriendActionState,
    FormData
  >(acceptFriendRequestAction, undefined);
  const [rejectState, rejectAction, isRejecting] = useActionState<
    FriendActionState,
    FormData
  >(rejectFriendRequestAction, undefined);
  const [deleteState, deleteAction, isDeleting] = useActionState<
    FriendActionState,
    FormData
  >(deleteFriendshipAction, undefined);

  // 相反操作（接受/拒绝、撤回）不允许并发：任一操作进行中统一禁用全部行内按钮
  const rowActionPending = isAccepting || isRejecting || isDeleting;

  // 最近一次提交的操作（点击时记录）；错误只读取该操作对应的 action state，
  // pending 期间隐藏旧提示——避免旧错误遮住/误代表最新操作
  const [lastOp, setLastOp] = useState<{
    op: "accept" | "reject" | "remove";
    friendshipId: string;
  } | null>(null);

  const stateOf = (op: "accept" | "reject" | "remove") =>
    op === "accept" ? acceptState : op === "reject" ? rejectState : deleteState;

  const rowError = (friendshipId: string) => {
    if (rowActionPending || !lastOp || lastOp.friendshipId !== friendshipId)
      return undefined;
    return stateOf(lastOp.op)?.error;
  };

  return (
    <BottomSheet titleId="friend-requests-title" onClose={onClose}>
      <SheetHeader titleId="friend-requests-title" title="好友申请" onClose={onClose} />

        {requests.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--color-text-secondary)]">
            暂无待处理的好友申请
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-5">
            {received.length > 0 ? (
              <section>
                <h4 className="text-[13px] font-medium text-[var(--color-text-secondary)]">
                  收到的申请
                </h4>
                <ul className="mt-2 flex flex-col gap-3">
                  {received.map((r) => (
                    <li
                      key={r.friendshipId}
                      className="rounded-2xl bg-[#F9FAFB] px-3 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar nickname={r.nickname} />
                        <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-[var(--color-text-primary-2)]">
                          {r.nickname ?? "未知用户"}
                        </span>
                        <form action={acceptAction}>
                          <input
                            type="hidden"
                            name="friendshipId"
                            value={r.friendshipId}
                          />
                          <SheetIconButton
                            label="接受"
                            kind="accept"
                            disabled={rowActionPending}
                            onClick={() =>
                              setLastOp({ op: "accept", friendshipId: r.friendshipId })
                            }
                          />
                        </form>
                        <form action={rejectAction}>
                          <input
                            type="hidden"
                            name="friendshipId"
                            value={r.friendshipId}
                          />
                          <SheetIconButton
                            label="拒绝"
                            kind="reject"
                            disabled={rowActionPending}
                            onClick={() =>
                              setLastOp({ op: "reject", friendshipId: r.friendshipId })
                            }
                          />
                        </form>
                      </div>
                      {rowError(r.friendshipId) ? (
                        <p className="mt-1 text-xs font-medium text-[var(--color-debt-red)]">
                          {rowError(r.friendshipId)}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {sent.length > 0 ? (
              <section>
                <h4 className="text-[13px] font-medium text-[var(--color-text-secondary)]">
                  发出的申请
                </h4>
                <ul className="mt-2 flex flex-col gap-3">
                  {sent.map((r) => (
                    <li
                      key={r.friendshipId}
                      className="rounded-2xl bg-[#F9FAFB] px-3 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar nickname={r.nickname} />
                        <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-[var(--color-text-primary-2)]">
                          {r.nickname ?? "未知用户"}
                        </span>
                        <span className="text-xs text-[var(--color-text-secondary)]">
                          等待对方处理
                        </span>
                        <form action={deleteAction}>
                          <input
                            type="hidden"
                            name="friendshipId"
                            value={r.friendshipId}
                          />
                          <button
                            type="submit"
                            disabled={rowActionPending}
                            onClick={() =>
                              setLastOp({ op: "remove", friendshipId: r.friendshipId })
                            }
                            className="text-xs font-medium text-[var(--color-text-secondary)] underline underline-offset-2 disabled:opacity-60"
                          >
                            撤回
                          </button>
                        </form>
                      </div>
                      {rowError(r.friendshipId) ? (
                        <p className="mt-1 text-xs font-medium text-[var(--color-debt-red)]">
                          {rowError(r.friendshipId)}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        )}
    </BottomSheet>
  );
}

function Avatar({ nickname }: { nickname: string | null }) {
  const initial = (nickname ?? "?").slice(0, 1).toUpperCase();
  return (
    <span
      aria-hidden
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFFAF3] text-sm font-bold text-[var(--color-primary)]"
    >
      {initial}
    </span>
  );
}

function SheetIconButton({
  label,
  kind,
  disabled,
  onClick,
}: {
  label: string;
  kind: "accept" | "reject";
  disabled?: boolean;
  onClick?: () => void;
}) {
  const accept = kind === "accept";
  return (
    <button
      type="submit"
      disabled={disabled}
      aria-label={label}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-full transition active:scale-90 disabled:opacity-60 ${
        accept
          ? "bg-[var(--color-primary)] text-white"
          : "bg-white text-[var(--color-debt-red)] ring-1 ring-[#F0C8C4]"
      }`}
    >
      {disabled ? (
        <Loader2 size={16} className="animate-spin" />
      ) : accept ? (
        <Check size={16} strokeWidth={3} />
      ) : (
        <X size={16} strokeWidth={3} />
      )}
    </button>
  );
}
