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
import {
  ensureShareTokenAction,
  markTripReadyAction,
  updateTripNotesAction,
} from "@/app/actions/trips";
import { saveFavoriteFromActivityAction } from "@/app/actions/favorites";
import { ExportIcsButton } from "@/components/workspace/export-ics-button";
import { PrintButton } from "@/components/workspace/print-button";
import { CollaboratorsPanel } from "@/components/workspace/collaborators-panel";
import { ActivityList } from "@/components/workspace/activity-list";
import { AIChat } from "@/components/workspace/ai-chat";
import { BudgetChart } from "@/components/workspace/budget-chart";
import { PackingPanel } from "@/components/workspace/packing-panel";
import { BookingPanel } from "@/components/workspace/booking-panel";
import { PresenceBar } from "@/components/workspace/presence-bar";
import { MapView } from "@/components/workspace/map-view";
import { WeatherPanel } from "@/components/workspace/weather-panel";
import { PaywallModal } from "@/components/paywall-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export function TripWorkspace({
  trip,
  weather,
  currentUserId,
  displayName,
}: {
  trip: TripWithDetails;
  weather: WeatherDay[] | null;
  currentUserId: string;
  displayName?: string;
}) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [dayId, setDayId] = useState(trip.days[0]?.id ?? "");
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [notes, setNotes] = useState(trip.notes ?? "");
  const [pending, startTransition] = useTransition();
  const [mobileTab, setMobileTab] = useState("itinerary");
  const [favorited, setFavorited] = useState<Record<string, boolean>>({});
  const [paywall, setPaywall] = useState(false);

  const isOwner = trip.owner_id === currentUserId;
  const activeDay = trip.days.find((d) => d.id === dayId) ?? trip.days[0];
  const hasItinerary = trip.days.some((d) => d.activities.length > 0);
  const displayStatus =
    trip.status === "generating" && hasItinerary ? "ready" : trip.status;
  const stuckGenerating = trip.status === "generating" && hasItinerary;

  const mapActivities = useMemo(
    () =>
      trip.days.flatMap((d, dayIndex) =>
        d.activities.map((a) => ({ ...a, dayIndex })),
      ),
    [trip.days],
  );

  function regenerate() {
    if (!isOwner) {
      toast.error("Only the owner can regenerate");
      return;
    }
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
          if (res.paywall || r.status === 402) setPaywall(true);
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
    try {
      const { default: posthog } = await import("posthog-js");
      posthog.capture("share_created", { trip_id: trip.id });
    } catch {
      /* ignore */
    }
    toast.success("Share link copied");
  }

  function saveNotes() {
    startTransition(async () => {
      const res = await updateTripNotesAction(trip.id, notes);
      if (!res.ok) toast.error(res.error);
      else toast.success("Notes saved");
    });
  }

  function markReady() {
    startTransition(async () => {
      const res = await markTripReadyAction(trip.id);
      if (!res.ok) toast.error(res.error);
      else {
        toast.success("Marked ready");
        router.refresh();
      }
    });
  }

  function favoriteActivity(activityId: string) {
    const activity = mapActivities.find((a) => a.id === activityId);
    if (!activity) return;
    startTransition(async () => {
      const res = await saveFavoriteFromActivityAction({
        activity,
        destination: trip.destination,
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setFavorited((f) => ({ ...f, [activityId]: true }));
      toast.success("Saved to favorites");
    });
  }

  function regenerateDay(dayId: string) {
    if (!isOwner) return;
    startTransition(async () => {
      toast.message("Regenerating this day…");
      const r = await fetch("/api/trips/regenerate-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: trip.id, dayId }),
      });
      const res = (await r.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!r.ok || !res.ok) {
        toast.error(res.error || "Day regen failed");
        return;
      }
      toast.success("Day updated");
      router.refresh();
    });
  }

  return (
    <div className="flex h-[calc(100dvh-5.5rem)] flex-col gap-3 lg:h-[calc(100vh-4rem)]">
      <PaywallModal open={paywall} onClose={() => setPaywall(false)} />
      <PresenceBar
        tripId={trip.id}
        userId={currentUserId}
        displayName={displayName || "Traveler"}
      />
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate font-display text-xl font-semibold">
              {trip.title}
            </h1>
            <Badge
              variant={
                displayStatus === "ready"
                  ? "success"
                  : displayStatus === "failed"
                    ? "warning"
                    : "secondary"
              }
            >
              {displayStatus}
            </Badge>
            {!isOwner ? (
              <Badge variant="outline">Collaborator</Badge>
            ) : null}
          </div>
          <p className="text-sm text-[var(--muted)]">
            {trip.destination} · {formatDate(trip.start_date)} –{" "}
            {formatDate(trip.end_date)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportIcsButton trip={trip} />
          <PrintButton tripId={trip.id} />
          <Button variant="outline" size="sm" onClick={() => void share()}>
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          {trip.share_token ? (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/share/${trip.share_token}`} target="_blank">
                <Link2 className="h-4 w-4" />
                Public
              </Link>
            </Button>
          ) : null}
          {isOwner ? (
            <Button size="sm" onClick={regenerate} disabled={pending}>
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Regenerate
            </Button>
          ) : null}
        </div>
      </div>

      {trip.error_message ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="font-medium">Note</p>
          <p className="mt-0.5">{trip.error_message}</p>
        </div>
      ) : null}

      {stuckGenerating ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
          <p>
            Itinerary is ready ({trip.days.length} days) — status was stuck on
            “generating”.
          </p>
          <Button size="sm" variant="outline" onClick={markReady} disabled={pending}>
            Mark as ready
          </Button>
        </div>
      ) : null}

      {trip.status === "generating" && !hasItinerary ? (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--lagoon)]/30 bg-[var(--lagoon)]/10 px-4 py-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating itinerary…
          <Button size="sm" variant="ghost" className="ml-auto" onClick={() => router.refresh()}>
            Refresh
          </Button>
        </div>
      ) : null}

      {/* Mobile tabs */}
      <div className="lg:hidden">
        <Tabs value={mobileTab} onValueChange={setMobileTab}>
          <TabsList className="grid h-11 w-full grid-cols-3 rounded-2xl">
            <TabsTrigger value="itinerary" className="rounded-xl text-xs sm:text-sm">
              Plan
            </TabsTrigger>
            <TabsTrigger value="map" className="rounded-xl text-xs sm:text-sm">
              Map
            </TabsTrigger>
            <TabsTrigger value="context" className="rounded-xl text-xs sm:text-sm">
              More
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-12">
        {/* Left: itinerary */}
        <div
          className={`min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] lg:col-span-3 lg:flex ${
            mobileTab === "itinerary" ? "flex" : "hidden lg:flex"
          }`}
        >
          <div className="flex gap-1 overflow-x-auto border-b border-[var(--border)] p-2">
            {trip.days.map((d, i) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDayId(d.id)}
                className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold ${
                  d.id === activeDay?.id
                    ? "bg-[var(--lagoon)] text-[var(--primary-foreground)]"
                    : "bg-[var(--sand-deep)] text-[var(--muted)]"
                }`}
              >
                Day {i + 1}
                {d.city ? (
                  <span className="mt-0.5 block text-[10px] font-normal opacity-80">
                    {d.city}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {trip.days.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">
                No days yet. Generate an itinerary to populate activities.
              </p>
            ) : activeDay ? (
              <ActivityList
                tripId={trip.id}
                dayId={activeDay.id}
                dayNumber={
                  trip.days.findIndex((d) => d.id === activeDay.id) + 1
                }
                activities={activeDay.activities}
                destination={trip.destination}
                canEdit={isOwner}
                selectedId={selectedActivity}
                onSelect={(id) => {
                  setSelectedActivity(id);
                  if (window.matchMedia("(max-width: 1023px)").matches) {
                    setMobileTab("map");
                  }
                }}
                favorited={favorited}
                onFavorite={favoriteActivity}
                onRegenerateDay={() => regenerateDay(activeDay.id)}
              />
            ) : null}
          </div>
        </div>

        {/* Center: map — taller on mobile */}
        <div
          className={`overflow-hidden rounded-2xl border border-[var(--border)] lg:col-span-5 lg:min-h-0 ${
            mobileTab === "map"
              ? "block min-h-[min(70dvh,560px)]"
              : "hidden min-h-[300px] lg:block"
          }`}
        >
          <MapView
            activities={mapActivities}
            selectedId={selectedActivity}
            onSelect={setSelectedActivity}
            dark={resolvedTheme === "dark"}
            destination={trip.destination}
          />
        </div>

        {/* Right: context */}
        <div
          className={`min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 lg:col-span-4 lg:flex ${
            mobileTab === "context" ? "flex min-h-[50dvh]" : "hidden lg:flex"
          }`}
        >
          <Tabs defaultValue="chat" className="flex min-h-0 flex-1 flex-col">
            <TabsList className="flex h-auto w-full flex-wrap gap-1">
              <TabsTrigger value="chat" className="flex-1 text-xs">
                AI
              </TabsTrigger>
              <TabsTrigger value="weather" className="flex-1 text-xs">
                Weather
              </TabsTrigger>
              <TabsTrigger value="budget" className="flex-1 text-xs">
                Budget
              </TabsTrigger>
              <TabsTrigger value="pack" className="flex-1 text-xs">
                Pack
              </TabsTrigger>
              <TabsTrigger value="book" className="flex-1 text-xs">
                Book
              </TabsTrigger>
              <TabsTrigger value="people" className="flex-1 text-xs">
                People
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex-1 text-xs">
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
              <BudgetChart trip={trip} expenses={trip.expenses} />
            </TabsContent>
            <TabsContent value="pack" className="overflow-y-auto">
              <PackingPanel
                trip={trip}
                weather={weather}
                canEdit={isOwner}
              />
            </TabsContent>
            <TabsContent value="book" className="overflow-y-auto">
              <BookingPanel trip={trip} />
            </TabsContent>
            <TabsContent value="people" className="overflow-y-auto">
              <CollaboratorsPanel tripId={trip.id} isOwner={isOwner} />
            </TabsContent>
            <TabsContent value="notes" className="space-y-2">
              <Textarea
                rows={10}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Trip notes…"
              />
              <Button size="sm" onClick={saveNotes} disabled={pending || !isOwner}>
                Save notes
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
