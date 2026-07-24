import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { DESTINATIONS } from "@/lib/destinations";
import { getUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: slugify(d.name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dest = DESTINATIONS.find((d) => slugify(d.name) === slug);
  if (!dest) return { title: "Explore" };
  return {
    title: `Plan a trip to ${dest.name}`,
    description: `${dest.blurb}. AI day-by-day itineraries on Trip Planner.`,
  };
}

export default async function DestinationSeoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dest = DESTINATIONS.find((d) => slugify(d.name) === slug);
  if (!dest) notFound();
  const user = await getUser();
  const href = user
    ? `/trips/new?destination=${encodeURIComponent(dest.name)}&prompt=${encodeURIComponent(dest.prompt)}`
    : `/auth/sign-up?destination=${encodeURIComponent(dest.name)}&prompt=${encodeURIComponent(dest.prompt)}`;

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <div className="relative h-72 w-full sm:h-96">
        <Image
          src={dest.image}
          alt={dest.name}
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
            {dest.name}
          </h1>
          <p className="mt-2 max-w-xl text-white/90">{dest.blurb}</p>
        </div>
      </div>
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6">
        <p className="text-lg text-[var(--muted)]">
          Let Trip Planner build a day-by-day itinerary for {dest.name} —
          restaurants, landmarks, map pins, weather, and budget — then refine it
          in chat.
        </p>
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
        <Button asChild size="lg" variant="accent">
          <Link href={href}>
            Plan {dest.name} with AI
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <p className="text-sm text-[var(--muted)]">
          <Link href="/explore" className="text-[var(--lagoon)] hover:underline">
            ← All destinations
          </Link>
        </p>
      </main>
    </div>
  );
}
