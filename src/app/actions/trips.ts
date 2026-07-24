"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile, requireUser } from "@/lib/auth";
import { canCreateTrip } from "@/lib/credits";
import { generateShareToken } from "@/lib/utils";
import type { TripPreferences, TripWithDetails } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/config";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export async function createTripAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      error: "Supabase is not configured. Add env vars from .env.example.",
    };
  }

  const profile = await requireProfile();
  const supabase = await createClient();

  const gate = await canCreateTrip(supabase, profile);
  if (!gate.ok) return { ok: false, error: gate.reason };

  const destination = String(formData.get("destination") || "").trim();
  const startDate = String(formData.get("start_date") || "");
  const endDate = String(formData.get("end_date") || "");
  const title =
    String(formData.get("title") || "").trim() || `${destination} Trip`;
  const budgetRaw = String(formData.get("budget") || "").trim();
  const budgetCents = budgetRaw
    ? Math.round(parseFloat(budgetRaw) * 100)
    : null;
  const pace = String(formData.get("pace") || "balanced") as TripPreferences["pace"];
  const travelers = parseInt(String(formData.get("travelers") || "2"), 10) || 2;
  const interests = String(formData.get("interests") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const prompt = String(formData.get("prompt") || "").trim();

  const origin = String(formData.get("origin") || "").trim();
  const vibeFromPhoto = String(formData.get("vibe_from_photo") || "").trim();
  let cities: { name: string; nights: number; order: number }[] = [];
  try {
    const raw = String(formData.get("cities") || "[]");
    const parsed = JSON.parse(raw) as { name: string; nights: number }[];
    if (Array.isArray(parsed) && parsed.length) {
      cities = parsed
        .filter((c) => c.name?.trim())
        .map((c, i) => ({
          name: c.name.trim(),
          nights: Math.max(1, Number(c.nights) || 2),
          order: i + 1,
        }));
    }
  } catch {
    cities = [];
  }

  if ((!destination && cities.length === 0) || !startDate || !endDate) {
    return { ok: false, error: "Destination and dates are required." };
  }

  // Multi-city destination label: "Tokyo → Kyoto → Osaka"
  const destinationLabel =
    cities.length > 1
      ? cities.map((c) => c.name).join(" → ")
      : destination || cities[0]?.name || "";

  const preferences: TripPreferences = {
    pace,
    travelers,
    interests,
    prompt: prompt || undefined,
    origin: origin || undefined,
    vibeFromPhoto: vibeFromPhoto || undefined,
    multiCity: cities.length > 1,
  };

  const { data, error } = await supabase
    .from("trips")
    .insert({
      owner_id: profile.id,
      title:
        title ||
        (cities.length > 1
          ? `${cities.map((c) => c.name).join(" → ")} trip`
          : `${destination} Trip`),
      destination: destinationLabel,
      start_date: startDate,
      end_date: endDate,
      budget_cents: budgetCents,
      preferences,
      cities,
      status: "draft",
      share_token: generateShareToken(),
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath("/trips");
  revalidatePath("/dashboard");
  return { ok: true, data: { id: data.id } };
}

/**
 * If a trip is stuck on "generating" but already has days, mark it ready.
 * Called when opening the trip workspace.
 */
export async function healStuckTripAction(tripId: string): Promise<{
  healed: boolean;
  status: string;
}> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: trip } = await supabase
    .from("trips")
    .select("id, status, owner_id")
    .eq("id", tripId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!trip) return { healed: false, status: "missing" };

  if (trip.status !== "generating" && trip.status !== "failed") {
    return { healed: false, status: trip.status };
  }

  const { count } = await supabase
    .from("days")
    .select("*", { count: "exact", head: true })
    .eq("trip_id", tripId);

  if ((count ?? 0) > 0) {
    const { error } = await supabase
      .from("trips")
      .update({
        status: "ready",
        error_message: null,
      })
      .eq("id", tripId)
      .eq("owner_id", user.id);

    if (!error) {
      revalidatePath(`/trips/${tripId}`);
      revalidatePath("/trips");
      revalidatePath("/dashboard");
      return { healed: true, status: "ready" };
    }
  }

  return { healed: false, status: trip.status };
}

export async function getTripWithDetails(
  tripId: string,
): Promise<TripWithDetails | null> {
  if (!isSupabaseConfigured()) return null;
  const user = await requireUser();
  const supabase = await createClient();

  // Auto-heal stuck generating trips that already have content
  await healStuckTripAction(tripId);

  // RLS allows owner or accepted collaborator
  const { data: trip, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .single();

  if (error || !trip) return null;
  void user;

  const { data: days } = await supabase
    .from("days")
    .select("*")
    .eq("trip_id", tripId)
    .order("day_order", { ascending: true });

  const dayIds = (days ?? []).map((d) => d.id);
  let activities: TripWithDetails["days"][0]["activities"] = [];
  if (dayIds.length) {
    const { data: acts } = await supabase
      .from("activities")
      .select("*")
      .in("day_id", dayIds)
      .order("sort_order", { ascending: true });
    activities = (acts ?? []) as TripWithDetails["days"][0]["activities"];
  }

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true });

  return {
    ...trip,
    days: (days ?? []).map((d) => ({
      ...d,
      activities: activities.filter((a) => a.day_id === d.id),
    })),
    expenses: expenses ?? [],
  } as TripWithDetails;
}

export async function listTripsAction() {
  if (!isSupabaseConfigured()) return [];
  const user = await requireUser();
  const supabase = await createClient();

  // Heal any stuck generating trips that already have days
  const { data: stuck } = await supabase
    .from("trips")
    .select("id")
    .eq("owner_id", user.id)
    .eq("status", "generating");

  if (stuck?.length) {
    for (const t of stuck) {
      await healStuckTripAction(t.id);
    }
  }

  // RLS returns owned trips + accepted collaborations
  const { data } = await supabase
    .from("trips")
    .select("*")
    .order("updated_at", { ascending: false });
  void user;
  return data ?? [];
}

export async function updateTripNotesAction(
  tripId: string,
  notes: string,
): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("trips")
    .update({ notes })
    .eq("id", tripId)
    .eq("owner_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/trips/${tripId}`);
  return { ok: true };
}

export async function markTripReadyAction(
  tripId: string,
): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("trips")
    .update({ status: "ready", error_message: null })
    .eq("id", tripId)
    .eq("owner_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/trips");
  return { ok: true };
}

export async function ensureShareTokenAction(
  tripId: string,
): Promise<ActionResult<{ token: string }>> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: trip } = await supabase
    .from("trips")
    .select("share_token")
    .eq("id", tripId)
    .eq("owner_id", user.id)
    .single();

  if (!trip) return { ok: false, error: "Trip not found" };

  if (trip.share_token) {
    return { ok: true, data: { token: trip.share_token } };
  }

  const token = generateShareToken();
  const { error } = await supabase
    .from("trips")
    .update({ share_token: token })
    .eq("id", tripId);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/trips/${tripId}`);
  return { ok: true, data: { token } };
}

export async function deleteTripAction(tripId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase.from("trips").delete().eq("id", tripId).eq("owner_id", user.id);
  revalidatePath("/trips");
  revalidatePath("/dashboard");
  redirect("/trips");
}
