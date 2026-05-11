"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const TABS = [
  { href: "/admin", label: "Plants" },
  { href: "/admin/import", label: "Excel import" },
  { href: "/admin/projects", label: "Saved lists" },
];

export function AdminNav({ email }: { email: string | null }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-4">
        <nav className="flex gap-1">
          {TABS.map((t) => {
            const active = pathname === t.href || pathname.startsWith(t.href + "/");
            return (
              <Link
                key={t.href}
                href={t.href}
                className={
                  active
                    ? "px-3 py-1.5 rounded-lg bg-riverside-50 text-riverside-700 text-sm font-medium"
                    : "px-3 py-1.5 rounded-lg text-sm text-neutral-700 hover:bg-neutral-100"
                }
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          {email && <span className="hidden sm:inline">{email}</span>}
          <button onClick={signOut} className="btn-secondary text-sm">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
