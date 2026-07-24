"use client";

import { useEffect, useState, type ElementType } from "react";
import {
  Camera,
  Coffee,
  Mountain,
  Moon,
  ShoppingBag,
  Bus,
  Bed,
  Heart,
  MapPin,
} from "lucide-react";
import type { Activity, ActivityType } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
import { resolvePlacePhoto } from "@/lib/place-photos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const typeIcon: Record<ActivityType, ElementType> = {
  food: Coffee,
  culture: Camera,
  nature: Mountain,
  nightlife: Moon,
  shopping: ShoppingBag,
  transport: Bus,
  stay: Bed,
  other: MapPin,
};

const typeColor: Record<ActivityType, string> = {
  food: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  culture:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200",
  nature:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  nightlife:
    "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
  shopping: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200",
  transport: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  stay: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200",
  other: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
};

export function ActivityCard({
  activity,
  active,
  onSelect,
  destination,
  onFavorite,
  favorited,
}: {
  activity: Activity;
  active?: boolean;
  onSelect?: () => void;
  destination?: string;
  onFavorite?: () => void;
  favorited?: boolean;
}) {
  const Icon = typeIcon[activity.type] || MapPin;
  const [photo, setPhoto] = useState<string | null>(null);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const url = await resolvePlacePhoto({
        key: activity.id,
        title: activity.title,
        destination,
        address: activity.address,
        lat: activity.lat,
        lng: activity.lng,
        mapboxToken,
      });
      if (!cancelled) setPhoto(url);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    activity.id,
    activity.title,
    activity.address,
    activity.lat,
    activity.lng,
    destination,
    mapboxToken,
  ]);

  return (
    <div
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] text-left shadow-sm transition hover:shadow-md",
        active && "ring-2 ring-[var(--lagoon)]",
      )}
    >
      <button type="button" onClick={onSelect} className="flex w-full gap-0 text-left">
        <div className="relative h-auto w-20 shrink-0 self-stretch bg-[var(--sand-deep)] sm:w-24">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className={cn(
                "flex h-full min-h-[5.5rem] items-center justify-center",
                typeColor[activity.type],
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium leading-snug">{activity.title}</p>
            {activity.cost_cents != null && activity.cost_cents > 0 ? (
              <span className="shrink-0 text-xs font-medium text-[var(--muted)]">
                {formatCurrency(activity.cost_cents)}
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {activity.start_time ? (
              <span className="font-mono text-xs text-[var(--muted)]">
                {activity.start_time}
              </span>
            ) : null}
            <Badge variant="outline" className="text-[10px] capitalize">
              {activity.type}
            </Badge>
            {activity.duration_min ? (
              <span className="text-xs text-[var(--muted)]">
                {activity.duration_min}m
              </span>
            ) : null}
          </div>
          {activity.description ? (
            <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">
              {activity.description}
            </p>
          ) : null}
        </div>
      </button>
      {onFavorite ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1 h-8 w-8 rounded-full bg-[var(--card)]/90 shadow-sm"
          aria-label={favorited ? "Saved to favorites" : "Save to favorites"}
          onClick={(e) => {
            e.stopPropagation();
            onFavorite();
          }}
        >
          <Heart
            className={cn(
              "h-4 w-4",
              favorited
                ? "fill-[var(--coral)] text-[var(--coral)]"
                : "text-[var(--muted)]",
            )}
          />
        </Button>
      ) : null}
    </div>
  );
}
