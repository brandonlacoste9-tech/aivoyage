"use client";

import { useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";
import {
  createCheckoutSessionAction,
  createPortalSessionAction,
} from "@/app/actions/billing";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

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
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your Trip Planner subscription
        </p>
      </div>

      {success ? (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
          Checkout completed. Pro status updates after the Stripe webhook runs.
        </div>
      ) : null}
      {canceled ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">
          Checkout canceled — no charges made.
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Pro — $12/mo</CardTitle>
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
                <Check className="h-4 w-4 text-indigo-500" />
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Button onClick={checkout} disabled={pending}>
              {pending ? "Redirecting…" : "Upgrade with Stripe"}
            </Button>
            <Button variant="outline" onClick={portal} disabled={pending}>
              Customer portal
            </Button>
          </div>
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
