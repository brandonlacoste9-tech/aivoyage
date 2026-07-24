import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CloudSun,
  MapPinned,
  MessageSquareText,
  Quote,
  Sparkles,
  Wallet,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { HeroPrompt } from "@/components/landing/hero-prompt";
import { ItineraryPreview } from "@/components/landing/itinerary-preview";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/config";

/** Soft full-bleed hero photo — faded under copy */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=2000&q=80";

const destinations = [
  {
    name: "Kyoto",
    vibe: "Temples, tea, golden hour alleys",
    season: "Best in autumn",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Lisbon",
    vibe: "Hills, miradouros, late dinners",
    season: "Year-round light",
    image:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Bali",
    vibe: "Rice terraces & slow mornings",
    season: "Dry season magic",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Rome",
    vibe: "History stacked on long lunches",
    season: "Spring & fall",
    image:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Seoul",
    vibe: "Palaces by day, neon by night",
    season: "Cherry blossom",
    image:
      "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "New York",
    vibe: "Neighborhoods as micro-countries",
    season: "Fall foliage energy",
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=900&q=80",
  },
];

const steps = [
  {
    n: "01",
    title: "Tell us the feeling",
    body: "Not a form dump — a sentence. Pace, food, budget, who you’re with. Vague is fine.",
  },
  {
    n: "02",
    title: "Get a real day-by-day",
    body: "Named places, timing, costs, and a map — structured enough to travel on, not a brochure.",
  },
  {
    n: "03",
    title: "Tune it like a local friend",
    body: "Chat to swap dinners, slow a day, dodge rain. Share a link when it’s ready.",
  },
];

const pillars = [
  {
    icon: Sparkles,
    title: "Plans that sound human",
    body: "Specific neighborhoods and meals — not “visit a museum” fluff.",
  },
  {
    icon: MapPinned,
    title: "Grounded in place",
    body: "Map markers by day so the route makes sense on the ground.",
  },
  {
    icon: MessageSquareText,
    title: "Conversation, not redo",
    body: "Refine the live itinerary instead of regenerating from zero.",
  },
  {
    icon: CloudSun,
    title: "Weather in the room",
    body: "See the week’s forecast while you move outdoor days around.",
  },
  {
    icon: Wallet,
    title: "Budget without spreadsheets",
    body: "Activity costs roll up so you know when you’re overspending.",
  },
];

