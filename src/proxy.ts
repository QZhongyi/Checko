import { updateSession } from "@/utils/supabase/proxy";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 proxy（原 middleware，已重命名）。
 * 在每个匹配请求前刷新 Supabase session。
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // 排除静态资源 / 图片 / favicon，避免每个静态请求都跑一次 session 刷新
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
