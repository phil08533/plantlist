"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Minus, Plus, Save, Search, Trash2 } from "lucide-react";
import { toPng } from "html-to-image";
import type { Plant } from "@/lib/plants";
import { publicImageUrl } from "@/lib/plants";
import { useSelection } from "@/components/SelectionProvider";
import { SelectionExport } from "@/components/SelectionExport";

export function BuilderClient({
  allPlants,
  supabaseUrl,
  canSave,
  initialCustomer,
  initialAddress,
  initialNotes,
}: {
  allPlants: Plant[];
  supabaseUrl: string;
  canSave: boolean;
  initialCustomer?: string;
  initialAddress?: string;
  initialNotes?: string;
}) {
  const router = useRouter();
  const { items, remove, setQuantity, setNote, add, clear } = useSelection();
  const [customer, setCustomer] = useState(initialCustomer ?? "");
  const [address, setAddress] = useState(initialAddress ?? "");
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const byId = useMemo(() => new Map(allPlants.map((p) => [p.id, p])), [allPlants]);

  const lineItems = items
    .map((it) => ({ item: it, plant: byId.get(it.id) }))
    .filter((x): x is { item: typeof items[number]; plant: Plant } => !!x.plant);

  const searchResults = search.trim()
    ? allPlants
        .filter((p) => !items.some((i) => i.id === p.id))
        .filter((p) => {
          const s = search.toLowerCase();
          return (
            p.name.toLowerCase().includes(s) ||
            (p.scientific_name?.toLowerCase() ?? "").includes(s)
          );
        })
        .slice(0, 8)
    : [];

  async function doSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customer_name: customer || "Untitled",
          customer_address: address || null,
          notes: notes || null,
          items: lineItems.map(({ item }) => ({
            plant_id: item.id,
            quantity: item.quantity,
            note: item.note ?? null,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      router.push(`/builder/${json.id}`);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function downloadImage() {
    if (!exportRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(exportRef.current, { pixelRatio: 2, backgroundColor: "#ffffff" });
      const a = document.createElement("a");
      const safeName = (customer || "plant-list").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      a.download = `${safeName}-${new Date().toISOString().slice(0, 10)}.png`;
      a.href = dataUrl;
      a.click();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Plant list</h1>
        {items.length > 0 && (
          <button onClick={() => clear()} className="btn-secondary text-sm">
            <Trash2 className="h-4 w-4" /> Clear
          </button>
        )}
      </div>

      <div className="card p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Customer name</label>
          <input className="input" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Smith Residence" />
        </div>
        <div>
          <label className="label">Address</label>
          <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Notes</label>
          <textarea className="input min-h-[70px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-4 w-4 text-neutral-400" />
          <input
            className="input"
            placeholder="Add another plant…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {searchResults.length > 0 && (
          <ul className="rounded-xl ring-1 ring-neutral-200 divide-y divide-neutral-200">
            {searchResults.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-center justify-between gap-2"
                  onClick={() => { add(p.id); setSearch(""); }}
                >
                  <span>
                    {p.name}
                    {p.scientific_name && <span className="text-neutral-500 italic"> — {p.scientific_name}</span>}
                  </span>
                  <Plus className="h-4 w-4 text-neutral-400" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card divide-y divide-neutral-200">
        {lineItems.length === 0 && (
          <div className="p-10 text-center text-neutral-500">
            No plants selected. Browse the catalog and tap “Add”, or use the search above.
          </div>
        )}
        {lineItems.map(({ item, plant }) => {
          const img = publicImageUrl(supabaseUrl, plant.image_path);
          return (
            <div key={plant.id} className="p-3 flex gap-3 items-start">
              <div className="h-16 w-16 rounded-lg bg-neutral-100 overflow-hidden shrink-0">
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{plant.name}</div>
                {plant.scientific_name && (
                  <div className="text-xs italic text-neutral-500 truncate">{plant.scientific_name}</div>
                )}
                <input
                  className="input mt-2"
                  placeholder="Note (size, placement…)"
                  value={item.note ?? ""}
                  onChange={(e) => setNote(plant.id, e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  className="rounded-lg ring-1 ring-neutral-300 h-8 w-8 flex items-center justify-center"
                  onClick={() => setQuantity(plant.id, item.quantity - 1)}
                  aria-label="Decrease"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  className="input !w-14 text-center"
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => setQuantity(plant.id, Number(e.target.value || 1))}
                />
                <button
                  type="button"
                  className="rounded-lg ring-1 ring-neutral-300 h-8 w-8 flex items-center justify-center"
                  onClick={() => setQuantity(plant.id, item.quantity + 1)}
                  aria-label="Increase"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="rounded-lg p-1 text-red-600 hover:bg-red-50"
                  onClick={() => remove(plant.id)}
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap justify-end gap-2 sticky bottom-3">
        <button
          className="btn-secondary"
          onClick={downloadImage}
          disabled={lineItems.length === 0 || downloading}
        >
          <Download className="h-4 w-4" />
          {downloading ? "Rendering…" : "Download PNG"}
        </button>
        {canSave && (
          <button
            className="btn-primary"
            onClick={doSave}
            disabled={lineItems.length === 0 || saving}
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save project"}
          </button>
        )}
      </div>

      {/* Off-screen export target */}
      <div className="fixed -left-[10000px] top-0" aria-hidden>
        <SelectionExport
          ref={exportRef}
          customer={customer || "Plant list"}
          address={address}
          notes={notes}
          items={lineItems.map(({ item, plant }) => ({
            name: plant.name,
            scientific: plant.scientific_name,
            quantity: item.quantity,
            note: item.note ?? null,
          }))}
        />
      </div>
    </div>
  );
}
