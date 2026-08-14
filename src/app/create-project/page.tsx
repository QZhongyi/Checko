import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { PhoneFrame } from "@/components/phone-frame";
import { CreateProjectForm } from "./create-project-form";

export default async function CreateProjectPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <PhoneFrame variant="home">
      <main className="flex flex-1 flex-col px-5 pb-6 pt-6">
        {/* 顶部：返回 + 标题 */}
        <header className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="返回首页"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.025)]"
          >
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-[20px] font-bold leading-7 text-[var(--color-text-primary-2)]">
            创建项目
          </h1>
        </header>

        {/* 表单卡片 */}
        <section className="mt-5 flex-1 rounded-[30px] bg-white px-5 pb-6 pt-8 shadow-[0_8px_30px_rgba(0,0,0,0.035)]">
          <CreateProjectForm />
        </section>
      </main>
    </PhoneFrame>
  );
}
