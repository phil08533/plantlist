"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Filter, X } from "lucide-react";
import {
  PLANT_TYPES,
  SUN_LEVELS,
  WATER_LEVELS,
  SIZE_LEVELS,
  TRAIT_FLAGS,
  LABELS,
} from "@/lib/categories";

type Group = "plant_type" | "sun" | "water" | "size" | "traits";

const GROUPS: { key: Group; label: string; options: { value: string; label: string }[] }[] = [
  {
    key: "plant_type",
    label: "Type",
    options: PLANT_TYPES.map((v) => ({ value: v, label: LABELS.plant_type[v] })),
  },
  { key: "sun", label: "Sun", options: SUN_LEVELS.map((v) => ({ value: v, label: LABELS.sun[v] })) },
  {
    key: "water",
    label: "Water",
    options: WATER_LEVELS.map((v) => ({ value: v, label: LABELS.water[v] })),
  },
  {
    key: "size",
    label: "Size",
    options: SIZE_LEVELS.map((v) => ({ value: v, label: LABELS.size[v] })),
  },
  {
    key: "traits",
    label: "Traits",
    options: TRAIT_FLAGS.map((t) => ({ value: t.key, label: t.label })),
  },
];

export function PlantFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);

  const selected = useMemo(() => {
    const m: Record<Group, Set<string>> = {
      plant_type: new Set(),
      sun: new Set(),
      water: new Set(),
      size: new Set(),
      traits: new Set(),
    };
    for (const g of GROUPS) {
      const raw = sp.get(g.key);
      if (raw) raw.split(",").filter(Boolean).forEach((v) => m[g.key].add(v));
    }
    return m;
  }, [sp]);

  const q = sp.get("q") ?? "";

  function update(next: URLSearchParams) {
    router.replace(`/?${next.toString()}`, { scroll: false });
  }

  function toggle(group: Group, value: string) {
    const next = new URLSearchParams(sp.toString());
    const current = new Set(selected[group]);
    if (current.has(value)) current.delete(value);
    else current.add(value);
    if (current.size) next.set(group, [...current].join(","));
    else next.delete(group);
    update(next);
  }

  function setQuery(v: string) {
    const next = new URLSearchParams(sp.toString());
    if (v) next.set("q", v);
    else next.delete("q");
    update(next);
  }

  function clearAll() {
    update(new URLSearchParams());
  }

  const activeCount =
    Object.values(selected).reduce((n, s) => n + s.size, 0) + (q ? 1 : 0);

  const body = (
    <div className="space-y-5">
      <div>
        <label className="label">Search</label>
        <input
          className="input"
          placeholder="Name or scientific name…"
          defaultValue={q}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {GROUPS.map((g) => (
        <div key={g.key}>
          <div className="label">{g.label}</div>
          <div className="flex flex-wrap gap-2">
            {g.options.map((opt) => {
              const isOn = selected[g.key].has(opt.value);
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => toggle(g.key, opt.value)}
                  className={
                    isOn
                      ? "rounded-full bg-riverside-600 text-white px-3 py-1 text-xs font-medium"
                      : "rounded-full bg-white ring-1 ring-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                  }
                  aria-pressed={isOn}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {activeCount > 0 && (
        <button type="button" onClick={clearAll} className="btn-secondary text-sm w-full">
          Clear filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden flex items-center justify-between mb-3">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
        >
          <Filter className="h-4 w-4" />
          Filters {activeCount > 0 && <span className="badge">{activeCount}</span>}
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block sticky top-20 self-start w-64 shrink-0">
        <div className="card p-4">{body}</div>
      </aside>

      {/* Mobile sheet */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-full bg-white p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Filters</h2>
              <button onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            {body}
          </div>
        </div>
      )}
    </>
  );
}
