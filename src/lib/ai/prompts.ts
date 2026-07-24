import type { TripCity, TripPreferences } from "@/lib/types";

export function buildGenerateSystemPrompt(multiCity?: boolean) {
  return `You are Trip Planner, an expert travel planner for trip-planner.co. Create realistic, day-by-day itineraries with real-feeling place names and practical timing.

Rules:
- ${multiCity ? "This is a MULTI-CITY trip. Each day MUST include a \"city\" field matching one of the itinerary cities. Group consecutive days in the same city; include realistic travel days between cities (type: transport)." : "Prefer walkable clusters per day; avoid unrealistic multi-city hops."}
- Mix activity types when interests allow.
- Include approximate costs in USD cents.
- Provide lat/lng when you know approximate coordinates for major landmarks; omit if unsure.
- start_time must be HH:MM 24-hour format.
- Be specific (named venues, neighborhoods) rather than generic.
- Respect the traveler pace: relaxed = fewer activities, packed = more.`;
}

export function buildGenerateUserPrompt(input: {
  destination: string;
  startDate: string;
  endDate: string;
  budgetCents: number | null;
  preferences: TripPreferences;
  dayCount: number;
  cities?: TripCity[];
}) {
  const interests = input.preferences.interests?.join(", ") || "general sightseeing";
  const pace = input.preferences.pace || "balanced";
  const travelers = input.preferences.travelers || 2;
  const style = input.preferences.style || "independent";
  const freeText = input.preferences.prompt || "";
  const vibe = input.preferences.vibeFromPhoto || "";
  const budget =
    input.budgetCents != null
      ? `Budget about $${(input.budgetCents / 100).toFixed(0)} total`
      : "Flexible budget";

  const cityBlock =
    input.cities && input.cities.length > 1
      ? `Multi-city route (respect nights per city):
${input.cities
  .map(
    (c, i) =>
      `${i + 1}. ${c.name} — ${c.nights} night${c.nights === 1 ? "" : "s"}`,
  )
  .join("\n")}
Total days must be ${input.dayCount}. Assign each day a "city" field.
Include at least one transport activity when changing cities.`
      : `Destination: ${input.destination}`;

  return `Plan a ${input.dayCount}-day trip.
${cityBlock}
Dates: ${input.startDate} → ${input.endDate}
${budget}
Travelers: ${travelers}
Pace: ${pace}
Interests: ${interests}
Style: ${style}
${vibe ? `Visual vibe from user photo: ${vibe}` : ""}
${freeText ? `Extra notes: ${freeText}` : ""}

Return a complete structured itinerary with exactly ${input.dayCount} days.
Each day object may include "city": string for multi-city trips.`;
}

export function buildChatSystemPrompt(itineraryJson: string) {
  return `You are the Trip Planner assistant on trip-planner.co. Help the traveler refine their itinerary conversationally.

Current itinerary JSON:
${itineraryJson}

Be concise, practical, and enthusiastic. When suggesting changes, be specific about which day/activity. If they ask you to change the plan, describe the changes clearly so they can apply them.`;
}

export function buildPhotoVibeSystemPrompt() {
  return `You analyze travel photos (Instagram-style, landscapes, food, cities) and extract planning signals.
Return JSON with: destination_guess, vibe (2-3 sentences), interests (array of tags), pace, suggested_days (number 3-10), prompt (ready-to-use trip brief for an itinerary AI).`;
}
