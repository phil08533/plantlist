"use client";

import { Check, Plus } from "lucide-react";
import { useSelection } from "@/components/SelectionProvider";

export function AddToListButton({ id }: { id: string }) {
  const { has, toggle } = useSelection();
  const selected = has(id);
  return (
    <button onClick={() => toggle(id)} className={selected ? "btn-primary" : "btn-secondary"}>
      {selected ? (
        <>
          <Check className="h-4 w-4" /> Added to list
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" /> Add to list
        </>
      )}
    </button>
  );
}
