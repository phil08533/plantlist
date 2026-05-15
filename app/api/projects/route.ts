import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const Body = z.object({
  customer_name: z.string().min(1),
  customer_address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  items: z
    .array(
      z.object({
        plant_id: z.string().uuid(),
        quantity: z.number().int().positive(),
        note: z.string().nullable().optional(),
      }),
    )
    .min(1),
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { items, ...project } = parsed.data;
  const { data: created, error } = await supabase
    .from("projects")
    .insert({ ...project, created_by: user.id })
    .select("id")
    .single();
  if (error || !created) {
    return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 500 });
  }

  const { error: itemsError } = await supabase.from("project_items").insert(
    items.map((it) => ({
      project_id: created.id,
      plant_id: it.plant_id,
      quantity: it.quantity,
      note: it.note ?? null,
    })),
  );
  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json({ id: created.id });
}
