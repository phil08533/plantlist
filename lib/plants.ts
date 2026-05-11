import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  PlantType,
  SunLevel,
  WaterLevel,
  SizeLevel,
  GrowthSpeed,
  TraitKey,
} from "./categories";

export type Plant = {
  id: string;
  name: string;
  scientific_name: string | null;
  plant_type: PlantType;
  sun: SunLevel | null;
  water: WaterLevel | null;
  size: SizeLevel | null;
  mature_height_ft: number | null;
  mature_width_ft: number | null;
  growth_speed: GrowthSpeed | null;
  hardy_zone_min: number | null;
  hardy_zone_max: number | null;
  deer_resistant: boolean;
  native: boolean;
  flowering: boolean;
  low_maintenance: boolean;
  price_range: string | null;
  notes: string | null;
  image_path: string | null;
  status: "active" | "disabled";
  created_at: string;
  updated_at: string;
};

export type PlantFilters = {
  q?: string;
  plant_type?: PlantType[];
  sun?: SunLevel[];
  water?: WaterLevel[];
  size?: SizeLevel[];
  traits?: TraitKey[];
  hardy_zone?: number;
  includeDisabled?: boolean;
};

export function parseFilters(searchParams: Record<string, string | string[] | undefined>): PlantFilters {
  const arr = (k: string) => {
    const v = searchParams[k];
    if (!v) return undefined;
    return (Array.isArray(v) ? v : v.split(",")).filter(Boolean);
  };
  const num = (k: string) => {
    const v = searchParams[k];
    if (!v || Array.isArray(v)) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  return {
    q: typeof searchParams.q === "string" ? searchParams.q : undefined,
    plant_type: arr("plant_type") as PlantType[] | undefined,
    sun: arr("sun") as SunLevel[] | undefined,
    water: arr("water") as WaterLevel[] | undefined,
    size: arr("size") as SizeLevel[] | undefined,
    traits: arr("traits") as TraitKey[] | undefined,
    hardy_zone: num("hardy_zone"),
  };
}

export async function fetchPlants(
  supabase: SupabaseClient,
  filters: PlantFilters,
): Promise<Plant[]> {
  let q = supabase.from("plants").select("*").order("name");
  if (!filters.includeDisabled) q = q.eq("status", "active");
  if (filters.q) q = q.or(`name.ilike.%${filters.q}%,scientific_name.ilike.%${filters.q}%`);
  if (filters.plant_type?.length) q = q.in("plant_type", filters.plant_type);
  if (filters.sun?.length) q = q.in("sun", filters.sun);
  if (filters.water?.length) q = q.in("water", filters.water);
  if (filters.size?.length) q = q.in("size", filters.size);
  if (filters.traits?.length) {
    for (const t of filters.traits) q = q.eq(t, true);
  }
  if (filters.hardy_zone !== undefined) {
    q = q.lte("hardy_zone_min", filters.hardy_zone).gte("hardy_zone_max", filters.hardy_zone);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Plant[];
}

export function publicImageUrl(supabaseUrl: string, path: string | null | undefined): string | null {
  if (!path) return null;
  return `${supabaseUrl}/storage/v1/object/public/plant-images/${path}`;
}
