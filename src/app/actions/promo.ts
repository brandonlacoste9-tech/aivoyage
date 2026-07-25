"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile, requireUser } from "@/lib/auth";
import { findPromo } from "@/lib/promo-codes";

export async function redeemPromoCodeAction(
  rawCode: string,
): Promise<
  | { ok: true; message: string; plan: string; expiresAt?: string }
  | { ok: false; error: string }
> {
  try {
    const user = await requireUser();
    const profile = await requireProfile();
    const supabase = await createClient();

    const promo = findPromo(rawCode);
    if (!promo) {
      return { ok: false, error: "Invalid or expired promo code." };
    }

    // Already redeemed by this user?
    const { data: existing } = await supabase
      .from("promo_redemptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("code", promo.code)
      .maybeSingle();

    if (existing) {
      return { ok: false, error: "You've already redeemed this code." };
    }

    // Global cap
    if (promo.maxRedemptions != null) {
      const { count } = await supabase
        .from("promo_redemptions")
        .select("*", { count: "exact", head: true })
        .eq("code", promo.code);
      if ((count ?? 0) >= promo.maxRedemptions) {
        return { ok: false, error: "This promo code has reached its limit." };
      }
    }

    if (promo.effect.type === "pro_days") {
      const expires = new Date();
      // Stack from existing promo expiry if still valid
      const currentExp = profile.promo_expires_at
        ? new Date(profile.promo_expires_at)
        : null;
      const base =
        currentExp && currentExp > expires ? currentExp : expires;
      base.setDate(base.getDate() + promo.effect.days);

      const { error: upErr } = await supabase
        .from("profiles")
        .update({
          plan: "pro",
          promo_code: promo.code,
          promo_expires_at: base.toISOString(),
        })
        .eq("id", user.id);

      if (upErr) return { ok: false, error: upErr.message };

      const { error: redErr } = await supabase.from("promo_redemptions").insert({
        user_id: user.id,
        code: promo.code,
        effect: promo.effect.label,
      });
      if (redErr) return { ok: false, error: redErr.message };

      revalidatePath("/billing");
      revalidatePath("/dashboard");
      revalidatePath("/settings");

      return {
        ok: true,
        message: `Unlocked ${promo.effect.label}! Enjoy unlimited planning.`,
        plan: "pro",
        expiresAt: base.toISOString(),
      };
    }

    // Bonus generations: reduce usage count
    if (promo.effect.type === "bonus_gens") {
      const nextUsage = Math.max(
        0,
        (profile.ai_generations_month ?? 0) - promo.effect.count,
      );
      const { error: upErr } = await supabase
        .from("profiles")
        .update({
          ai_generations_month: nextUsage,
          promo_code: promo.code,
        })
        .eq("id", user.id);
      if (upErr) return { ok: false, error: upErr.message };

      const { error: redErr } = await supabase.from("promo_redemptions").insert({
        user_id: user.id,
        code: promo.code,
        effect: promo.effect.label,
      });
      if (redErr) return { ok: false, error: redErr.message };

      revalidatePath("/billing");
      revalidatePath("/dashboard");
      revalidatePath("/settings");

      return {
        ok: true,
        message: `Added ${promo.effect.count} free AI generations this month.`,
        plan: profile.plan,
      };
    }

    return { ok: false, error: "Unknown promo effect." };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Redeem failed",
    };
  }
}
