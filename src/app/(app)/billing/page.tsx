"use client";

import { useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Check } from "lucide-react";
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

function BillingInner() {
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  function checkout() {
    startTransition(async () => {
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
          Checkout completed. Pro status updates after the Stripe webhook runs.
        </div>
      ) : null}
      {canceled ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm">
          Checkout canceled — no charges made.
        </div>
      ) : null}

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
              "Stripe Customer Portal",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[var(--lagoon)]" />
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Button onClick={checkout} disabled={pending} variant="accent">
              {pending ? "Redirecting…" : "Upgrade with Stripe"}
            </Button>
            <Button variant="outline" onClick={portal} disabled={pending}>
              Customer portal
            </Button>
          </div>
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

export default function BillingPage() {
  return (
    <Suspense>
      <BillingInner />
    </Suspense>
  );
}
