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

/** Pro via Stripe or an active promo grant. */
export function isProActive(profile: Profile): boolean {
  if (profile.plan !== "pro") return false;
  if (!profile.promo_expires_at) return true; // Stripe/manual pro, no expiry
  return new Date(profile.promo_expires_at) > new Date();
}

export function canGenerate(profile: Profile) {
  if (isProActive(profile)) return { ok: true as const };
  // Promo expired but plan still "pro" → treat as free until renewed
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
  if (isProActive(profile)) return { ok: true as const };

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
  if (isProActive(profile)) return Infinity;
  return Math.max(
    0,
    FREE_AI_GENERATIONS_PER_MONTH - profile.ai_generations_month,
  );
}

/** Downgrade expired promo Pro back to free (best-effort). */
export async function expirePromoIfNeeded(
  supabase: SupabaseClient,
  profile: Profile,
): Promise<Profile> {
  if (
    profile.plan === "pro" &&
    profile.promo_expires_at &&
    new Date(profile.promo_expires_at) <= new Date() &&
    !profile.stripe_subscription_id
  ) {
    const { data } = await supabase
      .from("profiles")
      .update({ plan: "free" })
      .eq("id", profile.id)
      .select()
      .single();
    if (data) return data as Profile;
  }
  return profile;
}
