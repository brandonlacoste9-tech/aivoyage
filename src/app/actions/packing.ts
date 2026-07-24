"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { PackingItem } from "@/lib/packing";

export async function savePackingListAction(
  tripId: string,
  items: PackingItem[],
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: trip } = await supabase
    .from("trips")
    .select("owner_id")
    .eq("id", tripId)
    .single();
  if (!trip || trip.owner_id !== user.id) {
    return { ok: false, error: "Only the owner can save packing list" };
  }
  const { error } = await supabase
    .from("trips")
    .update({ packing_list: items })
    .eq("id", tripId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/trips/${tripId}`);
  return { ok: true };
}
