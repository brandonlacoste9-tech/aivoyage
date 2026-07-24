import {
  FREE_ACTIVE_TRIPS,
  FREE_AI_GENERATIONS_PER_MONTH,
} from "@/lib/config";
import type { Profile } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function ensureCreditsReset(
  supabase: SupabaseClient,
  profile: Profile,
): Promise<Profile> {
  const resetAt = new Date(profile.ai_generations_reset_at);
  if (resetAt > new Date()) return profile;

  const nextReset = new Date();
  nextReset.setMonth(nextReset.getMonth() + 1);
  nextReset.setDate(1);
  nextReset.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ai_generations_month: 0,
      ai_generations_reset_at: nextReset.toISOString(),
    })
    .eq("id", profile.id)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

export function canGenerate(profile: Profile) {
  if (profile.plan === "pro") return { ok: true as const };
  if (profile.ai_generations_month >= FREE_AI_GENERATIONS_PER_MONTH) {
    return {
      ok: false as const,
      reason: `Free plan includes ${FREE_AI_GENERATIONS_PER_MONTH} AI generations per month. Upgrade to Pro for unlimited planning.`,
    };
  }
  return { ok: true as const };
}

export async function canCreateTrip(
  supabase: SupabaseClient,
  profile: Profile,
) {
  if (profile.plan === "pro") return { ok: true as const };

  const { count, error } = await supabase
    .from("trips")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", profile.id)
    .neq("status", "archived");

  if (error) throw error;
  if ((count ?? 0) >= FREE_ACTIVE_TRIPS) {
    return {
      ok: false as const,
      reason: `Free plan allows ${FREE_ACTIVE_TRIPS} active trips. Archive one or upgrade to Pro.`,
    };
  }
  return { ok: true as const };
}

export async function incrementGeneration(
  supabase: SupabaseClient,
  profileId: string,
) {
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("ai_generations_month")
    .eq("id", profileId)
    .single();

  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from("profiles")
    .update({
      ai_generations_month: (profile.ai_generations_month ?? 0) + 1,
    })
    .eq("id", profileId);

  if (error) throw error;
}

export function remainingGenerations(profile: Profile) {
  if (profile.plan === "pro") return Infinity;
  return Math.max(
    0,
    FREE_AI_GENERATIONS_PER_MONTH - profile.ai_generations_month,
  );
}
