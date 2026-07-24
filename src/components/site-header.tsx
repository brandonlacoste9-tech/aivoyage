import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { getUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/config";

export async function SiteHeader() {
  const user = await getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)]/80 bg-[var(--background)]/75 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight"
        >
          <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--lagoon)] text-[var(--primary-foreground)] shadow-lg shadow-[var(--lagoon)]/25 transition group-hover:rotate-[-6deg]">
            <Compass className="h-5 w-5" strokeWidth={1.75} />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[var(--coral)] ring-2 ring-[var(--background)]" />
          </span>
          <span>
            {APP_NAME}
            <span className="ml-1 hidden text-[10px] font-sans font-medium uppercase tracking-[0.2em] text-[var(--muted)] sm:inline">
              travel
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[var(--muted)] md:flex">
          <Link
            href="/#how"
            className="transition hover:text-[var(--lagoon)]"
          >
            How it works
          </Link>
          <Link
            href="/#destinations"
            className="transition hover:text-[var(--lagoon)]"
          >
            Destinations
          </Link>
          <Link href="/pricing" className="transition hover:text-[var(--lagoon)]">
            Pricing
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="transition hover:text-[var(--lagoon)]"
            >
              Dashboard
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Button asChild size="sm">
              <Link href="/dashboard">Open workspace</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm" variant="accent">
                <Link href="/auth/sign-up">Start planning</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
