import Link from "next/link";
import { Check } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FREE_ACTIVE_TRIPS, FREE_AI_GENERATIONS_PER_MONTH } from "@/lib/config";
import { getUser } from "@/lib/auth";

export const metadata = { title: "Pricing" };

export default async function PricingPage() {
  const user = await getUser();
  const ctaHref = user ? "/billing" : "/auth/sign-up";

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Simple pricing</h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Start free. Upgrade when AI planning becomes part of every trip.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>For weekend explorers</CardDescription>
              <p className="pt-4 text-4xl font-bold">
                $0
                <span className="text-base font-normal text-slate-500">
                  /mo
                </span>
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                `${FREE_AI_GENERATIONS_PER_MONTH} AI generations / month`,
                `${FREE_ACTIVE_TRIPS} active trips`,
                "Map, weather & budget panels",
                "Public share links",
              ].map((item) => (
                <p key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  {item}
                </p>
              ))}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={user ? "/dashboard" : "/auth/sign-up"}>
                  Get started
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-indigo-300 shadow-lg dark:border-indigo-700">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>For frequent planners</CardDescription>
              <p className="pt-4 text-4xl font-bold">
                $12
                <span className="text-base font-normal text-slate-500">
                  /mo
                </span>
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                "Unlimited AI generations",
                "Unlimited active trips",
                "Priority model access",
                "Customer portal & receipts",
                "Everything in Free",
              ].map((item) => (
                <p key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-500" />
                  {item}
                </p>
              ))}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={ctaHref}>Upgrade to Pro</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
