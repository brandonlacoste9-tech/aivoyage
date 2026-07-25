import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--lagoon)]">
          Legal
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Last updated: {updated}
        </p>
        <div className="prose-legal mt-10 space-y-6 text-[15px] leading-relaxed text-[var(--foreground)]">
          {children}
        </div>
        <p className="mt-12 text-sm text-[var(--muted)]">
          Questions?{" "}
          <a
            href="mailto:hello@trip-planner.co"
            className="text-[var(--lagoon)] hover:underline"
          >
            hello@trip-planner.co
          </a>
          {" · "}
          <Link href="/" className="text-[var(--lagoon)] hover:underline">
            Home
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
