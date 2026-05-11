import { createClient } from "@/lib/supabase/server";
import { fetchPlants, parseFilters } from "@/lib/plants";
import { PlantCard } from "@/components/PlantCard";
import { PlantFilters } from "@/components/PlantFilters";
import { SelectionProvider } from "@/components/SelectionProvider";
import { SelectionFab } from "@/components/SelectionFab";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let plants: Awaited<ReturnType<typeof fetchPlants>> = [];
  let error: string | null = null;
  try {
    plants = await fetchPlants(supabase, filters);
  } catch (e) {
    error = (e as Error).message;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  return (
    <SelectionProvider>
      <SiteHeader showAdminLink={!!user} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Plant Catalog</h1>
          <p className="text-neutral-600 text-sm mt-1">
            Plants we commonly use at Riverside Lawncare. Tap to add to your list.
          </p>
        </div>

        <div className="flex gap-6">
          <PlantFilters />
          <div className="flex-1 min-w-0">
            {error && (
              <div className="card p-6 text-sm text-red-700 bg-red-50 ring-red-200">
                Could not load plants: {error}.
                <div className="mt-1 text-red-700/80">
                  Make sure <code>.env.local</code> has your Supabase URL + anon key and
                  that <code>supabase/schema.sql</code> has been run.
                </div>
              </div>
            )}
            {!error && plants.length === 0 && (
              <div className="card p-10 text-center text-neutral-600">
                <p className="font-medium text-neutral-800">No plants yet.</p>
                <p className="text-sm mt-1">
                  Log in as staff and add plants — or upload an Excel sheet from{" "}
                  <code>/admin/import</code>.
                </p>
              </div>
            )}
            {plants.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {plants.map((p) => (
                  <PlantCard key={p.id} plant={p} supabaseUrl={supabaseUrl} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <SelectionFab />
      <SiteFooter />
    </SelectionProvider>
  );
}
