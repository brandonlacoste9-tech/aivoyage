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
  return ensureProfileRow(user.id, user.email);
}

/** Always returns a real DB profile row (upsert if missing). */
export async function ensureProfileRow(
  userId: string,
  email?: string | null,
): Promise<Profile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!error && data) return data as Profile;

  const display =
    email?.split("@")[0] || "Traveler";
  const resetAt = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    1,
  ).toISOString();

  const { data: inserted, error: insertError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        display_name: display,
        plan: "free",
        ai_generations_month: 0,
        ai_generations_reset_at: resetAt,
      },
      { onConflict: "id" },
    )
    .select("*")
    .single();

  if (insertError || !inserted) {
    throw new Error(
      insertError?.message ||
        "Could not create user profile. Check Supabase RLS and migrations.",
    );
  }

  return inserted as Profile;
}

export async function requireProfile() {
  const user = await requireUser();
  return ensureProfileRow(user.id, user.email);
}
