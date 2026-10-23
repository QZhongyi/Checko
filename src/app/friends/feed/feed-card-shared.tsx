"use client";

import { useFormStatus } from "react-dom";
import { Heart, Loader2 } from "lucide-react";
import type { FeedUser } from "@/lib/friends-feed-data";

/** 点赞红（好友动态页_prompt §六：#FF4B6B，区别于负债红 #FF4B4B） */
export const LIKE_RED = "#FF4B6B";
/** 催促橙（prompt §六：#FF9500 专属"催打卡"语义） */
export const NUDGE_ORANGE = "#FF9500";
/** 多人紫（prompt §六：#8B5CF6 多人 / 社交） */
export const GROUP_PURPLE = "#8B5CF6";

/** 头像（昵称首字母圆底，惯例同 friends-tab；无在线状态数据源，不渲染在线点） */
export function FeedAvatar({
  user,
  muted = false,
}: {
  user: FeedUser;
  muted?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold ${
        muted
          ? "bg-[#EFF1F3] text-[var(--color-text-secondary)]"
          : "bg-[#EFFAF3] text-[var(--color-primary)]"
      }`}
    >
      {(user.nickname ?? "?").slice(0, 1).toUpperCase()}
    </span>
  );
}

/**
 * 动态卡通用头部：头像 + 昵称 + 相对时间 + 项目类型徽章
 * （👤 个人 / 👥 多人，prompt §4.4 通用结构）
 */
export function FeedCardHeader({
  user,
  timeLabel,
  projectType,
  muted = false,
}: {
  user: FeedUser;
  timeLabel: string;
  projectType: "personal" | "group" | null;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <FeedAvatar user={user} muted={muted} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold leading-5 text-[var(--color-text-primary-2)]">
          {user.nickname ?? "未知用户"}
        </p>
        {timeLabel ? (
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
            {timeLabel}
          </p>
        ) : null}
      </div>
      {projectType ? (
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
            projectType === "group"
              ? "bg-[#F3EFFE] text-[#6D42C8]"
              : "bg-[#F3F4F6] text-[var(--color-text-secondary)]"
          }`}
        >
          {projectType === "group" ? "👥 多人" : "👤 个人"}
        </span>
      ) : null}
    </div>
  );
}

/** 点赞按钮：未点灰描边空心 / 已点红心填充加粗（toggle，00090 RPC） */
export function LikeButton({
  targetType,
  targetId,
  liked,
  count,
  action,
}: {
  targetType: "checkin" | "achievement";
  targetId: string;
  liked: boolean;
  count: number;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="targetId" value={targetId} />
      <LikeSubmitButton liked={liked} count={count} />
    </form>
  );
}

function LikeSubmitButton({
  liked,
  count,
}: {
  liked: boolean;
  count: number;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-pressed={liked}
      aria-label={liked ? "取消点赞" : "点赞"}
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] transition active:scale-95 disabled:opacity-60 ${
        liked
          ? "font-bold"
          : "border border-[#E5E7EB] font-medium text-[var(--color-text-secondary)]"
      }`}
      style={liked ? { color: LIKE_RED } : undefined}
    >
      {pending ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <Heart size={15} fill={liked ? "currentColor" : "none"} />
      )}
      {count}
    </button>
  );
}
