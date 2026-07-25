import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import {
  FREE_ACTIVE_TRIPS,
  FREE_AI_GENERATIONS_PER_MONTH,
  APP_NAME,
} from "@/lib/config";
import { getUser } from "@/lib/auth";
import {
  absoluteUrl,
  faqPageSchema,
  softwareApplicationSchema,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Pricing — Free & Pro AI Trip Planner",
  description: `${APP_NAME} pricing: free AI trip planner with ${FREE_AI_GENERATIONS_PER_MONTH} itineraries/month, or Pro at $12/mo for unlimited day-by-day plans, maps, weather, and chat refine.`,
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: `Pricing · ${APP_NAME}`,
    description:
      "Start free with AI itineraries, maps, and share links. Upgrade to Pro for unlimited trip planning.",
    url: absoluteUrl("/pricing"),
  },
};

const PRICING_FAQS = [
  {
    question: "Is Trip Planner free?",
    answer: `Yes. The Explorer plan is $0/month and includes ${FREE_AI_GENERATIONS_PER_MONTH} AI itineraries per month, ${FREE_ACTIVE_TRIPS} active trips, maps, weather, budget panels, and public share links.`,
  },
  {
    question: "How much is Trip Planner Pro?",
    answer:
      "Voyager Pro is $12 per month for unlimited AI itineraries, unlimited active trips, and richer model priority. Cancel anytime.",
  },
  {
    question: "Do I need a credit card to start?",
    answer: "No. You can create an account and generate free itineraries without a credit card.",
  },
];

export default async function PricingPage() {
  const user = await getUser();
  const ctaHref = user ? "/billing" : "/auth/sign-up";

  return (
    <div className="min-h-screen bg-paper">
      <JsonLd data={[softwareApplicationSchema(), faqPageSchema(PRICING_FAQS)]} />
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
            Pricing
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Simple AI trip planner pricing
          </h1>
          <p className="mt-4 text-lg text-[var(--muted)]">
            Start free while you test the vibe. Upgrade when planning becomes a
            habit — not a chore. No credit card required to begin.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
              Explorer
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold">Free</h2>
            <p className="mt-4 font-display text-5xl font-semibold tracking-tight">
              $0
              <span className="text-lg font-sans font-normal text-[var(--muted)]">
                /mo
              </span>
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Enough to plan a few real getaways
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {[
                `${FREE_AI_GENERATIONS_PER_MONTH} AI itineraries per month`,
                `${FREE_ACTIVE_TRIPS} active trips`,
                "Map, weather & budget panels",
                "Public share links",
                "Chat refine (demo-friendly)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--secondary)]" />
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="mt-8 w-full">
              <Link href={user ? "/dashboard" : "/auth/sign-up"}>
                Start free
              </Link>
            </Button>
          </div>

          <div className="relative rounded-[1.75rem] border-2 border-[var(--lagoon)] bg-[var(--card)] p-8 shadow-xl shadow-[var(--lagoon)]/10">
            <span className="absolute -top-3 left-8 inline-flex items-center gap-1 rounded-full bg-[var(--coral)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              <Sparkles className="h-3 w-3" />
              Most loved
            </span>
            <p className="text-sm font-semibold uppercase tracking-wider text-[var(--lagoon)]">
              Voyager
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold">Pro</h2>
            <p className="mt-4 font-display text-5xl font-semibold tracking-tight">
              $12
              <span className="text-lg font-sans font-normal text-[var(--muted)]">
                /mo
              </span>
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Unlimited planning for frequent travelers
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {[
                "Unlimited AI itineraries",
                "Unlimited active trips",
                "Richer model priority",
                "Stripe customer portal",
                "Everything in Free",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--lagoon)]" />
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild variant="accent" className="mt-8 w-full">
              <Link href={ctaHref}>Go Pro</Link>
            </Button>
          </div>
        </div>

        <section className="mx-auto mt-16 max-w-2xl">
          <h2 className="text-center font-display text-2xl font-semibold">
            Pricing FAQ
          </h2>
          <div className="mt-6 space-y-3">
            {PRICING_FAQS.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4"
              >
                <summary className="cursor-pointer list-none font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <p className="mt-12 text-center text-sm text-[var(--muted)]">
          {APP_NAME} · Cancel anytime · No surprise seats-and-baggage fees
          (those are on the airline)
        </p>
      </main>
    </div>
  );
}
