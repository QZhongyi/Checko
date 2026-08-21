"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  updateVisibilityAction,
  type ProfileActionState,
} from "@/app/actions/profile";

/**
 * 资料可见性三档切换（仅自己 / 好友可见 / 公开）。
 * 单表单承载三个选项（统一 pending，连续点击不会并发提交）；
 * 点击即乐观选中；action 完成后在 useEffect 中确认提交值或回滚到
 * 上次服务端确认值；新提交进行中不显示旧提示。
 */
const OPTIONS: {
  value: "private" | "friends" | "public";
  label: string;
  hint: string;
}[] = [
  { value: "private", label: "仅自己", hint: "好友也搜不到你" },
  { value: "friends", label: "好友可见", hint: "默认" },
  { value: "public", label: "公开", hint: "所有用户可搜到" },
];

export function VisibilitySwitch({
  initialVisibility,
}: {
  initialVisibility: "private" | "friends" | "public";
}) {
  const [state, formAction, isPending] = useActionState<
    ProfileActionState,
    FormData
  >(updateVisibilityAction, undefined);

  const [selected, setSelected] = useState(initialVisibility);
  const [confirmed, setConfirmed] = useState(initialVisibility);
  const [prevState, setPrevState] = useState(state);

  // 只在收到新的 action state 时确认（成功）或回滚（失败）（渲染期调整模式）；
  // 失败后再次提交新选项不会触发旧 state 回滚，pending 期间隐藏旧提示
  if (state !== prevState) {
    setPrevState(state);
    if (state?.success && state.visibility) {
      setConfirmed(state.visibility);
      setSelected(state.visibility);
    } else if (state?.error) {
      setSelected(confirmed);
    }
  }

  return (
    <div className="mt-3">
      <form action={formAction}>
        <div className="flex rounded-2xl bg-[#F3F4F6] p-1">
          {OPTIONS.map((option) => (
            <VisibilityButton
              key={option.value}
              value={option.value}
              label={option.label}
              hint={option.hint}
              selected={selected === option.value}
              onSelect={setSelected}
            />
          ))}
        </div>
      </form>
      {state?.error && !isPending ? (
        <p className="mt-2 text-xs font-medium text-[var(--color-debt-red)]">
          {state.error}
        </p>
      ) : null}
      {state?.success && !isPending ? (
        <p className="mt-2 text-xs font-medium text-[var(--color-primary)]">
          已更新
        </p>
      ) : null}
    </div>
  );
}

function VisibilityButton({
  value,
  label,
  hint,
  selected,
  onSelect,
}: {
  value: "private" | "friends" | "public";
  label: string;
  hint: string;
  selected: boolean;
  onSelect: (v: "private" | "friends" | "public") => void;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="visibility"
      value={value}
      disabled={pending}
      title={hint}
      aria-pressed={selected}
      onClick={() => onSelect(value)}
      className={`flex-1 rounded-xl py-2 text-[14px] font-bold transition disabled:cursor-not-allowed ${
        selected
          ? "bg-white text-[var(--color-primary)] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
          : "text-[var(--color-text-secondary)]"
      }`}
    >
      {label}
    </button>
  );
}
