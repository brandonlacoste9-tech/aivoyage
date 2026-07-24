"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Map,
  Plane,
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
  { href: "/explore", label: "Explore", icon: Compass },
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
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:h-screen lg:w-60 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 text-white">
            <Plane className="h-3.5 w-3.5" />
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
                "flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t border-slate-200 p-4 dark:border-slate-800">
        {creditsLabel ? (
          <p className="text-xs text-slate-500">
            Plan: <span className="font-medium text-slate-800 dark:text-slate-200">{plan}</span>
            <br />
            {creditsLabel}
          </p>
        ) : null}
        {email ? (
          <p className="truncate text-xs text-slate-500" title={email}>
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
