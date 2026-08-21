"use client";

import { useState } from "react";
import { Bell, UserPlus } from "lucide-react";
import type { FriendRequest } from "@/lib/friend-data";
import { RequestsSheet } from "./requests-sheet";
import { AddFriendSheet } from "./add-friend-sheet";

/**
 * 好友页顶栏：标题 + 申请入口（红点）+ 添加好友按钮。
 * 两个弹窗均为 client 组件（复制 record-expense-sheet 骨架）。
 */
export function FriendsHeader({
  requests,
  pendingReceivedCount,
}: {
  requests: FriendRequest[];
  pendingReceivedCount: number;
}) {
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between">
        <h1 className="text-[22px] font-bold leading-[30px] text-[var(--color-text-primary-2)]">
          好友
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRequestsOpen(true)}
            aria-label={`好友申请${pendingReceivedCount > 0 ? `，${pendingReceivedCount} 条待处理` : ""}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--color-text-primary-2)] shadow-[0_2px_8px_rgba(0,0,0,0.025)]"
          >
            <Bell size={20} />
            {pendingReceivedCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-debt-red)] px-1 text-[11px] font-bold text-white">
                {pendingReceivedCount > 9 ? "9+" : pendingReceivedCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            aria-label="添加好友"
            className="flex h-10 items-center gap-1 rounded-xl bg-[var(--color-primary)] px-3 text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(22,163,74,0.25)] transition active:scale-95"
          >
            <UserPlus size={16} />
            添加
          </button>
        </div>
      </header>

      {requestsOpen ? (
        <RequestsSheet requests={requests} onClose={() => setRequestsOpen(false)} />
      ) : null}
      {addOpen ? <AddFriendSheet onClose={() => setAddOpen(false)} /> : null}
    </>
  );
}
