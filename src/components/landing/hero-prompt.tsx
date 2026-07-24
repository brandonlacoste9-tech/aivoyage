"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const examples = [
  "7 days in Kyoto — temples at dawn, kaiseki at night, no tourist traps…",
  "Lisbon for two: miradouros, natural wine, one lazy beach day…",
  "Bali week with kids: villas, rice terraces, early bedtimes…",
  "Rome in autumn: history mornings, long lunches, zero FOMO…",
];

export function HeroPrompt({ signedIn }: { signedIn: boolean }) {
  const [value, setValue] = useState("");
  const [index, setIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % examples.length);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim() || examples[index];
    if (signedIn) {
      router.push(`/trips/new?prompt=${encodeURIComponent(q)}`);
    } else {
      router.push(`/auth/sign-up?prompt=${encodeURIComponent(q)}`);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="glass mx-auto w-full max-w-2xl rounded-[1.75rem] p-2 sm:p-2.5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3 px-3 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--lagoon)]/10 text-[var(--lagoon)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Describe the trip you actually want
            </p>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={examples[index]}
              className="mt-0.5 h-auto border-0 bg-transparent p-0 text-base shadow-none placeholder:text-[var(--muted)]/80 focus-visible:ring-0"
              aria-label="Describe your trip"
            />
          </div>
        </div>
        <Button type="submit" size="lg" variant="accent" className="shrink-0">
          Craft itinerary
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
