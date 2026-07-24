"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Link2,
  Loader2,
  RefreshCw,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import type { TripWithDetails, WeatherDay } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { ensureShareTokenAction } from "@/app/actions/trips";
import { ActivityCard } from "@/components/workspace/activity-card";
import { AIChat } from "@/components/workspace/ai-chat";
import { BudgetPanel } from "@/components/workspace/budget-panel";
import { MapView } from "@/components/workspace/map-view";
import { WeatherPanel } from "@/components/workspace/weather-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { updateTripNotesAction } from "@/app/actions/trips";

export function TripWorkspace({
  trip,
  weather,
}: {
  trip: TripWithDetails;
  weather: WeatherDay[] | null;
}) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [dayId, setDayId] = useState(trip.days[0]?.id ?? "");
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [notes, setNotes] = useState(trip.notes ?? "");
  const [pending, startTransition] = useTransition();
  const [mobileTab, setMobileTab] = useState("itinerary");

  const activeDay = trip.days.find((d) => d.id === dayId) ?? trip.days[0];

  const mapActivities = useMemo(
    () =>
      trip.days.flatMap((d, dayIndex) =>
        d.activities.map((a) => ({ ...a, dayIndex })),
      ),
    [trip.days],
  );

  function regenerate() {
    startTransition(async () => {
      toast.message("Grok is regenerating your trip…");
      try {
        const r = await fetch("/api/trips/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tripId: trip.id }),
        });
        const res = (await r.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
          paywall?: boolean;
          provider?: string;
        };
        if (!r.ok || !res.ok) {
          toast.error(res.error || `Failed (${r.status})`);
          if (res.paywall) router.push("/billing");
          return;
        }
        toast.success(
          res.provider ? `Updated via ${res.provider}` : "Itinerary updated",
        );
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Regenerate failed");
      }
    });
  }

  async function share() {
    const res = await ensureShareTokenAction(trip.id);
    if (!res.ok || !res.data) {
      toast.error(res.ok ? "Failed" : res.error);
      return;
    }
    const url = `${window.location.origin}/share/${res.data.token}`;
    await navigator.clipboard.writeText(url);
    toast.success("Share link copied");
  }

  function saveNotes() {
    startTransition(async () => {
      const res = await updateTripNotesAction(trip.id, notes);
      if (!res.ok) toast.error(res.error);
      else toast.success("Notes saved");
    });
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col gap-3 lg:h-[calc(100vh-4rem)]">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-bold">{trip.title}</h1>
            <Badge variant="secondary">{trip.status}</Badge>
          </div>
          <p className="text-sm text-slate-500">
            {trip.destination} · {formatDate(trip.start_date)} –{" "}
            {formatDate(trip.end_date)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void share()}>
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          {trip.share_token ? (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/share/${trip.share_token}`} target="_blank">
                <Link2 className="h-4 w-4" />
                Open public
              </Link>
            </Button>
          ) : null}
          <Button size="sm" onClick={regenerate} disabled={pending}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Regenerate
          </Button>
        </div>
      </div>

      {trip.status === "failed" && trip.error_message ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          Generation failed: {trip.error_message}
        </div>
      ) : null}

      {trip.status === "generating" ? (
        <div className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-100">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating itinerary…
        </div>
      ) : null}

      {/* Mobile tabs */}
      <div className="lg:hidden">
        <Tabs value={mobileTab} onValueChange={setMobileTab}>
          <TabsList className="w-full">
            <TabsTrigger value="itinerary" className="flex-1">
              Itinerary
            </TabsTrigger>
            <TabsTrigger value="map" className="flex-1">
              Map
            </TabsTrigger>
            <TabsTrigger value="context" className="flex-1">
              AI & more
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 3-column desktop / tabbed mobile */}
      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-12">
        {/* Left: itinerary */}
        <div
          className={`min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:col-span-3 lg:flex ${
            mobileTab === "itinerary" ? "flex" : "hidden lg:flex"
          }`}
        >
          <div className="flex gap-1 overflow-x-auto border-b border-slate-100 p-2 dark:border-slate-800">
            {trip.days.map((d, i) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDayId(d.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
                  d.id === activeDay?.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                Day {i + 1}
              </button>
            ))}
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {trip.days.length === 0 ? (
              <p className="text-sm text-slate-500">
                No days yet. Generate an itinerary to populate activities.
              </p>
            ) : (
              activeDay?.activities.map((a) => (
                <ActivityCard
                  key={a.id}
                  activity={a}
                  active={selectedActivity === a.id}
                  onSelect={() => setSelectedActivity(a.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Center: map */}
        <div
          className={`min-h-[300px] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 lg:col-span-5 lg:min-h-0 ${
            mobileTab === "map" ? "block" : "hidden lg:block"
          }`}
        >
          <MapView
            activities={mapActivities}
            selectedId={selectedActivity}
            onSelect={setSelectedActivity}
            dark={resolvedTheme === "dark"}
          />
        </div>

        {/* Right: context */}
        <div
          className={`min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 lg:col-span-4 lg:flex ${
            mobileTab === "context" ? "flex" : "hidden lg:flex"
          }`}
        >
          <Tabs defaultValue="chat" className="flex min-h-0 flex-1 flex-col">
            <TabsList className="w-full shrink-0">
              <TabsTrigger value="chat" className="flex-1">
                AI
              </TabsTrigger>
              <TabsTrigger value="weather" className="flex-1">
                Weather
              </TabsTrigger>
              <TabsTrigger value="budget" className="flex-1">
                Budget
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex-1">
                Notes
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="min-h-0 flex-1 overflow-hidden">
              <AIChat tripId={trip.id} />
            </TabsContent>
            <TabsContent value="weather" className="overflow-y-auto">
              <WeatherPanel weather={weather} destination={trip.destination} />
            </TabsContent>
            <TabsContent value="budget" className="overflow-y-auto">
              <BudgetPanel trip={trip} expenses={trip.expenses} />
            </TabsContent>
            <TabsContent value="notes" className="space-y-2">
              <Textarea
                rows={10}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Trip notes…"
              />
              <Button size="sm" onClick={saveNotes} disabled={pending}>
                Save notes
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
