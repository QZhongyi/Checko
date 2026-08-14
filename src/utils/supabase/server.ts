import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/utils/supabase/types";

/**
 * 在 Server Components / Server Actions / Route Handlers 中使用的 Supabase 客户端。
 * 从 Next.js 的 cookies() 读取 session 并写回刷新后的 cookie。
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // 在 Server Component（只读 cookieStore）里 set 会被忽略；proxy.ts 会负责刷新。
            // 真正需要写 cookie 的场景（Server Action）会用能写的 cookieStore。
          }
        },
      },
    },
  );
}
