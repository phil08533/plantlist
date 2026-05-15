"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { useSelection } from "./SelectionProvider";

export function SelectionFab() {
  const { items } = useSelection();
  if (items.length === 0) return null;
  return (
    <Link
      href="/builder"
      className="fixed bottom-5 right-5 z-30 btn-primary shadow-lg !rounded-full !px-5 !py-3"
    >
      <ClipboardList className="h-5 w-5" />
      Build list
      <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">{items.length}</span>
    </Link>
  );
}
