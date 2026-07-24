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
import { GoogleOAuthButton } from "@/components/auth/oauth-buttons";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Welcome back — your trips are waiting");
      router.push(next);
      router.refresh();
    } catch {
      toast.error("Auth isn’t configured yet. Add Supabase keys in Netlify.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] p-8 shadow-xl shadow-[var(--ink)]/5">
      <div className="mb-6 flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--lagoon)] text-[var(--primary-foreground)]">
          <Compass className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-[var(--muted)]">
            Pick up where your itinerary left off
          </p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
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
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <div className="relative my-4 text-center text-xs uppercase tracking-wider text-[var(--muted)]">
        <span className="bg-[var(--card)] px-2">or</span>
      </div>
      <GoogleOAuthButton next={next} />
      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        New here?{" "}
        <Link
          href={`/auth/sign-up?next=${encodeURIComponent(next)}`}
          className="font-semibold text-[var(--lagoon)] hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <Suspense>
        <SignInForm />
      </Suspense>
    </div>
  );
}
