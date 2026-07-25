import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getPostHogClient } from "@/lib/posthog-server";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function setPro(
  supabase: NonNullable<ReturnType<typeof adminClient>>,
  opts: {
    userId?: string | null;
    customerId?: string | null;
    subscriptionId?: string | null;
    plan: "pro" | "free";
  },
) {
  const patch: Record<string, unknown> = {
    plan: opts.plan,
    stripe_subscription_id:
      opts.plan === "pro" ? opts.subscriptionId ?? null : null,
  };
  if (opts.customerId) patch.stripe_customer_id = opts.customerId;

  if (opts.userId) {
    const { error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", opts.userId);
    if (error) throw error;
    return;
  }

  if (opts.customerId) {
    const { error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("stripe_customer_id", opts.customerId);
    if (error) throw error;
  }
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 503 },
    );
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = adminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Service role not configured" },
      { status: 503 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const userId =
          session.metadata?.supabase_user_id ||
          session.client_reference_id ||
          null;
        const customerId =
          typeof session.customer === "string" ? session.customer : null;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : null;

        await setPro(supabase, {
          userId,
          customerId,
          subscriptionId,
          plan: "pro",
        });
        if (userId) {
          const posthog = getPostHogClient();
          if (posthog) {
            posthog.capture({
              distinctId: userId,
              event: "subscription_activated",
              properties: { plan: "pro", subscription_id: subscriptionId },
            });
            await posthog.flush();
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id || null;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : null;
        const active = ["active", "trialing", "past_due"].includes(sub.status);
        // past_due keeps pro briefly while Stripe retries; deleted/canceled → free
        const plan =
          event.type === "customer.subscription.deleted" || !active
            ? "free"
            : "pro";

        await setPro(supabase, {
          userId,
          customerId,
          subscriptionId: plan === "pro" ? sub.id : null,
          plan,
        });
        if (userId && event.type === "customer.subscription.deleted") {
          const posthog = getPostHogClient();
          if (posthog) {
            posthog.capture({
              distinctId: userId,
              event: "subscription_canceled",
              properties: { subscription_id: sub.id },
            });
            await posthog.flush();
          }
        }
        break;
      }

      case "invoice.paid": {
        // Renewals — ensure plan stays pro
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string" ? invoice.customer : null;
        const subscriptionId =
          typeof (invoice as { subscription?: string | null }).subscription ===
          "string"
            ? (invoice as { subscription?: string }).subscription
            : null;
        if (customerId && subscriptionId) {
          await setPro(supabase, {
            customerId,
            subscriptionId,
            plan: "pro",
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        // Leave plan as-is; subscription.updated will flip free if it cancels
        console.warn(
          "[stripe webhook] invoice.payment_failed",
          (event.data.object as Stripe.Invoice).id,
        );
        break;
      }

      default:
        break;
    }
  } catch (e) {
    console.error("Webhook handler error", e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
