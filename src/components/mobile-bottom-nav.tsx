"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Heart,
  LayoutDashboard,
  Map,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/trips", label: "Trips", icon: Map },
  { href: "/trips/new", label: "Plan", icon: PlusCircle },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/favorites", label: "Saved", icon: Heart },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  // Hide on full trip workspace print
  if (pathname.includes("/print")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--card)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" &&
              href !== "/trips/new" &&
              pathname.startsWith(href));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium",
                  active
                    ? "text-[var(--lagoon)]"
                    : "text-[var(--muted)]",
                )}
              >
                <Icon
                  className={cn("h-5 w-5", active && "stroke-[2.25px]")}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
