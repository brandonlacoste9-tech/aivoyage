"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PaywallModal({
  open,
  onClose,
  message,
}: {
  open: boolean;
  onClose: () => void;
  message?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--coral)]/15 text-[var(--coral)]">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="mt-4 font-display text-2xl font-semibold">
          You&apos;ve used this month&apos;s free plans
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {message ||
            "Upgrade to Pro for unlimited AI itineraries, unlimited trips, and priority planning."}
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="accent" className="flex-1">
            <Link href="/billing">Upgrade to Pro — $12/mo</Link>
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
