"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { toast } from "sonner";
import { Compass } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt");
  const destination = searchParams.get("destination");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name || undefined },
        },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      // Best-effort welcome email + analytics (non-blocking)
      void fetch("/api/notify/welcome", { method: "POST" }).catch(() => {});
      try {
        const { default: posthog } = await import("posthog-js");
        const userId = signUpData?.user?.id;
        if (userId) {
          posthog.identify(userId, { plan: "free" });
        }
        posthog.capture("signup_completed");
      } catch {
        /* ignore */
      }
      toast.success("Account created — let’s build your first trip");
      const params = new URLSearchParams();
      if (prompt) params.set("prompt", prompt);
      if (destination) params.set("destination", destination);
      const q = params.toString();
      router.push(q ? `/trips/new?${q}` : "/dashboard");
      router.refresh();
    } catch {
      toast.error("Auth isn’t configured yet. Add Supabase keys in Netlify.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] p-8 shadow-xl shadow-[var(--ink)]/5">
      <div className="mb-6">
        <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--coral)] text-white">
          <Compass className="h-5 w-5" />
        </span>
        <h1 className="font-display text-2xl font-semibold">
          Start your first voyage
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Free plan. No card. One sentence is enough to begin.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">What should we call you?</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex"
            className="rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl"
          />
        </div>
        <Button type="submit" variant="accent" className="w-full" disabled={loading}>
          {loading ? "Creating…" : "Create free account"}
        </Button>
        <p className="text-center text-xs text-[var(--muted)]">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="underline hover:text-[var(--lagoon)]">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-[var(--lagoon)]">
            Privacy Policy
          </Link>
          .
        </p>
        <p className="text-center text-sm text-[var(--muted)]">
          Already planning?{" "}
          <Link
            href="/auth/sign-in"
            className="font-semibold text-[var(--lagoon)] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <Suspense>
        <SignUpForm />
      </Suspense>
    </div>
  );
}
