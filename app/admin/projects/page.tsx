import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, customer_name, customer_address, created_at, project_items(count)")
    .order("created_at", { ascending: false });
  const projects = (data ?? []) as Array<{
    id: string;
    customer_name: string;
    customer_address: string | null;
    created_at: string;
    project_items: { count: number }[];
  }>;

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-4">Saved lists</h1>

      {error && <p className="text-sm text-red-600">{error.message}</p>}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600 text-left">
            <tr>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2 hidden sm:table-cell">Address</th>
              <th className="px-4 py-2">Plants</th>
              <th className="px-4 py-2">Saved</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-t border-neutral-200">
                <td className="px-4 py-2">
                  <Link href={`/builder/${p.id}`} className="font-medium hover:underline">
                    {p.customer_name}
                  </Link>
                </td>
                <td className="px-4 py-2 hidden sm:table-cell text-neutral-600">
                  {p.customer_address ?? ""}
                </td>
                <td className="px-4 py-2">{p.project_items?.[0]?.count ?? 0}</td>
                <td className="px-4 py-2 text-neutral-600">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-neutral-500">
                  No saved lists yet. Build one from the{" "}
                  <Link href="/builder" className="text-riverside-700 underline">
                    builder
                  </Link>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
