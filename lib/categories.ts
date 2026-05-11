export const PLANT_TYPES = [
  "tree",
  "bush",
  "flower",
  "grass",
  "evergreen",
  "perennial",
] as const;
export type PlantType = (typeof PLANT_TYPES)[number];

export const SUN_LEVELS = ["full", "partial", "shade"] as const;
export type SunLevel = (typeof SUN_LEVELS)[number];

export const WATER_LEVELS = ["low", "medium", "high"] as const;
export type WaterLevel = (typeof WATER_LEVELS)[number];

export const SIZE_LEVELS = ["small", "medium", "large"] as const;
export type SizeLevel = (typeof SIZE_LEVELS)[number];

export const GROWTH_SPEEDS = ["slow", "medium", "fast"] as const;
export type GrowthSpeed = (typeof GROWTH_SPEEDS)[number];

export const TRAIT_FLAGS = [
  { key: "deer_resistant", label: "Deer resistant" },
  { key: "native", label: "Native" },
  { key: "flowering", label: "Flowering" },
  { key: "low_maintenance", label: "Low maintenance" },
] as const;
export type TraitKey = (typeof TRAIT_FLAGS)[number]["key"];

export const LABELS = {
  plant_type: {
    tree: "Tree",
    bush: "Bush / Shrub",
    flower: "Flower",
    grass: "Ornamental Grass",
    evergreen: "Evergreen",
    perennial: "Perennial",
  } satisfies Record<PlantType, string>,
  sun: { full: "Full sun", partial: "Partial shade", shade: "Shade" } satisfies Record<SunLevel, string>,
  water: { low: "Low water", medium: "Medium water", high: "High water" } satisfies Record<WaterLevel, string>,
  size: { small: "Small", medium: "Medium", large: "Large" } satisfies Record<SizeLevel, string>,
  growth_speed: { slow: "Slow", medium: "Medium", fast: "Fast" } satisfies Record<GrowthSpeed, string>,
};
