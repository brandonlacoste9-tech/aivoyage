import Link from "next/link";
import { Plus } from "lucide-react";
import { listTripsAction } from "@/app/actions/trips";
import { formatDate } from "@/lib/utils";
import type { Trip } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Trips" };

export default async function TripsPage() {
  const trips = (await listTripsAction()) as Trip[];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trips</h1>
          <p className="text-slate-600 dark:text-slate-400">
            All your planned and draft itineraries
          </p>
        </div>
        <Button asChild>
          <Link href="/trips/new">
            <Plus className="h-4 w-4" />
            New trip
          </Link>
        </Button>
      </div>

      {trips.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No trips yet</CardTitle>
            <CardDescription>
              Create a trip and let AI build your first itinerary.
            </CardDescription>
            <div className="pt-2">
              <Button asChild>
                <Link href="/trips/new">Create trip</Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Link key={trip.id} href={`/trips/${trip.id}`}>
              <Card className="h-full transition hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{trip.title}</CardTitle>
                    <Badge variant="secondary">{trip.status}</Badge>
                  </div>
                  <CardDescription>
                    {trip.destination}
                    <br />
                    {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
