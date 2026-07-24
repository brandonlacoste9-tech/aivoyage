import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, APP_NAME } from "@/lib/config";
import { formatCurrency, formatDate } from "@/lib/utils";
import { coverForDestination } from "@/lib/destinations";
import type { Activity, Day, Trip } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!isSupabaseConfigured()) notFound();

  const supabase = await createClient();

  const { data: trips, error } = await supabase.rpc("get_shared_trip", {
    p_token: token,
  });

  const trip = (Array.isArray(trips) ? trips[0] : trips) as Trip | undefined;
  if (error || !trip) notFound();

  const { data: days } = await supabase.rpc("get_shared_days", {
    p_token: token,
  });
  const { data: activities } = await supabase.rpc("get_shared_activities", {
    p_token: token,
  });

  const dayList = ((days ?? []) as Day[]).sort(
    (a, b) => a.day_order - b.day_order,
  );
  const actList = (activities ?? []) as Activity[];
  const cover = trip.cover_url || coverForDestination(trip.destination);

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />

      <div className="relative h-56 w-full overflow-hidden sm:h-72">
        <Image
          src={cover}
          alt={trip.destination}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/50 to-black/20" />
      </div>

      <main className="relative z-10 mx-auto -mt-16 max-w-3xl px-4 pb-16 sm:px-6">
        <div className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl sm:p-8">
          <Badge variant="cyan" className="mb-3">
            Shared itinerary
          </Badge>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {trip.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-[var(--muted)]">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[var(--lagoon)]" />
              {trip.destination}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-[var(--coral)]" />
              {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
            </span>
          </div>
          {trip.notes ? (
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] whitespace-pre-wrap">
              {trip.notes.replace(/\n\n— Planned with.*$/, "")}
            </p>
          ) : null}
        </div>

        <div className="mt-8 space-y-5">
          {dayList.map((day, i) => {
            const dayActs = actList
              .filter((a) => a.day_id === day.id)
              .sort((a, b) => a.sort_order - b.sort_order);
            return (
              <section
                key={day.id}
                className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6"
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
                  Day {i + 1}
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold">
                  {formatDate(day.date)}
                </h2>
                {day.notes ? (
                  <p className="mt-1 text-sm text-[var(--muted)]">{day.notes}</p>
                ) : null}
                <ul className="mt-4 space-y-3">
                  {dayActs.map((a) => (
                    <li
                      key={a.id}
                      className="rounded-2xl border border-[var(--border)]/80 bg-[var(--background)]/50 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">
                            {a.start_time ? (
                              <span className="mr-2 font-mono text-xs text-[var(--muted)]">
                                {a.start_time}
                              </span>
                            ) : null}
                            {a.title}
                          </p>
                          {a.description ? (
                            <p className="mt-1 text-sm text-[var(--muted)]">
                              {a.description}
                            </p>
                          ) : null}
                          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--lagoon)]">
                            {a.type}
                          </p>
                        </div>
                        {a.cost_cents ? (
                          <span className="shrink-0 text-sm text-[var(--muted)]">
                            {formatCurrency(a.cost_cents, trip.currency)}
                          </span>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <div className="mt-10 rounded-[1.75rem] bg-[var(--lagoon)] px-6 py-8 text-center text-[var(--primary-foreground)] sm:px-10">
          <p className="font-display text-2xl font-semibold">
            Plan your own trip with {APP_NAME}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm opacity-85">
            AI itineraries, maps, weather, and budget — free to start.
          </p>
          <Button asChild variant="accent" className="mt-5">
            <Link href="/auth/sign-up">Get started free</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
