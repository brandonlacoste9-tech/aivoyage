"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const examples = [
  "Plan a 7-day food & culture trip to Kyoto in autumn…",
  "Romantic 5-day Lisbon getaway with walks and wine…",
  "Family-friendly Bali week: beaches, temples, rice terraces…",
];

export function HeroPrompt({ signedIn }: { signedIn: boolean }) {
  const [value, setValue] = useState("");
  const [hint] = useState(
    () => examples[Math.floor(Math.random() * examples.length)],
  );
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim() || hint;
    if (signedIn) {
      router.push(`/trips/new?prompt=${encodeURIComponent(q)}`);
    } else {
      router.push(`/auth/sign-up?prompt=${encodeURIComponent(q)}`);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="glass mx-auto flex w-full max-w-2xl flex-col gap-3 rounded-2xl p-3 shadow-xl sm:flex-row sm:items-center sm:p-2"
    >
      <div className="flex flex-1 items-center gap-2 px-2">
        <Sparkles className="h-5 w-5 shrink-0 text-indigo-500" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={hint}
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
          aria-label="Describe your trip"
        />
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Plan with AI
      </Button>
    </form>
  );
}
