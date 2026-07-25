"use server";

import { requireProfile, requireUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { getAppUrl, isStripeConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export async function createCheckoutSessionAction(): Promise<
  { ok: true; url: string } | { ok: false; error: string }
> {
  if (!isStripeConfigured()) {
    return {
      ok: false,
      error: "Stripe is not configured. Add STRIPE_SECRET_KEY and STRIPE_PRICE_PRO.",
    };
  }

  const user = await requireUser();
  const profile = await requireProfile();
  const stripe = getStripe()!;
  const appUrl = getAppUrl();

  let customerId = profile.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    const supabase = await createClient();
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: process.env.STRIPE_PRICE_PRO!, quantity: 1 }],
    success_url: `${appUrl}/billing?success=1`,
    cancel_url: `${appUrl}/billing?canceled=1`,
    allow_promotion_codes: true,
    metadata: { supabase_user_id: user.id },
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
  });

  if (!session.url) return { ok: false, error: "No checkout URL returned" };
  return { ok: true, url: session.url };
}

export async function createPortalSessionAction(): Promise<
  { ok: true; url: string } | { ok: false; error: string }
> {
  if (!isStripeConfigured()) {
    return { ok: false, error: "Stripe is not configured." };
  }

  const profile = await requireProfile();
  if (!profile.stripe_customer_id) {
    return { ok: false, error: "No billing customer yet. Subscribe first." };
  }

  const stripe = getStripe()!;
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${getAppUrl()}/billing`,
  });

  return { ok: true, url: session.url };
}
