import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileRow } from "@/lib/auth";
import { getPlanningModel, getAiProviderLabel } from "@/lib/ai/model";
import { isAiConfigured, isSupabaseConfigured } from "@/lib/config";
import { fallbackCoords } from "@/lib/mapbox";

export const maxDuration = 60;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const dayOnlySchema = z.object({
  summary: z.string(),
  activities: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().default(""),
        type: z.string().default("other"),
        start_time: z.string().default("10:00"),
        duration_min: z.coerce.number().default(90),
        cost_cents: z.coerce.number().default(0),
        address: z.string().optional(),
        lat: z.coerce.number().optional(),
        lng: z.coerce.number().optional(),
      }),
    )
    .min(2)
    .max(8),
});

export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Supabase not configured" },
        { status: 500 },
      );
    }
    const body = await req.json();
    const tripId = body.tripId as string;
    const dayId = body.dayId as string;
    if (!tripId || !dayId) {
      return NextResponse.json(
        { ok: false, error: "tripId and dayId required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Not signed in" },
        { status: 401 },
      );
    }
    await ensureProfileRow(user.id, user.email);

    const { data: trip } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .single();
    if (!trip || trip.owner_id !== user.id) {
      return NextResponse.json(
        { ok: false, error: "Only owner can regenerate" },
        { status: 403 },
      );
    }

    const { data: day } = await supabase
      .from("days")
      .select("*")
      .eq("id", dayId)
      .eq("trip_id", tripId)
      .single();
    if (!day) {
      return NextResponse.json(
        { ok: false, error: "Day not found" },
        { status: 404 },
      );
    }

    const model = getPlanningModel();
    if (!model || !isAiConfigured()) {
      return NextResponse.json(
        { ok: false, error: "AI not configured" },
        { status: 503 },
      );
    }

    let dayPlan: z.infer<typeof dayOnlySchema> | null = null;

    try {
      const { output } = await generateText({
        model,
        system: `You plan a single day of a trip. Return structured activities only.`,
        prompt: `Regenerate Day ${day.day_order} (${day.date}) for a trip to ${trip.destination}.
Trip title: ${trip.title}
Preferences: ${JSON.stringify(trip.preferences || {})}
Create 3-5 realistic activities for this one day only.`,
        output: Output.object({ schema: dayOnlySchema }),
        maxOutputTokens: 2000,
        temperature: 0.7,
      });
      dayPlan = output;
    } catch {
      const { text } = await generateText({
        model,
        prompt: `JSON only for one day in ${trip.destination}: {"summary":"...","activities":[{"title":"...","description":"...","type":"culture","start_time":"09:00","duration_min":90,"cost_cents":0}]} 3-5 activities.`,
        maxOutputTokens: 2000,
      });
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      dayPlan = dayOnlySchema.parse(JSON.parse(text.slice(start, end + 1)));
    }

    if (!dayPlan) {
      return NextResponse.json(
        { ok: false, error: "Empty AI response" },
        { status: 500 },
      );
    }

    await supabase.from("activities").delete().eq("day_id", dayId);
    await supabase
      .from("days")
      .update({ notes: dayPlan.summary })
      .eq("id", dayId);

    let i = 0;
    const rows = dayPlan.activities.map((a, idx) => {
      const fb = fallbackCoords(trip.destination, i++);
      const type = [
        "food",
        "culture",
        "nature",
        "nightlife",
        "shopping",
        "transport",
        "stay",
        "other",
      ].includes(String(a.type).toLowerCase())
        ? String(a.type).toLowerCase()
        : "other";
      return {
        day_id: dayId,
        title: a.title,
        description: a.description ?? "",
        type,
        start_time: a.start_time ?? "10:00",
        duration_min: a.duration_min ?? 90,
        cost_cents: a.cost_cents ?? 0,
        lat: a.lat ?? fb.lat,
        lng: a.lng ?? fb.lng,
        address: a.address ?? null,
        sort_order: idx,
      };
    });

    if (rows.length) {
      const { error } = await supabase.from("activities").insert(rows);
      if (error) throw new Error(error.message);
    }

    return NextResponse.json({
      ok: true,
      activities: rows.length,
      provider: getAiProviderLabel(),
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Day regen failed",
      },
      { status: 500 },
    );
  }
}
