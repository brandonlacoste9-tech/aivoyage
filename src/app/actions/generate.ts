"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { generateItinerary } from "@/lib/ai/generate";
import {
  canGenerate,
  ensureCreditsReset,
  incrementGeneration,
} from "@/lib/credits";
import { fallbackCoords, geocodePlace } from "@/lib/mapbox";
import type { TripPreferences } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/config";

export async function generateItineraryAction(
  tripId: string,
): Promise<{ ok: true } | { ok: false; error: string; paywall?: boolean }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  let profile = await requireProfile();
  const supabase = await createClient();
  profile = await ensureCreditsReset(supabase, profile);

  const gate = canGenerate(profile);
  if (!gate.ok) {
    return { ok: false, error: gate.reason, paywall: true };
  }

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .eq("owner_id", profile.id)
    .single();

  if (tripError || !trip) {
    return { ok: false, error: "Trip not found" };
  }

  await supabase
    .from("trips")
    .update({ status: "generating", error_message: null })
    .eq("id", tripId);

  try {
    const preferences = (trip.preferences || {}) as TripPreferences;
    const itinerary = await generateItinerary({
      destination: trip.destination,
      startDate: trip.start_date,
      endDate: trip.end_date,
      budgetCents: trip.budget_cents,
      preferences,
    });

    // Clear previous days (cascade activities)
    await supabase.from("days").delete().eq("trip_id", tripId);

    const start = new Date(trip.start_date);
    let activityIndex = 0;

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

      if (dayErr || !dayRow) throw dayErr || new Error("Failed to insert day");

      const activityRows = [];
      for (let i = 0; i < day.activities.length; i++) {
        const a = day.activities[i];
        let lat = a.lat ?? null;
        let lng = a.lng ?? null;

        if (lat == null || lng == null) {
          const geo = await geocodePlace(a.title, trip.destination);
          if (geo) {
            lat = geo.lat;
            lng = geo.lng;
          } else {
            const fb = fallbackCoords(trip.destination, activityIndex);
            lat = fb.lat;
            lng = fb.lng;
          }
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
        if (actErr) throw actErr;
      }
    }

    // Seed expenses from activity costs
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

    await supabase
      .from("trips")
      .update({
        status: "ready",
        title: itinerary.title || trip.title,
        notes: itinerary.overview,
      })
      .eq("id", tripId);

    if (profile.plan !== "pro") {
      await incrementGeneration(supabase, profile.id);
    }

    revalidatePath(`/trips/${tripId}`);
    revalidatePath("/dashboard");
    revalidatePath("/trips");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    await supabase
      .from("trips")
      .update({ status: "failed", error_message: message })
      .eq("id", tripId);
    revalidatePath(`/trips/${tripId}`);
    return { ok: false, error: message };
  }
}
