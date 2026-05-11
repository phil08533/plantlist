"use client";

import { useEffect, useRef } from "react";
import { useSelection, type SelectionItem } from "@/components/SelectionProvider";

export function BuilderHydrator({ items }: { items: SelectionItem[] }) {
  const { replace } = useSelection();
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    replace(items);
  }, [items, replace]);
  return null;
}
