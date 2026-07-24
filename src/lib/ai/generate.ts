import { generateText, Output } from "ai";
import { isAiConfigured } from "@/lib/config";
import { daysBetween } from "@/lib/utils";
import type { TripCity, TripPreferences } from "@/lib/types";
import {
  itinerarySchema,
  parseItineraryLoose,
  type GeneratedItinerary,
} from "@/lib/ai/schema";
import {
  buildGenerateSystemPrompt,
  buildGenerateUserPrompt,
} from "@/lib/ai/prompts";
import { getAiProviderLabel, getPlanningModel } from "@/lib/ai/model";

function mockItinerary(input: {
  destination: string;
  startDate: string;
  endDate: string;
  preferences: TripPreferences;
}): GeneratedItinerary {
  const count = Math.min(daysBetween(input.startDate, input.endDate), 7);
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
    overview: `Demo itinerary for ${input.destination} (AI key missing or unavailable).`,
    days,
  };
}

function extractJsonObject(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model did not return JSON");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

export async function generateItinerary(input: {
  destination: string;
  startDate: string;
  endDate: string;
  budgetCents: number | null;
  preferences: TripPreferences;
  cities?: TripCity[];
}): Promise<GeneratedItinerary> {
  // Cap length so serverless functions finish before platform timeouts
  const dayCount = Math.min(daysBetween(input.startDate, input.endDate), 10);
  const model = getPlanningModel();
  const multi =
    (input.cities && input.cities.length > 1) ||
    !!input.preferences.multiCity;

  if (!model || !isAiConfigured()) {
    console.warn("[trip-planner] AI not configured — using mock itinerary");
    return mockItinerary(input);
  }

  const system = buildGenerateSystemPrompt(multi);
  const prompt = buildGenerateUserPrompt({ ...input, dayCount });
  const provider = getAiProviderLabel();

  // Path 1: structured object (preferred)
  try {
    const { output } = await generateText({
      model,
      system,
      prompt,
      output: Output.object({ schema: itinerarySchema }),
      maxOutputTokens: 4096,
      temperature: 0.7,
    });

    if (output) {
      return parseItineraryLoose(output);
    }
  } catch (e) {
    console.warn(
      `[voyageai] structured output failed (${provider}):`,
      e instanceof Error ? e.message : e,
    );
  }

  // Path 2: free-form JSON + loose parse
  try {
    const { text } = await generateText({
      model,
      system: `${system}

Return ONLY a single JSON object (no markdown) matching:
{
  "title": string,
  "overview": string,
  "days": [
    {
      "day_number": number,
      "summary": string,
      "activities": [
        {
          "title": string,
          "description": string,
          "type": "food"|"culture"|"nature"|"nightlife"|"shopping"|"transport"|"stay"|"other",
          "start_time": "HH:MM",
          "duration_min": number,
          "cost_cents": number,
          "address"?: string,
          "lat"?: number,
          "lng"?: number
        }
      ]
    }
  ]
}
Exactly ${dayCount} days. At least 3 activities per day.`,
      prompt,
      maxOutputTokens: 4096,
      temperature: 0.6,
    });

    const json = extractJsonObject(text);
    return parseItineraryLoose(json);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`AI generation failed (${provider}): ${msg}`);
  }
}
