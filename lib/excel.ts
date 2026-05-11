import * as XLSX from "xlsx";
import { z } from "zod";
import {
  PLANT_TYPES,
  SUN_LEVELS,
  WATER_LEVELS,
  SIZE_LEVELS,
  GROWTH_SPEEDS,
} from "./categories";

const optStr = z.preprocess((v) => (v === "" || v == null ? undefined : String(v)), z.string().optional());
const optNum = z.preprocess(
  (v) => (v === "" || v == null ? undefined : Number(v)),
  z.number().finite().optional(),
);
const optBool = z.preprocess((v) => {
  if (v === "" || v == null) return undefined;
  if (typeof v === "boolean") return v;
  const s = String(v).trim().toLowerCase();
  if (["true", "yes", "y", "1"].includes(s)) return true;
  if (["false", "no", "n", "0"].includes(s)) return false;
  return v;
}, z.boolean().optional());

export const PlantRowSchema = z.object({
  name: z.string().min(1, "name is required"),
  scientific_name: optStr,
  plant_type: z.enum(PLANT_TYPES),
  sun: z.enum(SUN_LEVELS).optional(),
  water: z.enum(WATER_LEVELS).optional(),
  size: z.enum(SIZE_LEVELS).optional(),
  mature_height_ft: optNum,
  mature_width_ft: optNum,
  growth_speed: z.enum(GROWTH_SPEEDS).optional(),
  hardy_zone_min: optNum,
  hardy_zone_max: optNum,
  deer_resistant: optBool,
  native: optBool,
  flowering: optBool,
  low_maintenance: optBool,
  price_range: optStr,
  notes: optStr,
  image_url: optStr,
});

export type PlantRow = z.infer<typeof PlantRowSchema>;

export const TEMPLATE_COLUMNS = [
  "name",
  "scientific_name",
  "plant_type",
  "sun",
  "water",
  "size",
  "mature_height_ft",
  "mature_width_ft",
  "growth_speed",
  "hardy_zone_min",
  "hardy_zone_max",
  "deer_resistant",
  "native",
  "flowering",
  "low_maintenance",
  "price_range",
  "notes",
  "image_url",
] as const;

export function buildTemplateWorkbook(): XLSX.WorkBook {
  const sample = [
    {
      name: "Green Giant Arborvitae",
      scientific_name: "Thuja standishii x plicata",
      plant_type: "evergreen",
      sun: "full",
      water: "medium",
      size: "large",
      mature_height_ft: 40,
      mature_width_ft: 12,
      growth_speed: "fast",
      hardy_zone_min: 5,
      hardy_zone_max: 8,
      deer_resistant: true,
      native: false,
      flowering: false,
      low_maintenance: true,
      price_range: "$$",
      notes: "Excellent fast-growing privacy screen.",
      image_url: "",
    },
  ];
  const ws = XLSX.utils.json_to_sheet(sample, { header: [...TEMPLATE_COLUMNS] });
  ws["!cols"] = TEMPLATE_COLUMNS.map(() => ({ wch: 18 }));

  const instructions = [
    ["Column", "Required", "Allowed values / format"],
    ["name", "yes", "Free text"],
    ["scientific_name", "no", "Free text (italicized on site)"],
    ["plant_type", "yes", PLANT_TYPES.join(" | ")],
    ["sun", "no", SUN_LEVELS.join(" | ")],
    ["water", "no", WATER_LEVELS.join(" | ")],
    ["size", "no", SIZE_LEVELS.join(" | ")],
    ["mature_height_ft", "no", "Number, in feet"],
    ["mature_width_ft", "no", "Number, in feet"],
    ["growth_speed", "no", GROWTH_SPEEDS.join(" | ")],
    ["hardy_zone_min", "no", "USDA zone number, e.g. 5"],
    ["hardy_zone_max", "no", "USDA zone number, e.g. 8"],
    ["deer_resistant", "no", "TRUE / FALSE"],
    ["native", "no", "TRUE / FALSE"],
    ["flowering", "no", "TRUE / FALSE"],
    ["low_maintenance", "no", "TRUE / FALSE"],
    ["price_range", "no", "Free text e.g. $, $$, $$$"],
    ["notes", "no", "Free text"],
    ["image_url", "no", "Public URL the server will download & store"],
  ];
  const wsi = XLSX.utils.aoa_to_sheet(instructions);
  wsi["!cols"] = [{ wch: 20 }, { wch: 10 }, { wch: 60 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "plants");
  XLSX.utils.book_append_sheet(wb, wsi, "instructions");
  return wb;
}

export function downloadTemplate() {
  const wb = buildTemplateWorkbook();
  XLSX.writeFile(wb, "riverside-plants-template.xlsx");
}

export type ParsedRow = {
  row: number;
  raw: Record<string, unknown>;
  data?: PlantRow;
  errors?: { field: string; message: string }[];
};

export function parseWorkbook(buf: ArrayBuffer): ParsedRow[] {
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  return rows.map((raw, i) => {
    const parsed = PlantRowSchema.safeParse(raw);
    if (parsed.success) {
      return { row: i + 2, raw, data: parsed.data };
    }
    return {
      row: i + 2,
      raw,
      errors: parsed.error.issues.map((e) => ({
        field: e.path.join(".") || "(row)",
        message: e.message,
      })),
    };
  });
}
