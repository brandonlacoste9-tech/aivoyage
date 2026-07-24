"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { Activity, ActivityType } from "@/lib/types";

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

async function assertTripAccess(tripId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: trip } = await supabase
    .from("trips")
    .select("id, owner_id")
    .eq("id", tripId)
    .single();
  if (!trip) throw new Error("Trip not found");
  return { user, supabase, trip };
}

export async function updateActivityAction(input: {
  activityId: string;
  tripId: string;
  patch: Partial<{
    title: string;
    description: string | null;
    type: ActivityType;
    start_time: string | null;
    duration_min: number | null;
    cost_cents: number | null;
    notes: string | null;
    address: string | null;
  }>;
}): Promise<ActionResult> {
  try {
    const { supabase } = await assertTripAccess(input.tripId);
    const { error } = await supabase
      .from("activities")
      .update(input.patch)
      .eq("id", input.activityId);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/trips/${input.tripId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Update failed" };
  }
}

export async function deleteActivityAction(input: {
  activityId: string;
  tripId: string;
}): Promise<ActionResult> {
  try {
    const { supabase } = await assertTripAccess(input.tripId);
    const { error } = await supabase
      .from("activities")
      .delete()
      .eq("id", input.activityId);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/trips/${input.tripId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Delete failed" };
  }
}

export async function reorderActivitiesAction(input: {
  tripId: string;
  dayId: string;
  orderedIds: string[];
}): Promise<ActionResult> {
  try {
    const { supabase } = await assertTripAccess(input.tripId);
    // Sequential updates for sort_order
    for (let i = 0; i < input.orderedIds.length; i++) {
      const { error } = await supabase
        .from("activities")
        .update({ sort_order: i })
        .eq("id", input.orderedIds[i])
        .eq("day_id", input.dayId);
      if (error) return { ok: false, error: error.message };
    }
    revalidatePath(`/trips/${input.tripId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Reorder failed" };
  }
}

export async function addActivityAction(input: {
  tripId: string;
  dayId: string;
  activity: {
    title: string;
    description?: string;
    type?: ActivityType;
    start_time?: string;
    duration_min?: number;
    cost_cents?: number;
  };
}): Promise<ActionResult<{ id: string }>> {
  try {
    const { supabase } = await assertTripAccess(input.tripId);
    const { count } = await supabase
      .from("activities")
      .select("*", { count: "exact", head: true })
      .eq("day_id", input.dayId);

    const { data, error } = await supabase
      .from("activities")
      .insert({
        day_id: input.dayId,
        title: input.activity.title,
        description: input.activity.description ?? null,
        type: input.activity.type ?? "other",
        start_time: input.activity.start_time ?? "10:00",
        duration_min: input.activity.duration_min ?? 90,
        cost_cents: input.activity.cost_cents ?? 0,
        sort_order: count ?? 0,
      })
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message };
    revalidatePath(`/trips/${input.tripId}`);
    return { ok: true, data: { id: data.id } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Add failed" };
  }
}

export type ActivityComment = {
  id: string;
  activity_id: string;
  trip_id: string;
  user_id: string;
  body: string;
  created_at: string;
};

export async function listCommentsAction(
  tripId: string,
  activityId: string,
): Promise<ActivityComment[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_comments")
    .select("*")
    .eq("trip_id", tripId)
    .eq("activity_id", activityId)
    .order("created_at", { ascending: true });
  return (data ?? []) as ActivityComment[];
}

export async function addCommentAction(input: {
  tripId: string;
  activityId: string;
  body: string;
}): Promise<ActionResult> {
  try {
    const user = await requireUser();
    const supabase = await createClient();
    const body = input.body.trim();
    if (!body) return { ok: false, error: "Comment cannot be empty" };
    const { error } = await supabase.from("activity_comments").insert({
      trip_id: input.tripId,
      activity_id: input.activityId,
      user_id: user.id,
      body,
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/trips/${input.tripId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Comment failed" };
  }
}

export async function applyItineraryPatchesAction(input: {
  tripId: string;
  patches: Array<{
    action: "update" | "add" | "delete" | "move";
    activityId?: string;
    dayNumber?: number;
    title?: string;
    description?: string;
    type?: ActivityType;
    start_time?: string;
    duration_min?: number;
    cost_cents?: number;
  }>;
}): Promise<ActionResult<{ applied: number }>> {
  try {
    const { supabase } = await assertTripAccess(input.tripId);
    const { data: days } = await supabase
      .from("days")
      .select("id, day_order")
      .eq("trip_id", input.tripId)
      .order("day_order");

    const dayByOrder = new Map(
      (days ?? []).map((d) => [d.day_order, d.id] as const),
    );
    let applied = 0;

    for (const p of input.patches) {
      if (p.action === "delete" && p.activityId) {
        const { error } = await supabase
          .from("activities")
          .delete()
          .eq("id", p.activityId);
        if (!error) applied++;
      } else if (p.action === "update" && p.activityId) {
        const patch: Record<string, unknown> = {};
        if (p.title != null) patch.title = p.title;
        if (p.description != null) patch.description = p.description;
        if (p.type != null) patch.type = p.type;
        if (p.start_time != null) patch.start_time = p.start_time;
        if (p.duration_min != null) patch.duration_min = p.duration_min;
        if (p.cost_cents != null) patch.cost_cents = p.cost_cents;
        if (Object.keys(patch).length) {
          const { error } = await supabase
            .from("activities")
            .update(patch)
            .eq("id", p.activityId);
          if (!error) applied++;
        }
      } else if (p.action === "add" && p.dayNumber && p.title) {
        const dayId = dayByOrder.get(p.dayNumber);
        if (!dayId) continue;
        const { count } = await supabase
          .from("activities")
          .select("*", { count: "exact", head: true })
          .eq("day_id", dayId);
        const { error } = await supabase.from("activities").insert({
          day_id: dayId,
          title: p.title,
          description: p.description ?? null,
          type: p.type ?? "other",
          start_time: p.start_time ?? "12:00",
          duration_min: p.duration_min ?? 90,
          cost_cents: p.cost_cents ?? 0,
          sort_order: count ?? 0,
        });
        if (!error) applied++;
      }
    }

    revalidatePath(`/trips/${input.tripId}`);
    return { ok: true, data: { applied } };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Patch failed",
    };
  }
}

