import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileRow } from "@/lib/auth";
import { generateItinerary } from "@/lib/ai/generate";
import {
  canGenerate,
  ensureCreditsReset,
  incrementGeneration,
} from "@/lib/credits";
import { fallbackCoords, geocodePlace } from "@/lib/mapbox";
import type { TripPreferences } from "@/lib/types";
import { isAiConfigured, isSupabaseConfigured } from "@/lib/config";
import { getAiProviderLabel } from "@/lib/ai/model";

// Netlify / Vercel: allow longer AI runs (plan-dependent cap applies)
export const maxDuration = 60;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let tripIdForError: string | undefined;
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Supabase is not configured." },
        { status: 500 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const tripId = body.tripId as string | undefined;
    tripIdForError = tripId;
    if (!tripId) {
      return NextResponse.json(
        { ok: false, error: "tripId is required" },
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

    let profile = await ensureProfileRow(user.id, user.email);
    try {
      profile = await ensureCreditsReset(supabase, profile);
    } catch {
      // non-fatal if reset fails
    }

    const gate = canGenerate(profile);
    if (!gate.ok) {
      return NextResponse.json(
        { ok: false, error: gate.reason, paywall: true },
        { status: 402 },
      );
    }

    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .eq("owner_id", profile.id)
      .single();

    if (tripError || !trip) {
      return NextResponse.json(
        { ok: false, error: "Trip not found" },
        { status: 404 },
      );
    }

    await supabase
      .from("trips")
      .update({ status: "generating", error_message: null })
      .eq("id", tripId);

    if (!isAiConfigured()) {
      console.warn("[generate] XAI_API_KEY missing in runtime env");
    }

    const preferences = (trip.preferences || {}) as TripPreferences;
    const itinerary = await generateItinerary({
      destination: trip.destination,
      startDate: trip.start_date,
      endDate: trip.end_date,
      budgetCents: trip.budget_cents,
      preferences,
    });

    await supabase.from("days").delete().eq("trip_id", tripId);

    const start = new Date(trip.start_date + "T12:00:00");
    let activityIndex = 0;
    let totalActivities = 0;

    for (const day of itinerary.days) {
      const date = new Date(start);
      date.setDate(start.getDate() + (day.day_number - 1));
      const dateStr = date.toISOString().slice(0, 10);

      const { data: dayRow, error: dayErr } = await supabase
        .from("days")
        .insert({
          trip_id: tripId,
          date: dateStr,
          day_order: day.day_number,
          notes: day.summary,
        })
        .select("id")
        .single();

      if (dayErr || !dayRow) {
        throw new Error(dayErr?.message || "Failed to insert day");
      }

      const activityRows = [];
      for (let i = 0; i < day.activities.length; i++) {
        const a = day.activities[i];
        let lat = a.lat ?? null;
        let lng = a.lng ?? null;

        // Only geocode when Mapbox is configured — skip network otherwise
        if ((lat == null || lng == null) && process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
          try {
            const geo = await geocodePlace(a.title, trip.destination);
            if (geo) {
              lat = geo.lat;
              lng = geo.lng;
            }
          } catch {
            /* ignore */
          }
        }
        if (lat == null || lng == null) {
          const fb = fallbackCoords(trip.destination, activityIndex);
          lat = fb.lat;
          lng = fb.lng;
        }
        activityIndex += 1;

        activityRows.push({
          day_id: dayRow.id,
          title: a.title,
          description: a.description,
          type: a.type,
          start_time: a.start_time,
          duration_min: a.duration_min,
          cost_cents: a.cost_cents,
          lat,
          lng,
          address: a.address ?? null,
          sort_order: i,
        });
      }

      if (activityRows.length) {
        const { error: actErr } = await supabase
          .from("activities")
          .insert(activityRows);
        if (actErr) throw new Error(actErr.message);
        totalActivities += activityRows.length;
      }
    }

    // Seed expenses
    const { data: allDays } = await supabase
      .from("days")
      .select("id")
      .eq("trip_id", tripId);
    const dayIds = (allDays ?? []).map((d) => d.id);
    if (dayIds.length) {
      const { data: acts } = await supabase
        .from("activities")
        .select("id, cost_cents, type, title")
        .in("day_id", dayIds);
      const expenses = (acts ?? [])
        .filter((a) => (a.cost_cents ?? 0) > 0)
        .map((a) => ({
          trip_id: tripId,
          activity_id: a.id,
          amount_cents: a.cost_cents,
          category: a.type,
          note: a.title,
        }));
      if (expenses.length) {
        await supabase.from("expenses").delete().eq("trip_id", tripId);
        await supabase.from("expenses").insert(expenses);
      }
    }

    const overview = `${itinerary.overview}\n\n— Planned with ${getAiProviderLabel()}`;

    await supabase
      .from("trips")
      .update({
        status: "ready",
        title: itinerary.title || trip.title,
        notes: overview,
        error_message: null,
      })
      .eq("id", tripId);

    if (profile.plan !== "pro") {
      try {
        await incrementGeneration(supabase, profile.id);
      } catch {
        /* non-fatal */
      }
    }

    return NextResponse.json({
      ok: true,
      days: itinerary.days.length,
      activities: totalActivities,
      provider: getAiProviderLabel(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    console.error("[generate]", message);

    if (tripIdForError && isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        await supabase
          .from("trips")
          .update({ status: "failed", error_message: message })
          .eq("id", tripIdForError);
      } catch {
        /* ignore */
      }
    }

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
