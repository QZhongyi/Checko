"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Loader2, Pencil, X } from "lucide-react";
import {
  updateNicknameAction,
  type ProfileActionState,
} from "@/app/actions/profile";

/**
 * 昵称展示态 ↔ 编辑态（useActionState 包 updateNicknameAction）。
 * 成功后 revalidatePath 刷新服务端数据回展示态。
 */
export function NicknameEditor({
  initialNickname,
}: {
  initialNickname: string;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction] = useActionState<
    ProfileActionState,
    FormData
  >(updateNicknameAction, undefined);

  // 成功后回展示态（渲染期调整模式）
  const [prevState, setPrevState] = useState(state);
  if (prevState !== state) {
    setPrevState(state);
    if (state?.success) {
      setEditing(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <p className="min-w-0 truncate text-[18px] font-bold text-[var(--color-text-primary-2)]">
          {initialNickname || "未设置昵称"}
        </p>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label="编辑昵称"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[var(--color-text-secondary)] transition active:scale-90"
        >
          <Pencil size={14} />
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex min-w-0 flex-1 items-center gap-2">
      <input
        name="nickname"
        type="text"
        defaultValue={initialNickname}
        maxLength={50}
        autoFocus
        required
        placeholder="1-50 个字符"
        className="h-10 min-w-0 flex-1 rounded-xl border border-[#E5E7EB] px-3 text-[15px] text-[var(--color-text-primary-2)] outline-none focus:border-[var(--color-primary)]"
      />
      <SaveButton />
      <button
        type="button"
        onClick={() => setEditing(false)}
        aria-label="取消"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[var(--color-text-secondary)]"
      >
        <X size={16} />
      </button>
      {state?.error ? (
        <p className="text-xs font-medium text-[var(--color-debt-red)]">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="保存昵称"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-white transition active:scale-90 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Check size={16} strokeWidth={3} />
      )}
    </button>
  );
}
