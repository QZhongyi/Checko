"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Search } from "lucide-react";
import { BottomSheet, SheetHeader } from "@/components/ui/bottom-sheet";
import {
  searchUserAction,
  requestFriendshipAction,
  type SearchUserState,
  type FriendActionState,
} from "@/app/actions/friend";

/**
 * 添加好友弹窗：邮箱精确搜索（search_users）→ 按 relation 渲染结果。
 * 仅 relation=none 显示"发送申请"；其余态给出对应文案。
 * 发送结果按 action state 携带的 targetUserId 归属到对应行，
 * 不受响应到达时搜索结果切换的影响。
 */
export function AddFriendSheet({ onClose }: { onClose: () => void }) {
  const [searchState, searchAction, isSearching] = useActionState<
    SearchUserState,
    FormData
  >(searchUserAction, undefined);
  const [sendState, sendAction] = useActionState<
    FriendActionState,
    FormData
  >(requestFriendshipAction, undefined);

  const result = searchState?.result;

  // 发送结果只归属到本次提交的目标用户（action state 携带 targetUserId）
  const sendTargetsCurrent =
    sendState?.targetUserId != null &&
    sendState.targetUserId === result?.userId;
  const sent = sendState?.success === true && sendTargetsCurrent;
  const sendError =
    sendState?.error != null && sendTargetsCurrent ? sendState.error : null;

  return (
    <BottomSheet titleId="add-friend-title" onClose={onClose}>
      <SheetHeader titleId="add-friend-title" title="添加好友" onClose={onClose} />

        {/* 邮箱搜索 */}
        <form action={searchAction} className="mt-4 flex gap-2">
          <input
            name="email"
            type="email"
            required
            autoComplete="off"
            placeholder="输入对方注册邮箱"
            className="h-12 min-w-0 flex-1 rounded-2xl border border-[#E5E7EB] bg-white px-4 text-[15px] text-[var(--color-text-primary-2)] outline-none focus:border-[var(--color-primary)]"
          />
          <SearchSubmitButton />
        </form>

        {searchState?.error ? (
          <p className="mt-3 text-xs font-medium text-[var(--color-debt-red)]">
            {searchState.error}
          </p>
        ) : null}

        {/* 结果区：新搜索进行中隐藏旧结果，避免向旧目标误发申请 */}
        <div className="mt-4" hidden={isSearching}>
          {searchState != null && !result ? (
            <p className="rounded-2xl bg-[#F9FAFB] px-4 py-6 text-center text-sm text-[var(--color-text-secondary)]">
              未找到该邮箱注册的用户
            </p>
          ) : null}

          {result ? (
            <div className="flex items-center gap-3 rounded-2xl bg-[#F9FAFB] px-3 py-3">
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFFAF3] text-base font-bold text-[var(--color-primary)]"
              >
                {(result.nickname ?? "?").slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-[var(--color-text-primary-2)]">
                {result.nickname ?? "未知用户"}
              </span>

              {result.relation === "none" ? (
                sent ? (
                  <span className="text-[13px] font-bold text-[var(--color-primary)]">
                    ✓ 已发送申请
                  </span>
                ) : (
                  <form action={sendAction}>
                    <input
                      type="hidden"
                      name="targetUserId"
                      value={result.userId}
                    />
                    <SendButton />
                  </form>
                )
              ) : (
                <RelationLabel relation={result.relation} />
              )}
            </div>
          ) : null}

          {sendError ? (
            <p className="mt-3 text-xs font-medium text-[var(--color-debt-red)]">
              {sendError}
            </p>
          ) : null}
        </div>
    </BottomSheet>
  );
}

function RelationLabel({ relation }: { relation: string }) {
  const text =
    relation === "self"
      ? "这是你自己"
      : relation === "friends"
        ? "你们已经是好友"
        : relation === "pending_out"
          ? "已发送申请，待对方处理"
          : "对方已申请添加你，请到申请列表处理";
  return (
    <span className="text-right text-[13px] font-medium text-[var(--color-text-secondary)]">
      {text}
    </span>
  );
}

function SearchSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="搜索"
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white transition active:scale-95 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Search size={18} strokeWidth={2.5} />
      )}
    </button>
  );
}

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-9 items-center rounded-full bg-[var(--color-primary)] px-4 text-[13px] font-bold text-white transition active:scale-95 disabled:opacity-60"
    >
      {pending ? "发送中…" : "发送申请"}
    </button>
  );
}
