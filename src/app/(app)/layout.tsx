import { AppNav } from "@/components/app-nav";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { requireProfile, requireUser } from "@/lib/auth";
import { remainingGenerations } from "@/lib/credits";
import { isSupabaseConfigured } from "@/lib/config";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-2xl font-bold">Configure Supabase</h1>
        <p className="max-w-md text-slate-600 dark:text-slate-400">
          Copy <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">.env.example</code>{" "}
          to <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">.env.local</code>, add
          your Supabase URL and anon key, and run the SQL in{" "}
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">
            supabase/migrations/001_init.sql
          </code>
          .
        </p>
        <Button asChild>
          <Link href="/">Back home</Link>
        </Button>
      </div>
    );
  }

  const user = await requireUser();
  const profile = await requireProfile();
  const remaining = remainingGenerations(profile);
  const creditsLabel =
    profile.plan === "pro"
      ? "Unlimited AI generations"
      : `${remaining} AI generation${remaining === 1 ? "" : "s"} left this month`;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AppNav
        email={user.email}
        plan={profile.plan}
        creditsLabel={creditsLabel}
      />
      <div className="min-w-0 flex-1 overflow-auto pb-20 lg:pb-0">
        {children}
      </div>
      <MobileBottomNav />
    </div>
  );
}
