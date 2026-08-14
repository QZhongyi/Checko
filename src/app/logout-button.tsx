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
      className="rounded border border-zinc-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-zinc-700"
    >
      {pending ? "登出中…" : "登出"}
    </button>
  );
}
