import { generateText, Output } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { isAnthropicConfigured } from "@/lib/config";
import { daysBetween } from "@/lib/utils";
import type { TripPreferences } from "@/lib/types";
import {
  itinerarySchema,
  type GeneratedItinerary,
} from "@/lib/ai/schema";
import {
  buildGenerateSystemPrompt,
  buildGenerateUserPrompt,
} from "@/lib/ai/prompts";

function mockItinerary(input: {
  destination: string;
  startDate: string;
  endDate: string;
  preferences: TripPreferences;
}): GeneratedItinerary {
  const count = daysBetween(input.startDate, input.endDate);
  const interests = input.preferences.interests?.length
    ? input.preferences.interests
    : ["culture", "food"];

  const templates = [
    {
      title: `Morning in ${input.destination}`,
      type: "culture" as const,
      description: `Explore a signature neighborhood and landmark of ${input.destination}.`,
      cost: 0,
    },
    {
      title: "Local lunch",
      type: "food" as const,
      description: `Sample regional specialties — great for ${interests[0]} lovers.`,
      cost: 3500,
    },
    {
      title: "Afternoon wander",
      type: "nature" as const,
      description: "Parks, viewpoints, or a scenic walk with photo stops.",
      cost: 0,
    },
    {
      title: "Dinner & evening",
      type: "food" as const,
      description: "Reservation-friendly dinner and a relaxed evening stroll.",
      cost: 7000,
    },
  ];

  const start = new Date(input.startDate);
  const days = Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      day_number: i + 1,
      summary: `Day ${i + 1} in ${input.destination} — ${interests.join(" & ")} focus`,
      activities: templates.map((t, idx) => ({
        title: t.title,
        description: t.description,
        type: t.type,
        start_time: ["09:00", "12:30", "15:00", "19:00"][idx],
        duration_min: [120, 90, 120, 120][idx],
        cost_cents: t.cost,
        address: input.destination,
      })),
    };
  });

  return {
    title: `${input.destination} Escape`,
    overview: `A curated ${count}-day journey through ${input.destination}, generated in demo mode (no ANTHROPIC_API_KEY). Connect Claude for richer place-specific plans.`,
    days,
  };
}

export async function generateItinerary(input: {
  destination: string;
  startDate: string;
  endDate: string;
  budgetCents: number | null;
  preferences: TripPreferences;
}): Promise<GeneratedItinerary> {
  const dayCount = daysBetween(input.startDate, input.endDate);

  if (!isAnthropicConfigured()) {
    return mockItinerary(input);
  }

  const { output } = await generateText({
    model: anthropic("claude-sonnet-4-5"),
    system: buildGenerateSystemPrompt(),
    prompt: buildGenerateUserPrompt({ ...input, dayCount }),
    output: Output.object({ schema: itinerarySchema }),
  });

  if (!output) {
    throw new Error("AI returned empty itinerary");
  }

  return output;
}
