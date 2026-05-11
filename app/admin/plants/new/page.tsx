import { PlantForm } from "@/components/PlantForm";

export default function NewPlantPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-4">Add plant</h1>
      <PlantForm supabaseUrl={supabaseUrl} />
    </div>
  );
}
