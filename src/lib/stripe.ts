import Stripe from "stripe";
import { isStripeConfigured } from "@/lib/config";

let stripe: Stripe | null = null;

export function getStripe() {
  if (!isStripeConfigured()) return null;
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return stripe;
}
