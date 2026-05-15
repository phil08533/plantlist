import Link from "next/link";

export function Logo({ href = "/", size = 36 }: { href?: string | null; size?: number }) {
  const inner = (
    <div className="flex items-center gap-3">
      {/* Plain <img> so a missing file degrades silently to just the wordmark. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/riversidelogo.png"
        alt=""
        width={size}
        height={size}
        className="rounded-md object-contain"
      />
      <span className="font-semibold text-neutral-900 leading-tight">
        Riverside <span className="text-riverside-600">Lawncare</span>
      </span>
    </div>
  );
  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
