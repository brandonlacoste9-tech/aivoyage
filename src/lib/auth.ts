import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";
import type { Profile } from "@/lib/types";
import { redirect } from "next/navigation";

export async function getUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/auth/sign-in");
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return data as Profile | null;
}

export async function requireProfile() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    // Profile missing (migration not run) — return a soft profile
    return {
      id: user.id,
      display_name: user.email?.split("@")[0] ?? "Traveler",
      avatar_url: null,
      plan: "free" as const,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      ai_generations_month: 0,
      ai_generations_reset_at: new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        1,
      ).toISOString(),
      created_at: new Date().toISOString(),
    } satisfies Profile;
  }

  return data as Profile;
}
