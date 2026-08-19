"use client";

import { useTransition } from "react";
import { logout } from "@/app/auth/actions";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => void logout())}
      className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-[var(--color-text-secondary)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition active:scale-95 disabled:opacity-50"
    >
      {pending ? "登出中…" : "登出"}
    </button>
  );
}
