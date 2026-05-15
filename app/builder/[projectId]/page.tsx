import { notFound, redirect } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { SelectionProvider } from "@/components/SelectionProvider";
import { createClient } from "@/lib/supabase/server";
import { BuilderHydrator } from "./BuilderHydrator";
import { BuilderClient } from "../BuilderClient";

export const dynamic = "force-dynamic";

export default async function SavedProject({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();
  if (!project) notFound();

  const { data: items } = await supabase
    .from("project_items")
    .select("plant_id, quantity, note")
    .eq("project_id", projectId);

  const { data: allPlants } = await supabase
    .from("plants")
    .select("*")
    .order("name");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  return (
    <SelectionProvider>
      <SiteHeader showAdminLink />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
        <BuilderHydrator
          items={(items ?? []).map((i) => ({
            id: i.plant_id,
            quantity: i.quantity,
            note: i.note ?? undefined,
          }))}
        />
        <BuilderClient
          allPlants={allPlants ?? []}
          supabaseUrl={supabaseUrl}
          canSave
          initialCustomer={project.customer_name}
          initialAddress={project.customer_address ?? ""}
          initialNotes={project.notes ?? ""}
        />
      </main>
      <SiteFooter />
    </SelectionProvider>
  );
}
