import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PlantRowSchema, type PlantRow } from "@/lib/excel";

export const runtime = "nodejs";

const Body = z.object({ rows: z.array(PlantRowSchema).min(1) });

export async function POST(req: Request) {
  // Auth — only authenticated employees can import.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }

  const errors: string[] = [];
  const inserts = await Promise.all(
    parsed.data.rows.map(async (row) => {
      const image_path = await maybeFetchImage(admin, row.image_url, errors);
      const insert = rowToInsert(row, user.id, image_path);
      return insert;
    }),
  );

  const { error, count } = await admin
    .from("plants")
    .insert(inserts, { count: "exact" });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ inserted: count ?? inserts.length, errors });
}

function rowToInsert(row: PlantRow, userId: string, image_path: string | null) {
  return {
    name: row.name,
    scientific_name: row.scientific_name ?? null,
    plant_type: row.plant_type,
    sun: row.sun ?? null,
    water: row.water ?? null,
    size: row.size ?? null,
    mature_height_ft: row.mature_height_ft ?? null,
    mature_width_ft: row.mature_width_ft ?? null,
    growth_speed: row.growth_speed ?? null,
    hardy_zone_min: row.hardy_zone_min ?? null,
    hardy_zone_max: row.hardy_zone_max ?? null,
    deer_resistant: row.deer_resistant ?? false,
    native: row.native ?? false,
    flowering: row.flowering ?? false,
    low_maintenance: row.low_maintenance ?? false,
    price_range: row.price_range ?? null,
    notes: row.notes ?? null,
    image_path,
    status: "active" as const,
    created_by: userId,
  };
}

async function maybeFetchImage(
  admin: ReturnType<typeof createAdminClient>,
  url: string | undefined,
  errors: string[],
): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      errors.push(`Image fetch failed for ${url}: ${res.status}`);
      return null;
    }
    const ct = res.headers.get("content-type") ?? "image/jpeg";
    if (!ct.startsWith("image/")) {
      errors.push(`URL did not return an image: ${url}`);
      return null;
    }
    const ext = ct.split("/")[1].split(";")[0] || "jpg";
    const path = `plants/${crypto.randomUUID()}.${ext}`;
    const buf = Buffer.from(await res.arrayBuffer());
    const { error } = await admin.storage
      .from("plant-images")
      .upload(path, buf, { contentType: ct, upsert: false });
    if (error) {
      errors.push(`Image upload failed for ${url}: ${error.message}`);
      return null;
    }
    return path;
  } catch (e) {
    errors.push(`Image fetch error for ${url}: ${(e as Error).message}`);
    return null;
  }
}
