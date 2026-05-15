"use client";

import Link from "next/link";
import { Check, Plus } from "lucide-react";
import type { Plant } from "@/lib/plants";
import { publicImageUrl } from "@/lib/plants";
import { LABELS } from "@/lib/categories";
import { useSelection } from "./SelectionProvider";

export function PlantCard({ plant, supabaseUrl }: { plant: Plant; supabaseUrl: string }) {
  const { has, toggle } = useSelection();
  const selected = has(plant.id);
  const img = publicImageUrl(supabaseUrl, plant.image_path);

  return (
    <div className="card overflow-hidden flex flex-col group">
      <Link href={`/plants/${plant.id}`} className="block aspect-square bg-neutral-100 relative overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={plant.name}
            className="h-full w-full object-cover group-hover:scale-[1.02] transition"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-neutral-400 text-sm">
            No image
          </div>
        )}
        <span className="absolute top-2 left-2 badge-neutral capitalize">
          {LABELS.plant_type[plant.plant_type]}
        </span>
      </Link>
      <div className="p-3 flex-1 flex flex-col gap-2">
        <div>
          <Link href={`/plants/${plant.id}`} className="font-medium leading-tight hover:underline">
            {plant.name}
          </Link>
          {plant.scientific_name && (
            <div className="text-xs italic text-neutral-500">{plant.scientific_name}</div>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {plant.deer_resistant && <span className="badge">Deer resistant</span>}
          {plant.native && <span className="badge">Native</span>}
          {plant.flowering && <span className="badge">Flowering</span>}
          {plant.low_maintenance && <span className="badge">Low maintenance</span>}
          {plant.sun && <span className="badge-neutral">{LABELS.sun[plant.sun]}</span>}
          {plant.size && <span className="badge-neutral">{LABELS.size[plant.size]}</span>}
        </div>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-sm text-neutral-600">{plant.price_range ?? ""}</span>
          <button
            type="button"
            onClick={() => toggle(plant.id)}
            className={selected ? "btn-primary" : "btn-secondary"}
            aria-pressed={selected}
          >
            {selected ? (
              <>
                <Check className="h-4 w-4" /> Added
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
