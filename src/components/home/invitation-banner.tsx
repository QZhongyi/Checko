"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Check, X } from "lucide-react";
import type { ProjectInvitation } from "@/lib/home-data";
import {
  acceptProjectInvitationAction,
  rejectProjectInvitationAction,
  type MembershipActionState,
} from "@/app/actions/project-membership";

/**
 * 首页项目邀请横幅：逐条展示待处理邀请（接受 / 拒绝）。
 * 接受文案含团队隐私告知（需求 10.17.3：多人项目团队榜对 active
 * 成员暴露精确实时团队总额，2 人团队可反推对方余额）。
 */
export function InvitationBanner({
  invitations,
}: {
  invitations: ProjectInvitation[];
}) {
  if (invitations.length === 0) return null;

  return (
    <section
      aria-label="项目邀请"
      className="rounded-3xl bg-white p-4 shadow-[0_6px_20px_rgba(0,0,0,0.045)]"
    >
      {invitations.map((invite, idx) => (
        <InvitationRow key={invite.projectId} invite={invite} isFirst={idx === 0} />
      ))}
    </section>
  );
}

function InvitationRow({
  invite,
  isFirst,
}: {
  invite: ProjectInvitation;
  isFirst: boolean;
}) {
  const [acceptState, acceptAction, acceptPending] = useActionState<
    MembershipActionState,
    FormData
  >(acceptProjectInvitationAction, undefined);
  const [rejectState, rejectAction, rejectPending] = useActionState<
    MembershipActionState,
    FormData
  >(rejectProjectInvitationAction, undefined);

  const error = acceptState?.error ?? rejectState?.error;
  const accepted = acceptState?.success === true;
  const rejected = rejectState?.success === true;
  const done = accepted || rejected;

  return (
    <div className={isFirst ? "" : "mt-3 border-t border-[#F3F4F6] pt-3"}>
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-icon-bg)] text-xl"
        >
          {invite.icon ?? "📝"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-5 text-[var(--color-text-primary)]">
            「{invite.name}」邀请你加入
          </p>
          <p className="mt-0.5 text-xs leading-4 text-[var(--color-text-secondary)]">
            {invite.projectStatus === "active"
              ? "项目已开始，接受后立即参与"
              : `项目 ${invite.startsAt ?? "待定"} 开始`}
          </p>
        </div>
        {done ? (
          <span className="shrink-0 text-xs text-[var(--color-text-secondary)]">
            {accepted ? "已加入" : "已拒绝"}
          </span>
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <form action={acceptAction}>
              <input type="hidden" name="projectId" value={invite.projectId} />
              <button
                type="submit"
                disabled={acceptPending || rejectPending}
                aria-label={`接受加入 ${invite.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white transition active:scale-95 disabled:opacity-60"
                style={{
                  background:
                    "linear-gradient(90deg, var(--color-primary), var(--color-primary-bright))",
                }}
              >
                {acceptPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
              </button>
            </form>
            <form action={rejectAction}>
              <input type="hidden" name="projectId" value={invite.projectId} />
              <button
                type="submit"
                disabled={acceptPending || rejectPending}
                aria-label={`拒绝加入 ${invite.name}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-[var(--color-text-secondary)] transition active:scale-95 disabled:opacity-60"
              >
                {rejectPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <X size={16} />
                )}
              </button>
            </form>
          </div>
        )}
      </div>
      {!done ? (
        <p className="mt-2 text-[11px] leading-4 text-[var(--color-text-secondary)]">
          加入多人项目后，团队整体余额榜对所有 active 成员可见精确实时总额，
          2 人团队中可结合自己余额反推对方余额，请确认接受。
          {error ? (
            <span className="ml-1 text-red-500">{error}</span>
          ) : null}
        </p>
      ) : null}
      {accepted ? (
        <Link
          href={`/projects/${invite.projectId}`}
          className="mt-2 inline-block text-xs font-medium text-[var(--color-primary)]"
        >
          进入项目 →
        </Link>
      ) : null}
    </div>
  );
}
