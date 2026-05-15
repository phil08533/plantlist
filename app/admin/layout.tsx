import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { AdminNav } from "@/components/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <>
      <SiteHeader showAdminLink />
      <AdminNav email={user.email ?? null} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">{children}</main>
      <SiteFooter />
    </>
  );
}
