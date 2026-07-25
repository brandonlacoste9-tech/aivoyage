import { Suspense } from "react";
import { requireProfile } from "@/lib/auth";
import { isStripeConfigured, FREE_AI_GENERATIONS_PER_MONTH } from "@/lib/config";
import { BillingClient } from "@/components/billing/billing-client";

export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const profile = await requireProfile();
  const stripeReady = isStripeConfigured();

  return (
    <Suspense>
      <BillingClient
        plan={profile.plan}
        hasCustomer={Boolean(profile.stripe_customer_id)}
        hasSubscription={Boolean(profile.stripe_subscription_id)}
        promoExpiresAt={profile.promo_expires_at ?? null}
        stripeConfigured={stripeReady}
        freeGens={FREE_AI_GENERATIONS_PER_MONTH}
      />
    </Suspense>
  );
}
