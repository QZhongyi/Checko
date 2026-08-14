import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/utils/supabase/types";

/**
 * 在 Next.js 16 proxy.ts 中刷新 Supabase session。
 * 每次请求把过期 access_token 换新并写回 cookie。
 *
 * Next.js 16 把 middleware.ts 重命名为 proxy.ts（见
 * node_modules/next/dist/docs/.../middleware.md）；函数名也改为 proxy。
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 重要：getUser() 会触发 token 刷新。不要用 getSession() —— 那只是读 cookie，不刷新。
  // 安全决策（路由保护等）应基于 getUser() 的结果。
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 当前不做路由级保护（最小脚手架），路由保护放在各页面的 Server Component 里。
  // 留 user 在这里是为了后续加 protected/public 路由表时直接用。
  void user;

  return supabaseResponse;
}
