import Link from "next/link";
import {
  CloudSun,
  MapPinned,
  MessageSquare,
  Shield,
  Sparkles,
  Wallet,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { HeroPrompt } from "@/components/landing/hero-prompt";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUser } from "@/lib/auth";
import { APP_NAME } from "@/lib/config";

const features = [
  {
    icon: Sparkles,
    title: "AI itineraries",
    description:
      "Describe a trip in natural language. Get a structured day-by-day plan with real places and timing.",
  },
  {
    icon: MapPinned,
    title: "Interactive maps",
    description:
      "Mapbox markers by day, popups, and fly-to navigation so the plan feels grounded in place.",
  },
  {
    icon: MessageSquare,
    title: "Refine in chat",
    description:
      "Swap restaurants, slow the pace, or add nightlife — conversational refinement on the live itinerary.",
  },
  {
    icon: CloudSun,
    title: "Weather aware",
    description:
      "Seven-day forecasts for your destination so you can pivot outdoor days intelligently.",
  },
  {
    icon: Wallet,
    title: "Budget tracking",
    description:
      "Activity costs roll into a trip budget with clear progress toward your limit.",
  },
  {
    icon: Shield,
    title: "Secure by design",
    description:
      "Supabase Auth + RLS, server-only API keys, and Stripe-backed Pro unlocks.",
  },
];

const destinations = ["Kyoto", "Lisbon", "Bali", "Rome", "Seoul", "New York"];

export default async function HomePage() {
  const user = await getUser();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="gradient-hero relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/60 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-slate-900/60 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              AI travel workspace for modern trips
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Plan unforgettable trips with{" "}
              <span className="gradient-text">{APP_NAME}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Natural-language planning, day-by-day itineraries, maps, weather,
              budget, and chat refinement — a production-shaped stack for real
              travel and real APIs.
            </p>
            <div className="mt-10">
              <HeroPrompt signedIn={!!user} />
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" variant="accent">
                <Link href={user ? "/trips/new" : "/auth/sign-up"}>
                  Start free
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything a modern trip workspace needs
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Built to demonstrate auth, database, AI, maps, weather, payments,
              and more — without looking like a tutorial.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <Card
                key={title}
                className="transition-transform hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold">
              Popular destinations to spark ideas
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {destinations.map((d) => (
                <Link
                  key={d}
                  href={
                    user
                      ? `/trips/new?destination=${encodeURIComponent(d)}`
                      : `/auth/sign-up?destination=${encodeURIComponent(d)}`
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center text-sm font-semibold shadow-sm transition hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-950"
                >
                  {d}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-indigo-600 via-indigo-500 to-cyan-500 text-white shadow-xl">
            <CardContent className="flex flex-col items-start gap-6 p-10 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">
                  Ready when you are
                </h2>
                <p className="mt-2 max-w-xl text-indigo-50">
                  Free tier includes AI generations and trips. Upgrade to Pro
                  when you need unlimited planning.
                </p>
              </div>
              <Button asChild size="lg" variant="accent">
                <Link href={user ? "/dashboard" : "/auth/sign-up"}>
                  {user ? "Go to dashboard" : "Create free account"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-10 text-center text-sm text-slate-500 dark:border-slate-800">
        <p>
          © {new Date().getFullYear()} {APP_NAME}. Built as a modern API-rich
          travel SaaS demo.
        </p>
      </footer>
    </div>
  );
}
