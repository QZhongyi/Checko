"use client";

import { useActionState } from "react";
import type { FriendData } from "@/lib/friend-data";
import {
  deleteFriendshipAction,
  type FriendActionState,
} from "@/app/actions/friend";

/**
 * 好友列表 tab：头像 + 昵称 + 今日 x/y + 🔥 streak + 删除好友。
 * 聚合口径全部来自服务端（get_my_friends，00052），组件零逻辑。
 */
export function FriendsTab({ data }: { data: FriendData }) {
  const [deleteState, deleteAction] = useActionState<
    FriendActionState,
    FormData
  >(deleteFriendshipAction, undefined);

  if (data.friends.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-3xl bg-white px-6 py-12 text-center shadow-[0_6px_20px_rgba(0,0,0,0.045)]">
        <span aria-hidden className="text-5xl">
          🤝
        </span>
        <p className="mt-1 text-[15px] font-bold text-[var(--color-text-primary-2)]">
          还没有好友
        </p>
        <p className="text-sm text-[var(--color-text-secondary)]">
          点右上角「添加」，用邮箱搜索添加好友
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {deleteState?.error ? (
        <p className="text-xs font-medium text-[var(--color-debt-red)]">
          {deleteState.error}
        </p>
      ) : null}

      <ul className="flex flex-col gap-2.5">
        {data.friends.map((friend) => (
          <li
            key={friend.userId}
            className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.045)]"
          >
            <span
              aria-hidden
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EFFAF3] text-lg font-bold text-[var(--color-primary)]"
            >
              {(friend.nickname ?? "?").slice(0, 1).toUpperCase()}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] font-bold leading-6 text-[var(--color-text-primary-2)]">
                {friend.nickname ?? "未知用户"}
              </p>
              <p className="mt-0.5 text-[13px] font-medium text-[var(--color-text-secondary)]">
                {friend.todayTotal > 0
                  ? `今日 ${friend.todayCompleted}/${friend.todayTotal}`
                  : "今日无打卡任务"}
              </p>
            </div>

            {friend.streak > 0 ? (
              <span className="shrink-0 text-[13px] font-bold text-[#E8590C]">
                🔥 {friend.streak}
              </span>
            ) : null}

            {friend.friendshipId ? (
              <form
                action={deleteAction}
                onSubmit={(e) => {
                  if (!confirm("删除后将不再是好友，确定？")) {
                    e.preventDefault();
                  }
                }}
              >
                <input
                  type="hidden"
                  name="friendshipId"
                  value={friend.friendshipId}
                />
                <button
                  type="submit"
                  className="shrink-0 text-xs font-medium text-[var(--color-text-secondary)] underline underline-offset-2"
                >
                  删除
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
