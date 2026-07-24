import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CloudSun,
  Compass,
  Map,
  Plus,
  Sparkles,
} from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { listTripsAction } from "@/app/actions/trips";
import { remainingGenerations } from "@/lib/credits";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Trip } from "@/lib/types";
import { TripCard } from "@/components/trips/trip-card";
import { DESTINATIONS, coverForDestination } from "@/lib/destinations";
import { fetchWeather } from "@/lib/weather";
import { SampleTripButton } from "@/components/dashboard/sample-trip-button";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const profile = await requireProfile();
  const trips = (await listTripsAction()) as Trip[];
  const active = trips.filter((t) => t.status !== "archived");
  const upcoming = active.slice(0, 4);
  const remaining = remainingGenerations(profile);
  const focus = upcoming[0];
  const weather = focus ? await fetchWeather(focus.destination, 3) : null;

  return (
    <div className="mx-auto max-w-7xl space-y-10 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral)]">
            Dashboard
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome back
            {profile.display_name ? `, ${profile.display_name}` : ""}
          </h1>
          <p className="mt-1 text-[var(--muted)]">
            Your trips, weather, and next ideas — in one place.
          </p>
        </div>
        <Button asChild size="lg" variant="accent">
          <Link href="/trips/new">
            <Plus className="h-4 w-4" />
            Plan a trip
          </Link>
        </Button>
      </div>

      {/* Bento stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] border-0 bg-[var(--lagoon)] p-6 text-[var(--primary-foreground)] shadow-lg shadow-[var(--lagoon)]/20">
          <div className="flex items-center gap-2 text-sm font-medium opacity-90">
            <Sparkles className="h-4 w-4" />
            AI planning
          </div>
          <p className="mt-3 font-display text-3xl font-semibold">
            {profile.plan === "pro"
              ? "Unlimited"
              : `${remaining} left`}
          </p>
          <p className="mt-1 text-sm opacity-80">
            {profile.plan === "pro"
              ? "Pro · generate freely"
              : "Free generations this month"}
          </p>
          {profile.plan !== "pro" ? (
            <Button asChild size="sm" variant="accent" className="mt-4">
              <Link href="/billing">Upgrade to Pro</Link>
            </Button>
          ) : (
            <Badge className="mt-4 border-0 bg-white/20 text-white">Pro</Badge>
          )}
        </div>

        <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
            <Map className="h-4 w-4 text-[var(--lagoon)]" />
            Active trips
          </div>
          <p className="mt-3 font-display text-3xl font-semibold">
            {active.length}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Ready to open or still brewing
          </p>
          <Button asChild size="sm" variant="outline" className="mt-4">
            <Link href="/trips">
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
            <CloudSun className="h-4 w-4 text-[var(--coral)]" />
            Weather
            {focus ? (
              <span className="text-[var(--foreground)]">· {focus.destination}</span>
            ) : null}
          </div>
          {weather && weather.length > 0 ? (
            <div className="mt-3 space-y-2">
              {weather.slice(0, 3).map((d) => (
                <div
                  key={d.date}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-[var(--muted)]">
                    {formatDate(d.date)}
                  </span>
                  <span className="font-medium">
                    {Math.round(d.temp_max)}° / {Math.round(d.temp_min)}°
                  </span>
                  <span className="max-w-[40%] truncate text-xs text-[var(--muted)]">
                    {d.condition}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--muted)]">
              {focus
                ? "Forecast will appear when weather is configured."
                : "Plan a trip to see destination weather here."}
            </p>
          )}
        </div>
      </div>

      {/* Upcoming trips */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Your trips</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/trips">See all</Link>
          </Button>
        </div>
        {upcoming.length === 0 ? (
          <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)]">
            <div className="absolute inset-0 opacity-30">
              <Image
                src={coverForDestination("Kyoto")}
                alt=""
                fill
                className="object-cover"
              />
            </div>
            <div className="relative flex flex-col items-start gap-4 bg-[var(--card)]/85 p-8 backdrop-blur-sm sm:p-10">
              <Compass className="h-8 w-8 text-[var(--lagoon)]" />
              <div>
                <h3 className="font-display text-xl font-semibold">
                  Your first voyage starts with one sentence
                </h3>
                <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
                  Describe a trip, pick dates, and Grok builds a day-by-day plan
                  with map, weather, and budget.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="accent">
                  <Link href="/trips/new">Create your first trip</Link>
                </Button>
                <SampleTripButton />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      {/* Ideas */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold">
              Spark the next one
            </h2>
            <p className="text-sm text-[var(--muted)]">
              One tap to start a trip from a destination
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/explore">Explore all</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DESTINATIONS.slice(0, 4).map((d) => (
            <Link
              key={d.name}
              href={`/trips/new?destination=${encodeURIComponent(d.name)}&prompt=${encodeURIComponent(d.prompt)}`}
              className="group dest-card relative block aspect-[4/5] overflow-hidden rounded-[1.5rem]"
            >
              <Image
                src={d.image}
                alt={d.name}
                fill
                sizes="25vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">
                  {d.season}
                </p>
                <p className="font-display text-xl font-semibold">{d.name}</p>
                <p className="mt-0.5 text-xs text-white/80">{d.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
