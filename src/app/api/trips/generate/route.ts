import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileRow } from "@/lib/auth";
import { generateItinerary } from "@/lib/ai/generate";
import {
  canGenerate,
  ensureCreditsReset,
  incrementGeneration,
} from "@/lib/credits";
import { fallbackCoords } from "@/lib/mapbox";
import type { TripPreferences } from "@/lib/types";
import { isAiConfigured, isResendConfigured, isSupabaseConfigured } from "@/lib/config";
import { getAiProviderLabel } from "@/lib/ai/model";
import { sendTripReadyEmail } from "@/lib/email";
import type { SupabaseClient } from "@supabase/supabase-js";

export const maxDuration = 60;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function setTripStatus(
  supabase: SupabaseClient,
  tripId: string,
  ownerId: string,
  patch: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from("trips")
    .update(patch)
    .eq("id", tripId)
    .eq("owner_id", ownerId)
    .select("id, status")
    .maybeSingle();

  if (error) {
    throw new Error(`Trip update failed: ${error.message}`);
  }
  if (!data) {
    throw new Error("Trip update affected 0 rows (check RLS / ownership)");
  }
  return data;
}

export async function POST(req: Request) {
  let tripIdForError: string | undefined;
  let ownerIdForError: string | undefined;
  let wroteItinerary = false;

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
    ownerIdForError = profile.id;
    try {
      profile = await ensureCreditsReset(supabase, profile);
    } catch {
      /* non-fatal */
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

    await setTripStatus(supabase, tripId, profile.id, {
      status: "generating",
      error_message: null,
    });

    if (!isAiConfigured()) {
      console.warn("[generate] XAI_API_KEY missing in runtime env");
    }

    const preferences = (trip.preferences || {}) as TripPreferences;
    const cities = (Array.isArray(trip.cities) ? trip.cities : []) as {
      name: string;
      nights: number;
      order: number;
    }[];
    const itinerary = await generateItinerary({
      destination: trip.destination,
      startDate: trip.start_date,
      endDate: trip.end_date,
      budgetCents: trip.budget_cents,
      preferences,
      cities,
    });

    // Clear previous days
    const { error: delErr } = await supabase
      .from("days")
      .delete()
      .eq("trip_id", tripId);
    if (delErr) throw new Error(`Clear days failed: ${delErr.message}`);

    const start = new Date(trip.start_date + "T12:00:00");
    let activityIndex = 0;
    let totalActivities = 0;

    for (const day of itinerary.days) {
      const date = new Date(start);
      date.setDate(start.getDate() + (day.day_number - 1));
      const dateStr = date.toISOString().slice(0, 10);
      const cityName =
        day.city ||
        cities.find((c) => c.order === day.day_number)?.name ||
        cities[0]?.name ||
        trip.destination.split(/→|->/)[0]?.trim() ||
        trip.destination;

      const { data: dayRow, error: dayErr } = await supabase
        .from("days")
        .insert({
          trip_id: tripId,
          date: dateStr,
          day_order: day.day_number,
          notes: day.summary,
          city: cityName,
        })
        .select("id")
        .single();

      if (dayErr || !dayRow) {
        throw new Error(dayErr?.message || "Failed to insert day");
      }

      const activityRows = day.activities.map((a, i) => {
        const fb = fallbackCoords(cityName, activityIndex++);
        return {
          day_id: dayRow.id,
          title: a.title,
          description: a.description ?? "",
          type: a.type,
          start_time: a.start_time ?? "10:00",
          duration_min: a.duration_min ?? 90,
          cost_cents: a.cost_cents ?? 0,
          lat: a.lat ?? fb.lat,
          lng: a.lng ?? fb.lng,
          address: a.address ?? null,
          sort_order: i,
        };
      });

      if (activityRows.length) {
        const { error: actErr } = await supabase
          .from("activities")
          .insert(activityRows);
        if (actErr) throw new Error(`Activity insert failed: ${actErr.message}`);
        totalActivities += activityRows.length;
      }
    }

    wroteItinerary = totalActivities > 0 || itinerary.days.length > 0;

    // Mark ready ASAP so UI never stays stuck on "generating"
    const overview = `${itinerary.overview}\n\n— Planned with ${getAiProviderLabel()}`;
    await setTripStatus(supabase, tripId, profile.id, {
      status: "ready",
      title: itinerary.title || trip.title,
      notes: overview,
      error_message: null,
    });

    // Best-effort expenses (must not leave trip stuck)
    try {
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
          const { error: expErr } = await supabase
            .from("expenses")
            .insert(expenses);
          if (expErr) {
            console.warn("[generate] expenses insert:", expErr.message);
          }
        }
      }
    } catch (exp) {
      console.warn("[generate] expenses skipped:", exp);
    }

    if (profile.plan !== "pro") {
      try {
        await incrementGeneration(supabase, profile.id);
      } catch {
        /* non-fatal */
      }
    }

    // Best-effort trip-ready email
    if (isResendConfigured() && user.email) {
      void sendTripReadyEmail({
        to: user.email,
        tripTitle: itinerary.title || trip.title || trip.destination,
        tripId,
        destination: trip.destination,
      }).catch((mailErr) =>
        console.warn("[generate] trip-ready email skipped", mailErr),
      );
    }

    return NextResponse.json({
      ok: true,
      days: itinerary.days.length,
      activities: totalActivities,
      provider: getAiProviderLabel(),
      status: "ready",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    console.error("[generate]", message);

    if (tripIdForError && isSupabaseConfigured()) {
      try {
        const supabase = await createClient();
        // If we already wrote days, force ready so the trip isn't stuck
        if (wroteItinerary && ownerIdForError) {
          await setTripStatus(supabase, tripIdForError, ownerIdForError, {
            status: "ready",
            error_message: `Completed with warnings: ${message}`,
          });
        } else if (ownerIdForError) {
          await setTripStatus(supabase, tripIdForError, ownerIdForError, {
            status: "failed",
            error_message: message,
          });
        } else {
          await supabase
            .from("trips")
            .update({ status: "failed", error_message: message })
            .eq("id", tripIdForError);
        }
      } catch (err2) {
        console.error("[generate] status recovery failed", err2);
      }
    }

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
