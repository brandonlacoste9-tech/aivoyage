"use client";

import { useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Check, CreditCard, Sparkles } from "lucide-react";
import {
  createCheckoutSessionAction,
  createPortalSessionAction,
} from "@/app/actions/billing";
import { PromoCodeForm } from "@/components/billing/promo-code-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  plan: string;
  hasCustomer: boolean;
  hasSubscription: boolean;
  promoExpiresAt: string | null;
  stripeConfigured: boolean;
  freeGens: number;
};

export function BillingClient({
  plan,
  hasCustomer,
  hasSubscription,
  promoExpiresAt,
  stripeConfigured,
  freeGens,
}: Props) {
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  const isPro = plan === "pro";

  function checkout() {
    startTransition(async () => {
      try {
        const { trackEvent } = await import("@/lib/analytics");
        trackEvent("checkout_started", { plan: "pro" });
      } catch {
        /* ignore */
      }
      const res = await createCheckoutSessionAction();
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      window.location.href = res.url;
    });
  }

  function portal() {
    startTransition(async () => {
      const res = await createPortalSessionAction();
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      window.location.href = res.url;
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Billing
        </h1>
        <p className="text-[var(--muted)]">
          Manage your Trip Planner subscription
        </p>
      </div>

      {success ? (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
          {isPro
            ? "You're on Pro — unlimited AI itineraries are unlocked."
            : "Checkout completed. Pro unlocks as soon as Stripe confirms payment (usually a few seconds). Refresh if needed."}
        </div>
      ) : null}
      {canceled ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm">
          Checkout canceled — no charges made.
        </div>
      ) : null}

      {!stripeConfigured ? (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          Stripe is not fully configured on this environment. Add{" "}
          <code className="rounded bg-black/5 px-1">STRIPE_SECRET_KEY</code> and{" "}
          <code className="rounded bg-black/5 px-1">STRIPE_PRICE_PRO</code> to
          Netlify env vars, then redeploy.
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="font-display text-xl">
                Current plan
              </CardTitle>
              <CardDescription>
                {isPro
                  ? hasSubscription
                    ? "Stripe Pro subscription"
                    : promoExpiresAt
                      ? `Pro via promo until ${new Date(promoExpiresAt).toLocaleDateString()}`
                      : "Pro access"
                  : `Free Explorer · ${freeGens} AI plans / month`}
              </CardDescription>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                isPro
                  ? "bg-[var(--lagoon)]/15 text-[var(--lagoon)]"
                  : "bg-[var(--muted)]/15 text-[var(--muted)]"
              }`}
            >
              {isPro ? (
                <>
                  <Sparkles className="h-3 w-3" /> Pro
                </>
              ) : (
                "Free"
              )}
            </span>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Pro — $12/mo</CardTitle>
          <CardDescription>
            Unlimited AI itinerary generation and trips
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm">
            {[
              "Unlimited AI generations",
              "Unlimited active trips",
              "Priority planning quality",
              "Stripe Customer Portal (cancel anytime)",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[var(--lagoon)]" />
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            {!isPro || !hasSubscription ? (
              <Button
                onClick={checkout}
                disabled={pending || !stripeConfigured}
                variant="accent"
              >
                <CreditCard className="h-4 w-4" />
                {pending ? "Redirecting…" : "Upgrade with Stripe"}
              </Button>
            ) : null}
            <Button
              variant="outline"
              onClick={portal}
              disabled={pending || !hasCustomer || !stripeConfigured}
            >
              Customer portal
            </Button>
          </div>
          {isPro && hasSubscription ? (
            <p className="text-xs text-[var(--muted)]">
              Manage payment method, invoices, or cancel in the Customer Portal.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-lg">Promo code</CardTitle>
          <CardDescription>
            Redeem a code for free Pro time or bonus AI plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PromoCodeForm />
        </CardContent>
      </Card>
    </div>
  );
}
