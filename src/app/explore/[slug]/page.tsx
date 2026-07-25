import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, CalendarDays, Sparkles } from "lucide-react";
import { DESTINATIONS, destinationSlug } from "@/lib/destinations";
import { getUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/config";
import {
  absoluteUrl,
  breadcrumbSchema,
  destinationPageSchema,
  faqPageSchema,
  jsonLdScript,
} from "@/lib/seo";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: destinationSlug(d.name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dest = DESTINATIONS.find((d) => destinationSlug(d.name) === slug);
  if (!dest) return { title: "Explore" };

  const title = `Plan a trip to ${dest.name} with AI`;
  const description = `${dest.summary.slice(0, 155)}${dest.summary.length > 155 ? "…" : ""}`;
  const path = `/explore/${slug}`;

  return {
    title,
    description,
    keywords: [
      `${dest.name} itinerary`,
      `${dest.name} trip planner`,
      `AI ${dest.name} travel plan`,
      `day by day ${dest.name}`,
      dest.name,
      "AI trip planner",
    ],
    alternates: { canonical: path },
    openGraph: {
      title: `${dest.name} AI itinerary · ${APP_NAME}`,
      description,
      url: absoluteUrl(path),
      type: "article",
      images: [{ url: dest.image, width: 1200, height: 800, alt: dest.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Plan ${dest.name} with AI · ${APP_NAME}`,
      description,
      images: [dest.image],
    },
  };
}

export default async function DestinationSeoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dest = DESTINATIONS.find((d) => destinationSlug(d.name) === slug);
  if (!dest) notFound();

  const user = await getUser();
  const href = user
    ? `/trips/new?destination=${encodeURIComponent(dest.name)}&prompt=${encodeURIComponent(dest.prompt)}`
    : `/auth/sign-up?destination=${encodeURIComponent(dest.name)}&prompt=${encodeURIComponent(dest.prompt)}`;
  const path = `/explore/${slug}`;

  const structured = [
    destinationPageSchema({
      name: dest.name,
      description: dest.summary,
      image: dest.image,
      path,
    }),
    faqPageSchema(dest.faqs),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Explore", path: "/explore" },
      { name: dest.name, path },
    ]),
  ];

  const related = DESTINATIONS.filter((d) => d.name !== dest.name).slice(0, 4);

  return (
    <div className="min-h-screen bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(structured)}
      />
      <SiteHeader />
      <div className="relative h-72 w-full sm:h-96">
        <Image
          src={dest.image}
          alt={`${dest.name} travel destination`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-black/30 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-4xl px-4 pb-10 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
            {dest.season}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-white sm:text-5xl">
            {dest.name} trip planner
          </h1>
          <p className="mt-2 max-w-xl text-white/90">{dest.blurb}</p>
        </div>
      </div>

      <main className="mx-auto max-w-4xl space-y-12 px-4 py-12 sm:px-6">
        {/* Answer-first block — optimized for AI citation */}
        <section aria-labelledby="answer">
          <h2 id="answer" className="sr-only">
            Quick answer
          </h2>
          <p className="text-lg leading-relaxed text-[var(--foreground)]">
            {dest.summary}
          </p>
          <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
            {APP_NAME} builds a day-by-day {dest.name} itinerary with real
            places, map pins, weather context, and budget estimates — then lets
            you refine it in chat until it feels like your trip.
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--lagoon)]">
              <Clock className="h-4 w-4" />
              Suggested length
            </div>
            <p className="mt-2 text-lg font-medium">{dest.tripLength}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--coral)]">
              <CalendarDays className="h-4 w-4" />
              Best time to go
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {dest.bestTime}
            </p>
          </div>
        </div>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            How to plan {dest.name} well
          </h2>
          <ul className="mt-4 space-y-3">
            {dest.highlights.map((h) => (
              <li
                key={h}
                className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 px-4 py-3 text-sm leading-relaxed"
              >
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--lagoon)]" />
                {h}
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap gap-2 text-sm">
          {dest.tags.split("·").map((t) => (
            <span
              key={t}
              className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 capitalize"
            >
              {t.trim()}
            </span>
          ))}
        </div>

        <div className="rounded-[1.75rem] border-2 border-[var(--lagoon)]/30 bg-[var(--card)] p-6 sm:p-8">
          <h2 className="font-display text-xl font-semibold sm:text-2xl">
            Generate a {dest.name} itinerary with AI
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            Starter prompt: “{dest.prompt}”. Free to start — no credit card
            required.
          </p>
          <Button asChild size="lg" variant="accent" className="mt-5">
            <Link href={href}>
              Plan {dest.name} with AI
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            {dest.name} planning FAQ
          </h2>
          <div className="mt-5 space-y-3">
            {dest.faqs.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 open:shadow-sm"
              >
                <summary className="cursor-pointer list-none font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {item.question}
                    <span className="text-[var(--muted)] transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">
            More destinations
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {related.map((d) => (
              <Link
                key={d.name}
                href={`/explore/${destinationSlug(d.name)}`}
                className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm transition hover:border-[var(--lagoon)] hover:text-[var(--lagoon)]"
              >
                {d.name}
              </Link>
            ))}
          </div>
        </section>

        <p className="text-sm text-[var(--muted)]">
          <Link href="/explore" className="text-[var(--lagoon)] hover:underline">
            ← All destinations
          </Link>
          {" · "}
          <Link href="/pricing" className="text-[var(--lagoon)] hover:underline">
            Pricing
          </Link>
          {" · "}
          <Link href="/" className="text-[var(--lagoon)] hover:underline">
            Home
          </Link>
        </p>
      </main>
    </div>
  );
}