export default async function HomePage() {
  const user = await getUser();
  const cta = user ? "/trips/new" : "/auth/sign-up";

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16">
          {/* Faded travel photo backdrop */}
          <div className="pointer-events-none absolute inset-0 -z-10 hero-photo-fade">
            <Image
              src={HERO_IMAGE}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_35%] opacity-[0.28] saturate-[0.9] contrast-[0.95] dark:opacity-[0.2] dark:saturate-[0.75]"
            />
            {/* Fade photo into brand sand paper so sections blend cleanly */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(
                    180deg,
                    color-mix(in srgb, var(--background) 35%, transparent) 0%,
                    color-mix(in srgb, var(--background) 55%, transparent) 45%,
                    var(--background) 92%
                  ),
                  linear-gradient(
                    90deg,
                    color-mix(in srgb, var(--background) 70%, transparent) 0%,
                    transparent 40%,
                    transparent 60%,
                    color-mix(in srgb, var(--background) 40%, transparent) 100%
                  ),
                  radial-gradient(ellipse 80% 60% at 15% 20%, rgba(15, 92, 99, 0.12), transparent 55%),
                  radial-gradient(ellipse 50% 40% at 90% 10%, rgba(224, 122, 95, 0.1), transparent 50%)
                `,
              }}
            />
          </div>

          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)]/85 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--lagoon)] shadow-sm backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--coral)]" />
                Handcrafted by AI · Tuned by you
              </p>
              <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                Stop pasting links into a doc.
                <br />
                <span className="gradient-text italic">Start traveling.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--muted)] [text-shadow:0_1px_0_color-mix(in_srgb,var(--background)_80%,transparent)]">
                {APP_NAME} turns a half-formed idea into a day-by-day itinerary
                with real places, a map, weather, and budget — then lets you
                refine it in conversation until it feels like{" "}
                <em className="font-display not-italic text-[var(--foreground)]">
                  your
                </em>{" "}
                trip.
              </p>

              <div className="mt-8">
                <HeroPrompt signedIn={!!user} />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--muted)]">
                <span className="flex items-center gap-1.5">
                  <span className="font-display text-lg font-semibold text-[var(--foreground)]">
                    3 free
                  </span>{" "}
                  AI plans / mo
                </span>
                <span className="hidden h-1 w-1 rounded-full bg-[var(--border)] sm:inline" />
                <span>No credit card to start</span>
                <span className="hidden h-1 w-1 rounded-full bg-[var(--border)] sm:inline" />
                <span>Shareable when ready</span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <ItineraryPreview />
            </div>
          </div>
        </section>

        {/* SOCIAL STRIP */}
        <section className="border-y border-[var(--border)] bg-[var(--card)]/60">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
            <p className="font-display text-sm italic text-[var(--muted)]">
              Built for travelers who care about the day — not the deck.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Food-first", "Slow travel", "City breaks", "First timers"].map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-medium text-[var(--muted)]"
                  >
                    {t}
                  </span>
                ),
              )}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
              How it works
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              From “I want Kyoto” to a plan you can open on the plane
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.n}
                className="relative rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] p-7 shadow-sm"
              >
                <span className="font-display text-4xl font-semibold text-[var(--lagoon)]/20">
                  {s.n}
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* DESTINATIONS */}
        <section
          id="destinations"
          className="border-y border-[var(--border)] bg-[var(--sand-deep)]/40 py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--lagoon)]">
                  Destinations
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  Start with a place that already lives in your head
                </h2>
              </div>
              <Button asChild variant="outline">
                <Link href={cta}>
                  Or invent your own
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {destinations.map((d, i) => (
                <Link
                  key={d.name}
                  href={
                    user
                      ? `/trips/new?destination=${encodeURIComponent(d.name)}`
                      : `/auth/sign-up?destination=${encodeURIComponent(d.name)}`
                  }
                  className={`dest-card group relative block overflow-hidden rounded-[1.5rem] ${
                    i === 0 || i === 5 ? "sm:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={d.image}
                      alt={d.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                      priority={i < 2}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
                        {d.season}
                      </p>
                      <h3 className="font-display text-2xl font-semibold">
                        {d.name}
                      </h3>
                      <p className="mt-1 text-sm text-white/85">{d.vibe}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* PILLARS */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--coral)]">
              Why it feels different
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              A travel magazine’s eye. A product’s precision.
            </h2>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map(({ icon: Icon, title, body }, i) => (
              <div
                key={title}
                className={`bg-[var(--card)] p-8 ${i === pillars.length - 1 ? "sm:col-span-2 lg:col-span-1" : ""}`}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--lagoon)]/10 text-[var(--lagoon)]">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* QUOTE / PROOF */}
        <section className="mx-auto max-w-4xl px-4 pb-8 sm:px-6">
          <figure className="rounded-[2rem] border border-[var(--border)] bg-[var(--card)] px-8 py-10 text-center shadow-sm sm:px-14 sm:py-14">
            <Quote className="mx-auto h-8 w-8 text-[var(--coral)]/50" />
            <blockquote className="mt-4 font-display text-2xl font-medium leading-snug tracking-tight sm:text-3xl">
              “I didn’t want another 40-tab research spiral. I wanted a week in
              Lisbon that felt like me — and twenty minutes later I had one.”
            </blockquote>
            <figcaption className="mt-6 text-sm text-[var(--muted)]">
              What we’re building for — not a paid testimonial (yet)
            </figcaption>
          </figure>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="relative overflow-hidden rounded-[2rem] bg-[var(--lagoon)] px-8 py-12 text-[var(--primary-foreground)] sm:px-14 sm:py-16">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--coral)]/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div className="max-w-xl">
                <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  Your next trip is one sentence away
                </h2>
                <p className="mt-3 text-[var(--primary-foreground)]/80">
                  Free to start. Bring the half-idea — we’ll turn it into
                  mornings, meals, and a map.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" variant="accent">
                  <Link href={cta}>
                    {user ? "Plan a new trip" : "Create free account"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-transparent text-white hover:bg-white/10"
                >
                  <Link href="/pricing">See pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--card)]/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-[var(--muted)] sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 font-display font-semibold text-[var(--foreground)]">
            <CompassMark />
            {APP_NAME}
          </div>
          <p>
            © {new Date().getFullYear()} {APP_NAME}. Itineraries with soul —
            and a map that keeps up.
          </p>
          <div className="flex gap-4">
            <Link href="/pricing" className="hover:text-[var(--lagoon)]">
              Pricing
            </Link>
            <Link href="/auth/sign-in" className="hover:text-[var(--lagoon)]">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CompassMark() {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--lagoon)] text-[var(--primary-foreground)]">
      <MapPinned className="h-3.5 w-3.5" />
    </span>
  );
}
