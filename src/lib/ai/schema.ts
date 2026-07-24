import { z } from "zod";

const activityTypes = [
  "food",
  "culture",
  "nature",
  "nightlife",
  "shopping",
  "transport",
  "stay",
  "other",
] as const;

export const activitySchema = z.object({
  title: z.string(),
  description: z.string().default(""),
  type: z
    .string()
    .transform((v) => {
      const t = v.toLowerCase().trim();
      return (activityTypes as readonly string[]).includes(t) ? t : "other";
    })
    .pipe(z.enum(activityTypes)),
  start_time: z.string().default("10:00"),
  duration_min: z.coerce.number().int().positive().default(90),
  cost_cents: z.coerce.number().int().nonnegative().default(0),
  address: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
});

export const daySchema = z.object({
  day_number: z.coerce.number().int().positive(),
  summary: z.string().default(""),
  city: z.string().optional(),
  activities: z.array(activitySchema).min(1).max(10),
});

export const itinerarySchema = z.object({
  title: z.string(),
  overview: z.string().default(""),
  days: z.array(daySchema).min(1),
});

export type GeneratedItinerary = z.infer<typeof itinerarySchema>;

/** Soft-parse model output that may be slightly off-schema. */
export function parseItineraryLoose(raw: unknown): GeneratedItinerary {
  const parsed = itinerarySchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  // Last-chance repair for common shape issues
  const obj = raw as Record<string, unknown>;
  const daysIn = Array.isArray(obj?.days) ? obj.days : [];
  const repaired = {
    title: String(obj?.title || "Your trip"),
    overview: String(obj?.overview || ""),
    days: daysIn.map((d: Record<string, unknown>, i: number) => ({
      day_number: Number(d?.day_number ?? i + 1) || i + 1,
      summary: String(d?.summary || `Day ${i + 1}`),
      city: d?.city ? String(d.city) : undefined,
      activities: (Array.isArray(d?.activities) ? d.activities : []).map(
        (a: Record<string, unknown>) => ({
          title: String(a?.title || "Activity"),
          description: String(a?.description || ""),
          type: String(a?.type || "other"),
          start_time: String(a?.start_time || "10:00"),
          duration_min: Number(a?.duration_min) || 90,
          cost_cents: Number(a?.cost_cents) || 0,
          address: a?.address ? String(a.address) : undefined,
          lat: a?.lat != null ? Number(a.lat) : undefined,
          lng: a?.lng != null ? Number(a.lng) : undefined,
        }),
      ),
    })),
  };

  return itinerarySchema.parse(repaired);
}
