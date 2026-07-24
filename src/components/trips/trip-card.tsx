import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import type { Trip } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { coverForDestination } from "@/lib/destinations";
import { Badge } from "@/components/ui/badge";

export function TripCard({ trip }: { trip: Trip }) {
  const cover = trip.cover_url || coverForDestination(trip.destination);

  return (
    <Link
      href={`/trips/${trip.id}`}
      className="group dest-card block overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] shadow-sm"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={cover}
          alt={trip.destination}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute left-3 top-3">
          <Badge
            variant={
              trip.status === "ready"
                ? "success"
                : trip.status === "failed"
                  ? "warning"
                  : "secondary"
            }
            className="backdrop-blur-sm"
          >
            {trip.status}
          </Badge>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <h3 className="font-display text-lg font-semibold leading-tight">
            {trip.title}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/85">
            <MapPin className="h-3.5 w-3.5" />
            {trip.destination}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 px-4 py-3 text-xs text-[var(--muted)]">
        <CalendarDays className="h-3.5 w-3.5" />
        {formatDate(trip.start_date)} – {formatDate(trip.end_date)}
      </div>
    </Link>
  );
}
