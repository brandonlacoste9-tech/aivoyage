import { z } from "zod";

export const activitySchema = z.object({
  title: z.string(),
  description: z.string(),
  type: z.enum([
    "food",
    "culture",
    "nature",
    "nightlife",
    "shopping",
    "transport",
    "stay",
    "other",
  ]),
  start_time: z.string().describe("HH:MM 24h local time"),
  duration_min: z.number().int().positive(),
  cost_cents: z.number().int().nonnegative(),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const daySchema = z.object({
  day_number: z.number().int().positive(),
  summary: z.string(),
  activities: z.array(activitySchema).min(2).max(8),
});

export const itinerarySchema = z.object({
  title: z.string(),
  overview: z.string(),
  days: z.array(daySchema).min(1),
});

export type GeneratedItinerary = z.infer<typeof itinerarySchema>;
