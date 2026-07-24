import Link from "next/link";
import { Plus } from "lucide-react";
import { listTripsAction } from "@/app/actions/trips";
import type { Trip } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/trips/trip-card";

export const metadata = { title: "Trips" };

export default async function TripsPage() {
  const trips = (await listTripsAction()) as Trip[];

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral)]">
            Library
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Your trips
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            Everything you&apos;ve planned — ready, draft, or regenerating
          </p>
        </div>
        <Button asChild variant="accent">
          <Link href="/trips/new">
            <Plus className="h-4 w-4" />
            New trip
          </Link>
        </Button>
      </div>

      {trips.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-[var(--border)] bg-[var(--card)] px-8 py-16 text-center">
          <h2 className="font-display text-xl font-semibold">No trips yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
            Describe a destination and dates — Grok builds a day-by-day itinerary
            you can refine on the map.
          </p>
          <Button asChild className="mt-6" variant="accent">
            <Link href="/trips/new">Plan your first trip</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
