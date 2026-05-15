import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { publicImageUrl, type Plant } from "@/lib/plants";
import { LABELS } from "@/lib/categories";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { SelectionProvider } from "@/components/SelectionProvider";
import { SelectionFab } from "@/components/SelectionFab";
import { AddToListButton } from "./AddToListButton";

export const dynamic = "force-dynamic";

export default async function PlantDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("plants").select("*").eq("id", id).maybeSingle();
  if (error || !data) notFound();
  const plant = data as Plant;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const img = publicImageUrl(supabaseUrl, plant.image_path);

  const facts: [string, string | null][] = [
    ["Type", LABELS.plant_type[plant.plant_type]],
    ["Sun", plant.sun ? LABELS.sun[plant.sun] : null],
    ["Water", plant.water ? LABELS.water[plant.water] : null],
    ["Size", plant.size ? LABELS.size[plant.size] : null],
    [
      "Mature size",
      plant.mature_height_ft || plant.mature_width_ft
        ? `${plant.mature_height_ft ?? "?"} ft H × ${plant.mature_width_ft ?? "?"} ft W`
        : null,
    ],
    ["Growth speed", plant.growth_speed ? LABELS.growth_speed[plant.growth_speed] : null],
    [
      "Hardy zones",
      plant.hardy_zone_min || plant.hardy_zone_max
        ? `${plant.hardy_zone_min ?? "?"}–${plant.hardy_zone_max ?? "?"}`
        : null,
    ],
    ["Price range", plant.price_range],
  ];

  return (
    <SelectionProvider>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-square overflow-hidden rounded-2xl bg-neutral-100">
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img} alt={plant.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-neutral-400">
                No image
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{plant.name}</h1>
            {plant.scientific_name && (
              <div className="italic text-neutral-500 mt-0.5">{plant.scientific_name}</div>
            )}
            <div className="mt-3 flex flex-wrap gap-1">
              {plant.deer_resistant && <span className="badge">Deer resistant</span>}
              {plant.native && <span className="badge">Native</span>}
              {plant.flowering && <span className="badge">Flowering</span>}
              {plant.low_maintenance && <span className="badge">Low maintenance</span>}
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {facts
                .filter((f): f is [string, string] => f[1] !== null)
                .map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-neutral-500">{k}</dt>
                    <dd className="text-neutral-900">{v}</dd>
                  </div>
                ))}
            </dl>
            {plant.notes && (
              <div className="mt-6">
                <h2 className="font-medium text-neutral-800">Notes</h2>
                <p className="mt-1 text-sm text-neutral-700 whitespace-pre-wrap">{plant.notes}</p>
              </div>
            )}
            <div className="mt-6">
              <AddToListButton id={plant.id} />
            </div>
          </div>
        </div>
      </main>
      <SelectionFab />
      <SiteFooter />
    </SelectionProvider>
  );
}
