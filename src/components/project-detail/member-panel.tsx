import {
  type MemberOverview,
  type MemberOverviewMember,
} from "@/lib/project-detail-data";
import type { InvitableFriend } from "@/lib/friend-data";
import { InviteMembersSheet } from "./invite-members-sheet";
import { MemberRowActions, QuitProjectButton } from "./member-row-actions";

/**
 * 多人项目成员面板（服务端渲染）：
 * - 成员列表（owner 在前）：昵称 / 角色徽章 / 今日打卡状态
 * - 今日进度（active 成员口径）与打卡模式说明
 * - 管理操作（规则由 RPC 强制，此处只按状态控制可见性）：
 *   owner+pending 可邀请 / 取消邀请 / 移除成员；owner+active 仅可取消邀请；
 *   非 owner 成员在 pending 项目可退出
 */
export function MemberPanel({
  projectId,
  projectStatus,
  overview,
  friends,
}: {
  projectId: string;
  projectStatus: "pending" | "active" | "cancelled" | "archived";
  overview: MemberOverview;
  friends: InvitableFriend[];
}) {
  const canInvite =
    overview.isOwner && projectStatus === "pending";
  const memberCount = overview.members.length;

  return (
    <section
      aria-label="项目成员"
      className="mt-4 rounded-3xl bg-white p-5 shadow-[0_6px_20px_rgba(0,0,0,0.045)]"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold leading-6 text-[var(--color-text-primary-2)]">
          成员 {memberCount}/{overview.maxMembers}
        </h3>
        {canInvite ? <InviteMembersSheet projectId={projectId} friends={friends} /> : null}
      </div>

      <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">
        今日 {overview.todayDone}/{overview.todayTotal} 人已打卡 ·{" "}
        {overview.checkinMode === "any_one"
          ? "任意一人打卡即可"
          : "全员完成才算打卡"}
      </p>

      <ul className="mt-3 flex flex-col divide-y divide-[#F3F4F6]">
        {overview.members.map((member) => (
          <MemberRow
            key={member.userId}
            projectId={projectId}
            projectStatus={projectStatus}
            overview={overview}
            member={member}
          />
        ))}
      </ul>

      {!overview.isOwner &&
      projectStatus === "pending" &&
      overview.myStatus === "active" ? (
        <div className="mt-4">
          <QuitProjectButton projectId={projectId} />
        </div>
      ) : null}

      <div className="mt-4 border-t border-[#F3F4F6] pt-3">
        <p className="text-xs leading-5 text-[var(--color-text-secondary)]">
          团队奖励：每次完成结算 {overview.poolPerSettlement} 🪙 · 按当日成员平分
          （余数归创建者）
          {overview.settlementCount > 0
            ? ` · 我已累计分得 ${overview.mySettlementEarned} 🪙（${overview.settlementCount} 次）`
            : ""}
          {overview.lifetimeBudget != null
            ? ` · 总预算 ${overview.lifetimeBudget} 🪙 · 已发放 ${overview.totalGranted} 🪙`
            : ""}
        </p>
      </div>
    </section>
  );
}

function MemberRow({
  projectId,
  projectStatus,
  overview,
  member,
}: {
  projectId: string;
  projectStatus: "pending" | "active" | "cancelled" | "archived";
  overview: MemberOverview;
  member: MemberOverviewMember;
}) {
  return (
    <li className="flex items-center gap-3 py-3">
      <MemberAvatar member={member} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium leading-5 text-[var(--color-text-primary)]">
            {member.nickname ?? "未命名"}
          </span>
          {member.role === "owner" ? (
            <span className="shrink-0 rounded-full bg-[var(--color-brand-icon-bg)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-primary)]">
              创建者
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-xs leading-4 text-[var(--color-text-secondary)]">
          {member.status === "pending"
            ? "待接受邀请"
            : member.todayChecked
              ? `已打卡 ${formatTime(member.todayCheckedAt)}`
              : projectStatus === "active"
                ? "待打卡"
                : "已加入"}
        </p>
      </div>
      {overview.isOwner && member.role !== "owner" ? (
        <MemberRowActions
          projectId={projectId}
          projectStatus={projectStatus}
          memberStatus={member.status}
          targetUserId={member.userId}
        />
      ) : null}
    </li>
  );
}

/** 首字母头像圈（与好友申请列表同款；已打卡绿色/未打卡灰色） */
function MemberAvatar({ member }: { member: MemberOverviewMember }) {
  const initial = (member.nickname ?? "友").slice(0, 1).toUpperCase();
  const checked = member.status === "active" && member.todayChecked;
  return (
    <span
      aria-hidden
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
        checked
          ? "bg-[var(--color-brand-icon-bg)] text-[var(--color-primary)]"
          : "bg-[#F5F6F8] text-[var(--color-text-secondary)]"
      }`}
    >
      {initial}
    </span>
  );
}

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}
