import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { DESTINATIONS } from "@/lib/destinations";
import { CountryExplorer } from "@/components/explore/country-explorer";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Explore" };

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-10 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--lagoon)]">
            Explore
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Where to next?
          </h1>
          <p className="mt-2 max-w-xl text-[var(--muted)]">
            Search any country for live facts and trip ideas — or pick a curated
            city below and start planning with AI.
          </p>
        </div>
        <Button asChild variant="accent">
          <Link href="/trips/new">
            Invent your own
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Country search + info panel */}
      <CountryExplorer />

      {/* Curated cities */}
      <div>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold">
              Featured cities
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Hand-picked destinations with photo guides
            </p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {DESTINATIONS.map((d, i) => (
            <Link
              key={d.name}
              href={`/explore/${slugify(d.name)}`}
              className={`group dest-card relative block overflow-hidden rounded-[1.5rem] ${
                i === 0 ? "sm:col-span-2 sm:row-span-1 lg:aspect-auto" : ""
              }`}
            >
              <div
                className={`relative overflow-hidden ${
                  i === 0 ? "aspect-[21/9] sm:aspect-[2.2/1]" : "aspect-[4/5]"
                }`}
              >
                <Image
                  src={d.image}
                  alt={d.name}
                  fill
                  sizes={i === 0 ? "66vw" : "25vw"}
                  className="object-cover transition duration-700 group-hover:scale-105"
                  priority={i < 2}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                    {d.season}
                  </p>
                  <h2 className="font-display text-2xl font-semibold">
                    {d.name}
                  </h2>
                  <p className="mt-1 text-sm text-white/85">{d.blurb}</p>
                  <p className="mt-2 text-xs uppercase tracking-wider text-white/60">
                    {d.tags}
                  </p>
                </div>
                <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition group-hover:bg-[var(--coral)]">
                  <Sparkles className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
