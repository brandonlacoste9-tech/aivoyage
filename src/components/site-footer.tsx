import Link from "next/link";
import { MapPinned } from "lucide-react";
import { APP_NAME } from "@/lib/config";
import { DESTINATIONS, destinationSlug } from "@/lib/destinations";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)]/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 font-display font-semibold text-[var(--foreground)]">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--lagoon)] text-[var(--primary-foreground)]">
                <MapPinned className="h-3.5 w-3.5" />
              </span>
              {APP_NAME}
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--muted)]">
              AI trip planner for day-by-day itineraries with maps, weather, and
              budget. Free to start at trip-planner.co.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
              Product
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/#how" className="hover:text-[var(--lagoon)]">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-[var(--lagoon)]">
                  Explore
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[var(--lagoon)]">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-[var(--lagoon)]">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
              Destinations
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {DESTINATIONS.slice(0, 6).map((d) => (
                <li key={d.name}>
                  <Link
                    href={`/explore/${destinationSlug(d.name)}`}
                    className="hover:text-[var(--lagoon)]"
                  >
                    {d.name} itinerary
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/explore" className="hover:text-[var(--lagoon)]">
                  All destinations →
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
              Company
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/auth/sign-up" className="hover:text-[var(--lagoon)]">
                  Create free account
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--lagoon)]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--lagoon)]">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@trip-planner.co"
                  className="hover:text-[var(--lagoon)]"
                >
                  hello@trip-planner.co
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/intent/post?text=AI%20day-by-day%20itineraries%20with%20maps%20%26%20budget%20%E2%80%94%20free%20to%20start%0Ahttps%3A%2F%2Ftrip-planner.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--lagoon)]"
                >
                  Share on X
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Ftrip-planner.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--lagoon)]"
                >
                  Share on Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-[var(--border)] pt-6 text-center text-sm text-[var(--muted)] sm:text-left">
          © {new Date().getFullYear()} {APP_NAME} (trip-planner.co). AI
          itineraries with soul — and a map that keeps up.
        </p>
      </div>
    </footer>
  );
}
