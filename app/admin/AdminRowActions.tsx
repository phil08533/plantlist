"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Edit, Power, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AdminRowActions({ id, status }: { id: string; status: "active" | "disabled" }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function toggleStatus() {
    start(async () => {
      const supabase = createClient();
      await supabase
        .from("plants")
        .update({ status: status === "active" ? "disabled" : "active" })
        .eq("id", id);
      router.refresh();
    });
  }

  function doDelete() {
    start(async () => {
      const supabase = createClient();
      await supabase.from("plants").delete().eq("id", id);
      setConfirmingDelete(false);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/plants/${id}`}
        className="rounded-lg px-2 py-1 text-neutral-600 hover:bg-neutral-100"
        aria-label="Edit"
      >
        <Edit className="h-4 w-4" />
      </Link>
      <button
        type="button"
        onClick={toggleStatus}
        disabled={pending}
        className="rounded-lg px-2 py-1 text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
        aria-label={status === "active" ? "Disable" : "Activate"}
        title={status === "active" ? "Disable" : "Activate"}
      >
        <Power className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setConfirmingDelete(true)}
        className="rounded-lg px-2 py-1 text-red-600 hover:bg-red-50"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {confirmingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card p-5 w-full max-w-sm">
            <h2 className="font-semibold">Delete plant?</h2>
            <p className="text-sm text-neutral-600 mt-1">
              This permanently removes the plant. Consider disabling instead so it stays
              attached to old project lists.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="btn-secondary"
                onClick={() => setConfirmingDelete(false)}
                disabled={pending}
              >
                Cancel
              </button>
              <button className="btn-danger" onClick={doDelete} disabled={pending}>
                {pending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
