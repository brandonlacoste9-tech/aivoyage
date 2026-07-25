"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ImageIcon, Plus, Trash2 } from "lucide-react";
import { createTripAction } from "@/app/actions/trips";
import { Button } from "@/components/ui/button";
import { PaywallModal } from "@/components/paywall-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const INTEREST_OPTIONS = [
  "food",
  "culture",
  "nature",
  "nightlife",
  "shopping",
  "history",
  "adventure",
  "relaxation",
];

type CityLeg = { name: string; nights: number };

export function TripWizard({
  defaultDestination = "",
  defaultPrompt = "",
  defaultVibe = "",
}: {
  defaultDestination?: string;
  defaultPrompt?: string;
  defaultVibe?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [multiCity, setMultiCity] = useState(false);
  const [destination, setDestination] = useState(defaultDestination);
  const [cities, setCities] = useState<CityLeg[]>(
    defaultDestination
      ? [{ name: defaultDestination, nights: 3 }]
      : [{ name: "", nights: 3 }],
  );
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [origin, setOrigin] = useState("");
  const [pace, setPace] = useState("balanced");
  const [travelers, setTravelers] = useState("2");
  const [interests, setInterests] = useState<string[]>(["food", "culture"]);
  const [prompt, setPrompt] = useState(defaultPrompt);
  // Photo vibe is set from plan-from-photo flow via defaultVibe prop
  const vibe = defaultVibe;
  const [paywall, setPaywall] = useState(false);

  function toggleInterest(i: string) {
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
    );
  }

  function syncEndDateFromCities(start: string, legs: CityLeg[]) {
    if (!start || !legs.length) return;
    const totalNights = legs.reduce((s, c) => s + (c.nights || 1), 0);
    // nights + last day often = nights+1 days inclusive
    const d = new Date(start + "T12:00:00");
    d.setDate(d.getDate() + Math.max(1, totalNights));
    setEndDate(d.toISOString().slice(0, 10));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const legs = multiCity
        ? cities.filter((c) => c.name.trim())
        : [{ name: destination.trim(), nights: 3 }];

      if (!legs.length || !startDate || !endDate) {
        toast.error("Destination and dates are required");
        return;
      }

      const fd = new FormData();
      fd.set(
        "destination",
        multiCity ? legs.map((c) => c.name).join(" → ") : destination,
      );
      fd.set("title", title);
      fd.set("start_date", startDate);
      fd.set("end_date", endDate);
      fd.set("budget", budget);
      fd.set("pace", pace);
      fd.set("travelers", travelers);
      fd.set("interests", interests.join(","));
      fd.set("prompt", prompt);
      fd.set("origin", origin);
      fd.set("vibe_from_photo", vibe);
      fd.set(
        "cities",
        JSON.stringify(
          multiCity || legs.length > 1
            ? legs.map((c) => ({ name: c.name, nights: c.nights }))
            : [],
        ),
      );

      const created = await createTripAction(fd);
      if (!created.ok || !created.data) {
        toast.error(created.ok ? "Failed" : created.error);
        return;
      }

      toast.message("Grok is planning your trip… (30–60s)");
      const res = await fetch("/api/trips/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: created.data.id }),
      });
      const gen = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        paywall?: boolean;
        provider?: string;
        days?: number;
      };

      if (!res.ok || !gen.ok) {
        toast.error(gen.error || `Generation failed (${res.status})`);
        if (gen.paywall || res.status === 402) {
          setPaywall(true);
          return;
        }
        router.push(`/trips/${created.data.id}`);
        return;
      }

      toast.success(
        gen.provider
          ? `Itinerary ready · ${gen.days ?? "?"} days via ${gen.provider}`
          : "Itinerary ready",
      );
      router.push(`/trips/${created.data.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <PaywallModal open={paywall} onClose={() => setPaywall(false)} />
      <CardHeader>
        <CardTitle className="font-display text-2xl">Plan a new trip</CardTitle>
        <CardDescription>
          Step {step} of 2 — {step === 1 ? "Where & when" : "Preferences"}
        </CardDescription>
        <Link
          href="/plan/from-photo"
          className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[var(--lagoon)] hover:underline"
        >
          <ImageIcon className="h-4 w-4" />
          Or plan from a photo / Instagram export
        </Link>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={!multiCity ? "default" : "outline"}
                  onClick={() => setMultiCity(false)}
                >
                  Single city
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={multiCity ? "default" : "outline"}
                  onClick={() => setMultiCity(true)}
                >
                  Multi-city
                </Button>
              </div>

              {!multiCity ? (
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    required={!multiCity}
                    placeholder="Kyoto, Japan"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <Label>Cities & nights</Label>
                  {cities.map((c, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        placeholder={`City ${i + 1}`}
                        value={c.name}
                        onChange={(e) => {
                          const next = [...cities];
                          next[i] = { ...next[i], name: e.target.value };
                          setCities(next);
                        }}
                        required
                      />
                      <Input
                        type="number"
                        min={1}
                        max={14}
                        className="w-24"
                        value={c.nights}
                        onChange={(e) => {
                          const next = [...cities];
                          next[i] = {
                            ...next[i],
                            nights: Math.max(1, Number(e.target.value) || 1),
                          };
                          setCities(next);
                          if (startDate) syncEndDateFromCities(startDate, next);
                        }}
                        aria-label="Nights"
                      />
                      {cities.length > 1 ? (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            const next = cities.filter((_, j) => j !== i);
                            setCities(next);
                            if (startDate) syncEndDateFromCities(startDate, next);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setCities((prev) => [...prev, { name: "", nights: 2 }])
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add city
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Trip title (optional)</Label>
                <Input
                  id="title"
                  placeholder="Autumn in Japan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start">Start date</Label>
                  <Input
                    id="start"
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (multiCity) syncEndDateFromCities(e.target.value, cities);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">End date</Label>
                  <Input
                    id="end"
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget USD (optional)</Label>
                  <Input
                    id="budget"
                    type="number"
                    min={0}
                    placeholder="2500"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="origin">Flying from (optional)</Label>
                  <Input
                    id="origin"
                    placeholder="Montreal"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  />
                </div>
              </div>
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  const okDest = multiCity
                    ? cities.some((c) => c.name.trim())
                    : !!destination;
                  if (!okDest || !startDate || !endDate) {
                    toast.error("Destination and dates required");
                    return;
                  }
                  if (endDate < startDate) {
                    toast.error("End date must be after start");
                    return;
                  }
                  setStep(2);
                }}
              >
                Continue
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Pace</Label>
                <div className="flex flex-wrap gap-2">
                  {(["relaxed", "balanced", "packed"] as const).map((p) => (
                    <Button
                      key={p}
                      type="button"
                      size="sm"
                      variant={pace === p ? "default" : "outline"}
                      onClick={() => setPace(p)}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="travelers">Travelers</Label>
                <Input
                  id="travelers"
                  type="number"
                  min={1}
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Interests</Label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((i) => (
                    <Button
                      key={i}
                      type="button"
                      size="sm"
                      variant={interests.includes(i) ? "secondary" : "outline"}
                      onClick={() => toggleInterest(i)}
                    >
                      {i}
                    </Button>
                  ))}
                </div>
              </div>
              {vibe ? (
                <div className="rounded-xl border border-[var(--lagoon)]/30 bg-[var(--lagoon)]/5 p-3 text-sm">
                  <p className="text-xs font-bold uppercase tracking-wider text-[var(--lagoon)]">
                    From your photo
                  </p>
                  <p className="mt-1 text-[var(--muted)]">{vibe}</p>
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="prompt">Anything else for the AI?</Label>
                <Textarea
                  id="prompt"
                  rows={4}
                  placeholder="Vegetarian food, avoid early mornings…"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Generating itinerary…" : "Generate with AI"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
