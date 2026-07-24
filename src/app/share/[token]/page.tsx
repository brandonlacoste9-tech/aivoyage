import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, APP_NAME } from "@/lib/config";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Activity, Day, Trip } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8">
          <Badge variant="cyan" className="mb-3">
            Shared itinerary
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">{trip.title}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {trip.destination} · {formatDate(trip.start_date)} –{" "}
            {formatDate(trip.end_date)}
          </p>
          {trip.notes ? (
            <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {trip.notes}
            </p>
          ) : null}
        </div>

        <div className="space-y-6">
          {dayList.map((day, i) => {
            const dayActs = actList
              .filter((a) => a.day_id === day.id)
              .sort((a, b) => a.sort_order - b.sort_order);
            return (
              <Card key={day.id}>
                <CardHeader>
                  <CardTitle>
                    Day {i + 1} · {formatDate(day.date)}
                  </CardTitle>
                  {day.notes ? (
                    <CardDescription>{day.notes}</CardDescription>
                  ) : null}
                </CardHeader>
                <CardContent className="space-y-3">
                  {dayActs.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-xl border border-slate-100 p-3 dark:border-slate-800"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">
                            {a.start_time ? `${a.start_time} · ` : ""}
                            {a.title}
                          </p>
                          {a.description ? (
                            <p className="mt-1 text-sm text-slate-500">
                              {a.description}
                            </p>
                          ) : null}
                        </div>
                        {a.cost_cents ? (
                          <span className="text-sm text-slate-500">
                            {formatCurrency(a.cost_cents, trip.currency)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-center dark:border-indigo-900 dark:bg-indigo-950/40">
          <p className="font-medium">Plan your own trip with {APP_NAME}</p>
          <Button asChild className="mt-4">
            <Link href="/auth/sign-up">Get started free</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
