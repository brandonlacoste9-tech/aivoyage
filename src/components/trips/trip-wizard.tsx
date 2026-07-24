"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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

export function TripWizard({
  defaultDestination = "",
  defaultPrompt = "",
}: {
  defaultDestination?: string;
  defaultPrompt?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState(defaultDestination);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [pace, setPace] = useState("balanced");
  const [travelers, setTravelers] = useState("2");
  const [interests, setInterests] = useState<string[]>(["food", "culture"]);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [paywall, setPaywall] = useState(false);

  function toggleInterest(i: string) {
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i],
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("destination", destination);
      fd.set("title", title);
      fd.set("start_date", startDate);
      fd.set("end_date", endDate);
      fd.set("budget", budget);
      fd.set("pace", pace);
      fd.set("travelers", travelers);
      fd.set("interests", interests.join(","));
      fd.set("prompt", prompt);

      const created = await createTripAction(fd);
      if (!created.ok || !created.data) {
        toast.error(created.ok ? "Failed" : created.error);
        return;
      }

      toast.message("Grok is planning your trip… (30–60s)");
      // Use API route (maxDuration 60s) — more reliable on Netlify than Server Actions
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
        activities?: number;
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
        <CardTitle>Plan a new trip</CardTitle>
        <CardDescription>
          Step {step} of 2 — {step === 1 ? "Where & when" : "Preferences"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  required
                  placeholder="Kyoto, Japan"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Trip title (optional)</Label>
                <Input
                  id="title"
                  placeholder="Autumn in Kyoto"
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
                    onChange={(e) => setStartDate(e.target.value)}
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
              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  if (!destination || !startDate || !endDate) {
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
              <div className="space-y-2">
                <Label htmlFor="prompt">Anything else for the AI?</Label>
                <Textarea
                  id="prompt"
                  rows={4}
                  placeholder="Vegetarian food, avoid early mornings, love photography…"
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
