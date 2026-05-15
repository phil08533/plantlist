import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { SelectionProvider } from "@/components/SelectionProvider";
import { createClient } from "@/lib/supabase/server";
import { BuilderClient } from "./BuilderClient";

export const dynamic = "force-dynamic";

export default async function BuilderPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: allPlants } = await supabase
    .from("plants")
    .select("*")
    .eq("status", "active")
    .order("name");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  return (
    <SelectionProvider>
      <SiteHeader showAdminLink={!!user} />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
        <BuilderClient
          allPlants={allPlants ?? []}
          supabaseUrl={supabaseUrl}
          canSave={!!user}
        />
      </main>
      <SiteFooter />
    </SelectionProvider>
  );
}
