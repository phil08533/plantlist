"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "riverside.selection.v1";

export type SelectionItem = { id: string; quantity: number; note?: string };

type Ctx = {
  items: SelectionItem[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  add: (id: string, quantity?: number) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, q: number) => void;
  setNote: (id: string, note: string) => void;
  clear: () => void;
  replace: (items: SelectionItem[]) => void;
};

const SelectionContext = createContext<Ctx | null>(null);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<SelectionItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const has = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const toggle = useCallback((id: string) => {
    setItems((prev) =>
      prev.some((i) => i.id === id) ? prev.filter((i) => i.id !== id) : [...prev, { id, quantity: 1 }],
    );
  }, []);

  const add = useCallback((id: string, quantity = 1) => {
    setItems((prev) =>
      prev.some((i) => i.id === id) ? prev : [...prev, { id, quantity }],
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setQuantity = useCallback((id: string, q: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, q) } : i)),
    );
  }, []);

  const setNote = useCallback((id: string, note: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, note } : i)));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const replace = useCallback((next: SelectionItem[]) => setItems(next), []);

  const value = useMemo<Ctx>(
    () => ({ items, has, toggle, add, remove, setQuantity, setNote, clear, replace }),
    [items, has, toggle, add, remove, setQuantity, setNote, clear, replace],
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be inside <SelectionProvider>");
  return ctx;
}
