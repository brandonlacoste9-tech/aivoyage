import Link from "next/link";
import { AcceptInviteClient } from "./accept-client";
import { SiteHeader } from "@/components/site-header";
import { getUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const user = await getUser();

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral)]">
          Trip invite
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
          You&apos;re invited to collaborate
        </h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Accept to open this shared itinerary in your Trip Planner workspace.
        </p>

        {user ? (
          <div className="mt-8 w-full">
            <AcceptInviteClient token={token} />
          </div>
        ) : (
          <div className="mt-8 flex w-full flex-col gap-3">
            <Button asChild size="lg" variant="accent">
              <Link
                href={`/auth/sign-in?next=${encodeURIComponent(`/invite/${token}`)}`}
              >
                Sign in to accept
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link
                href={`/auth/sign-up?next=${encodeURIComponent(`/invite/${token}`)}`}
              >
                Create account
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
