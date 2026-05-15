import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Plant } from "@/lib/plants";
import { LABELS } from "@/lib/categories";
import { AdminRowActions } from "./AdminRowActions";

export const dynamic = "force-dynamic";

export default async function AdminPlantsList({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  let q = supabase.from("plants").select("*").order("name");
  if (sp.q) q = q.or(`name.ilike.%${sp.q}%,scientific_name.ilike.%${sp.q}%`);
  if (sp.status === "active") q = q.eq("status", "active");
  if (sp.status === "disabled") q = q.eq("status", "disabled");
  const { data, error } = await q;
  const plants = (data ?? []) as Plant[];

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Plants</h1>
          <p className="text-sm text-neutral-500">
            {plants.length} {plants.length === 1 ? "plant" : "plants"}
          </p>
        </div>
        <Link href="/admin/plants/new" className="btn-primary">
          <Plus className="h-4 w-4" /> Add plant
        </Link>
      </div>

      <form className="flex flex-wrap gap-2 mb-4" action="/admin">
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search…"
          className="input max-w-xs"
        />
        <select name="status" defaultValue={sp.status ?? ""} className="input max-w-[10rem]">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
        <button className="btn-secondary">Filter</button>
      </form>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600 text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2 hidden sm:table-cell">Type</th>
              <th className="px-4 py-2 hidden md:table-cell">Traits</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plants.map((p) => (
              <tr key={p.id} className="border-t border-neutral-200">
                <td className="px-4 py-2">
                  <Link href={`/admin/plants/${p.id}`} className="font-medium hover:underline">
                    {p.name}
                  </Link>
                  {p.scientific_name && (
                    <div className="text-xs italic text-neutral-500">{p.scientific_name}</div>
                  )}
                </td>
                <td className="px-4 py-2 hidden sm:table-cell capitalize">
                  {LABELS.plant_type[p.plant_type]}
                </td>
                <td className="px-4 py-2 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {p.deer_resistant && <span className="badge">Deer</span>}
                    {p.native && <span className="badge">Native</span>}
                    {p.flowering && <span className="badge">Flowering</span>}
                    {p.low_maintenance && <span className="badge">Low maint.</span>}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <span className={p.status === "active" ? "badge" : "badge-neutral"}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <AdminRowActions id={p.id} status={p.status} />
                </td>
              </tr>
            ))}
            {plants.length === 0 && !error && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-neutral-500">
                  No plants. <Link href="/admin/plants/new" className="text-riverside-700 underline">Add one</Link>{" "}
                  or <Link href="/admin/import" className="text-riverside-700 underline">bulk-import from Excel</Link>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
