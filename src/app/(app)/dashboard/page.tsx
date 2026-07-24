import Link from "next/link";
import { CloudSun, Map, Plus, Sparkles } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { listTripsAction } from "@/app/actions/trips";
import { remainingGenerations } from "@/lib/credits";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Trip } from "@/lib/types";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const profile = await requireProfile();
  const trips = (await listTripsAction()) as Trip[];
  const upcoming = trips
    .filter((t) => t.status !== "archived")
    .slice(0, 4);
  const remaining = remainingGenerations(profile);

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome{profile.display_name ? `, ${profile.display_name}` : ""}
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Your AI travel command center
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/trips/new">
            <Plus className="h-4 w-4" />
            New trip
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-indigo-600 to-cyan-500 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5" />
              AI credits
            </CardTitle>
            <CardDescription className="text-indigo-100">
              {profile.plan === "pro"
                ? "Pro · unlimited generations"
                : `${remaining} free generation${remaining === 1 ? "" : "s"} left this month`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile.plan !== "pro" ? (
              <Button asChild variant="accent" size="sm">
                <Link href="/billing">Upgrade to Pro</Link>
              </Button>
            ) : (
              <Badge className="bg-white/20 text-white border-0">Pro active</Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5 text-indigo-500" />
              Active trips
            </CardTitle>
            <CardDescription>
              {trips.filter((t) => t.status !== "archived").length} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/trips">View all</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudSun className="h-5 w-5 text-cyan-500" />
              Weather
            </CardTitle>
            <CardDescription>
              Open a trip workspace for destination forecasts
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent & upcoming</h2>
        </div>
        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-start gap-4 py-10">
              <p className="text-slate-600 dark:text-slate-400">
                No trips yet. Generate your first AI itinerary in under a minute.
              </p>
              <Button asChild>
                <Link href="/trips/new">Plan a trip</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {upcoming.map((trip) => (
              <Link key={trip.id} href={`/trips/${trip.id}`}>
                <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{trip.title}</CardTitle>
                      <Badge
                        variant={
                          trip.status === "ready"
                            ? "success"
                            : trip.status === "failed"
                              ? "warning"
                              : "secondary"
                        }
                      >
                        {trip.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {trip.destination} · {formatDate(trip.start_date)} –{" "}
                      {formatDate(trip.end_date)}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">AI suggestions</h2>
        <div className="flex flex-wrap gap-2">
          {[
            "Food weekend in Lisbon",
            "Kyoto autumn culture week",
            "Bali beaches & temples",
            "Rome history for first-timers",
          ].map((s) => (
            <Button key={s} asChild variant="secondary" size="sm">
              <Link href={`/trips/new?prompt=${encodeURIComponent(s)}`}>{s}</Link>
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}
