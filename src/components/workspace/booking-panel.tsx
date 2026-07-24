"use client";

import { ExternalLink, Hotel, Plane } from "lucide-react";
import type { TripWithDetails } from "@/lib/types";
import { buildAffiliateLinks } from "@/lib/affiliates";
import { Button } from "@/components/ui/button";

export function BookingPanel({ trip }: { trip: TripWithDetails }) {
  const cities =
    Array.isArray(trip.cities) && trip.cities.length
      ? trip.cities
      : trip.destination
          .split(/→|->/)
          .map((s) => s.trim())
          .filter(Boolean)
          .map((name, order) => ({ name, nights: 2, order: order + 1 }));

  const links = buildAffiliateLinks({
    destination: trip.destination,
    startDate: trip.start_date,
    endDate: trip.end_date,
    travelers: trip.preferences?.travelers || 2,
    cities,
    origin: trip.preferences?.origin,
  });

  const flights = links.filter((l) => l.kind === "flight");
  const stays = links.filter((l) => l.kind === "hotel" || l.kind === "stay");

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--muted)]">
        Jump to trusted booking sites with your dates pre-filled. We may earn a
        commission at no extra cost to you when you book via partner links.
      </p>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Plane className="h-4 w-4 text-[var(--lagoon)]" />
          Flights
        </h3>
        <div className="space-y-2">
          {flights.map((l) => (
            <a
              key={l.id}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 px-3 py-3 transition hover:border-[var(--lagoon)]"
            >
              <div>
                <p className="font-medium">{l.label}</p>
                <p className="text-xs text-[var(--muted)]">{l.description}</p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-[var(--muted)]" />
            </a>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Hotel className="h-4 w-4 text-[var(--coral)]" />
          Stays
        </h3>
        <div className="space-y-2">
          {stays.map((l) => (
            <a
              key={l.id}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 px-3 py-3 transition hover:border-[var(--coral)]"
            >
              <div>
                <p className="font-medium">{l.label}</p>
                <p className="text-xs text-[var(--muted)]">{l.description}</p>
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-[var(--muted)]" />
            </a>
          ))}
        </div>
      </section>

      {cities.length > 1 ? (
        <p className="text-xs text-[var(--muted)]">
          Multi-city route: {cities.map((c) => c.name).join(" → ")}. Hotel links
          are included for each stop.
        </p>
      ) : null}

      <Button asChild variant="outline" size="sm" className="w-full">
        <a
          href="https://www.google.com/travel/flights"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Google Travel
        </a>
      </Button>
    </div>
  );
}
