import Link from "next/link";
import { Logo } from "./Logo";

export function SiteHeader({ showAdminLink = false }: { showAdminLink?: boolean }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link href="/" className="text-sm text-neutral-700 hover:text-riverside-700">
            Plants
          </Link>
          <Link
            href="/builder"
            className="text-sm text-neutral-700 hover:text-riverside-700"
          >
            Build list
          </Link>
          {showAdminLink && (
            <Link href="/admin" className="btn-secondary text-sm">
              Admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-sm text-neutral-500 flex justify-between">
        <span>© Riverside Lawncare</span>
        <Link href="/login" className="hover:text-neutral-800">
          Staff
        </Link>
      </div>
    </footer>
  );
}
