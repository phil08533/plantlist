import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Plant } from "@/lib/plants";
import { PlantForm } from "@/components/PlantForm";

export const dynamic = "force-dynamic";

export default async function EditPlantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("plants").select("*").eq("id", id).maybeSingle();
  if (error || !data) notFound();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-4">Edit plant</h1>
      <PlantForm initial={data as Plant} supabaseUrl={supabaseUrl} />
    </div>
  );
}
