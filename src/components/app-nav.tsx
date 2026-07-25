"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  CreditCard,
  Heart,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Map,
  Plus,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME } from "@/lib/config";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trips", label: "Trips", icon: Map },
  { href: "/trips/new", label: "New trip", icon: Plus },
  { href: "/plan/from-photo", label: "From photo", icon: ImageIcon },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppNav({
  email,
  plan,
  creditsLabel,
}: {
  email?: string | null;
  plan?: string;
  creditsLabel?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    try {
      const { default: posthog } = await import("posthog-js");
      posthog.capture("user_signed_out");
      posthog.reset();
    } catch {
      /* ignore */
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex w-full flex-col border-b border-[var(--border)] bg-[var(--card)] lg:h-screen lg:w-60 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-display font-semibold"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--lagoon)] text-[var(--primary-foreground)]">
            <Compass className="h-4 w-4" />
          </span>
          {APP_NAME}
        </Link>
        <ThemeToggle />
      </div>

      <nav className="flex gap-1 overflow-x-auto px-2 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:px-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--lagoon)]/10 text-[var(--lagoon)]"
                  : "text-[var(--muted)] hover:bg-[var(--sand-deep)] hover:text-[var(--foreground)]",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t border-[var(--border)] p-4">
        {creditsLabel ? (
          <p className="text-xs text-[var(--muted)]">
            Plan:{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {plan}
            </span>
            <br />
            {creditsLabel}
          </p>
        ) : null}
        {email ? (
          <p className="truncate text-xs text-[var(--muted)]" title={email}>
            {email}
          </p>
        ) : null}
        <Button variant="outline" size="sm" className="w-full" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
