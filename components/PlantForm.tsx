"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Save } from "lucide-react";
import {
  PLANT_TYPES,
  SUN_LEVELS,
  WATER_LEVELS,
  SIZE_LEVELS,
  GROWTH_SPEEDS,
  LABELS,
} from "@/lib/categories";
import { createClient } from "@/lib/supabase/client";
import { publicImageUrl, type Plant } from "@/lib/plants";
import { ImageUpload } from "./ImageUpload";

type FormValues = Omit<Plant, "id" | "created_at" | "updated_at"> & { id?: string };

const empty: FormValues = {
  name: "",
  scientific_name: null,
  plant_type: "tree",
  sun: null,
  water: null,
  size: null,
  mature_height_ft: null,
  mature_width_ft: null,
  growth_speed: null,
  hardy_zone_min: null,
  hardy_zone_max: null,
  deer_resistant: false,
  native: false,
  flowering: false,
  low_maintenance: false,
  price_range: null,
  notes: null,
  image_path: null,
  status: "active",
};

export function PlantForm({
  initial,
  supabaseUrl,
}: {
  initial?: Plant;
  supabaseUrl: string;
}) {
  const router = useRouter();
  const [v, setV] = useState<FormValues>(initial ?? empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormValues>(k: K, val: FormValues[K]) {
    setV((prev) => ({ ...prev, [k]: val }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const payload = { ...v };
    if (!payload.name.trim()) {
      setError("Name is required");
      setSaving(false);
      return;
    }
    if (initial) {
      const { error } = await supabase.from("plants").update(payload).eq("id", initial.id);
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("plants").insert(payload);
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Name *</label>
            <input
              className="input"
              required
              value={v.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Scientific name</label>
            <input
              className="input"
              value={v.scientific_name ?? ""}
              onChange={(e) => set("scientific_name", e.target.value || null)}
            />
          </div>
        </div>

        <ImageUpload
          value={v.image_path}
          onChange={(p) => set("image_path", p)}
          publicUrl={(p) => publicImageUrl(supabaseUrl, p)}
        />
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="font-medium">Classification</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Select label="Type *" value={v.plant_type} onChange={(val) => set("plant_type", val as Plant["plant_type"])}
            options={PLANT_TYPES.map((p) => ({ value: p, label: LABELS.plant_type[p] }))} required />
          <Select label="Sun" value={v.sun ?? ""} onChange={(val) => set("sun", (val || null) as Plant["sun"])}
            options={SUN_LEVELS.map((p) => ({ value: p, label: LABELS.sun[p] }))} />
          <Select label="Water" value={v.water ?? ""} onChange={(val) => set("water", (val || null) as Plant["water"])}
            options={WATER_LEVELS.map((p) => ({ value: p, label: LABELS.water[p] }))} />
          <Select label="Size" value={v.size ?? ""} onChange={(val) => set("size", (val || null) as Plant["size"])}
            options={SIZE_LEVELS.map((p) => ({ value: p, label: LABELS.size[p] }))} />
          <Select label="Growth speed" value={v.growth_speed ?? ""}
            onChange={(val) => set("growth_speed", (val || null) as Plant["growth_speed"])}
            options={GROWTH_SPEEDS.map((p) => ({ value: p, label: LABELS.growth_speed[p] }))} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <NumField label="Mature height (ft)" value={v.mature_height_ft} onChange={(n) => set("mature_height_ft", n)} />
          <NumField label="Mature width (ft)" value={v.mature_width_ft} onChange={(n) => set("mature_width_ft", n)} />
          <NumField label="Hardy zone min" value={v.hardy_zone_min} onChange={(n) => set("hardy_zone_min", n)} />
          <NumField label="Hardy zone max" value={v.hardy_zone_max} onChange={(n) => set("hardy_zone_max", n)} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Check label="Deer resistant" value={v.deer_resistant} onChange={(b) => set("deer_resistant", b)} />
          <Check label="Native" value={v.native} onChange={(b) => set("native", b)} />
          <Check label="Flowering" value={v.flowering} onChange={(b) => set("flowering", b)} />
          <Check label="Low maintenance" value={v.low_maintenance} onChange={(b) => set("low_maintenance", b)} />
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Price range</label>
            <input
              className="input"
              placeholder="$, $$, $$$"
              value={v.price_range ?? ""}
              onChange={(e) => set("price_range", e.target.value || null)}
            />
          </div>
          <Select
            label="Status"
            value={v.status}
            onChange={(val) => set("status", val as Plant["status"])}
            options={[
              { value: "active", label: "Active (visible to customers)" },
              { value: "disabled", label: "Disabled (hidden from public)" },
            ]}
          />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea
            className="input min-h-[100px]"
            value={v.notes ?? ""}
            onChange={(e) => set("notes", e.target.value || null)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={() => router.push("/admin")}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : initial ? "Save changes" : "Create plant"}
        </button>
      </div>
    </form>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        {!required && <option value="">—</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (n: number | null) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        className="input"
        type="number"
        step="any"
        value={value ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? null : Number(v));
        }}
      />
    </div>
  );
}

function Check({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (b: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-neutral-300 text-riverside-600 focus:ring-riverside-500"
      />
      {label}
    </label>
  );
}
