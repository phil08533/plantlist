"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ImageUpload({
  value,
  onChange,
  publicUrl,
}: {
  value: string | null;
  onChange: (path: string | null) => void;
  publicUrl: (path: string | null) => string | null;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const preview = publicUrl(value);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `plants/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("plant-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      onChange(path);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="label">Image</div>
      <div className="flex items-start gap-4">
        <div className="h-32 w-32 rounded-xl bg-neutral-100 overflow-hidden ring-1 ring-neutral-200 flex items-center justify-center">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-neutral-400">No image</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <ImagePlus className="h-4 w-4" />
            {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
          </button>
          {value && (
            <button
              type="button"
              className="btn-secondary !text-red-600"
              onClick={() => onChange(null)}
            >
              <Trash2 className="h-4 w-4" /> Remove
            </button>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
