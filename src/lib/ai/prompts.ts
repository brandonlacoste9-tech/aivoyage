import type { TripPreferences } from "@/lib/types";

export function buildGenerateSystemPrompt() {
  return `You are Trip Planner, an expert travel planner for trip-planner.co. Create realistic, day-by-day itineraries with real-feeling place names and practical timing.

Rules:
- Prefer walkable clusters per day; avoid unrealistic multi-city hops.
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
}) {
  const interests = input.preferences.interests?.join(", ") || "general sightseeing";
  const pace = input.preferences.pace || "balanced";
  const travelers = input.preferences.travelers || 2;
  const style = input.preferences.style || "independent";
  const freeText = input.preferences.prompt || "";
  const budget =
    input.budgetCents != null
      ? `Budget about $${(input.budgetCents / 100).toFixed(0)} total`
      : "Flexible budget";

  return `Plan a ${input.dayCount}-day trip to ${input.destination}.
Dates: ${input.startDate} → ${input.endDate}
${budget}
Travelers: ${travelers}
Pace: ${pace}
Interests: ${interests}
Style: ${style}
${freeText ? `Extra notes: ${freeText}` : ""}

Return a complete structured itinerary with exactly ${input.dayCount} days.`;
}

export function buildChatSystemPrompt(itineraryJson: string) {
  return `You are the Trip Planner assistant on trip-planner.co. Help the traveler refine their itinerary conversationally.

Current itinerary JSON:
${itineraryJson}

Be concise, practical, and enthusiastic. When suggesting changes, be specific about which day/activity. If they ask you to change the plan, describe the changes clearly so they can apply them.`;
}
