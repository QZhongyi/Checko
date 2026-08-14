"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/utils/supabase/types";

/**
 * 在 Client Components 中使用的 Supabase 客户端。
 * 单例缓存避免重复创建连接。
 */
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null =
  null;

export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return browserClient;
}
