"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { getAppUrl } from "@/lib/config";

export type Collaborator = {
  id: string;
  trip_id: string;
  email: string;
  user_id: string | null;
  role: "editor" | "viewer";
  invite_token: string;
  status: "pending" | "accepted" | "revoked";
  invited_by: string;
  created_at: string;
};

export async function listCollaboratorsAction(
  tripId: string,
): Promise<Collaborator[]> {
  const user = await requireUser();
  const supabase = await createClient();

  // Ensure ownership for listing invites
  const { data: trip } = await supabase
    .from("trips")
    .select("id, owner_id")
    .eq("id", tripId)
    .single();
  if (!trip || trip.owner_id !== user.id) return [];

  const { data, error } = await supabase
    .from("trip_collaborators")
    .select("*")
    .eq("trip_id", tripId)
    .neq("status", "revoked")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("list collab", error.message);
    return [];
  }
  return (data ?? []) as Collaborator[];
}

export async function inviteCollaboratorAction(input: {
  tripId: string;
  email: string;
  role?: "editor" | "viewer";
}): Promise<
  | { ok: true; inviteUrl: string; collaborator: Collaborator }
  | { ok: false; error: string }
> {
  const user = await requireUser();
  const supabase = await createClient();
  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Enter a valid email" };
  }

  const { data: trip } = await supabase
    .from("trips")
    .select("id, owner_id, title")
    .eq("id", input.tripId)
    .single();
  if (!trip || trip.owner_id !== user.id) {
    return { ok: false, error: "Only the trip owner can invite" };
  }

  const { data, error } = await supabase
    .from("trip_collaborators")
    .upsert(
      {
        trip_id: input.tripId,
        email,
        role: input.role || "viewer",
        invited_by: user.id,
        status: "pending",
      },
      { onConflict: "trip_id,email" },
    )
    .select("*")
    .single();

  if (error) return { ok: false, error: error.message };

  const inviteUrl = `${getAppUrl()}/invite/${data.invite_token}`;
  revalidatePath(`/trips/${input.tripId}`);
  return {
    ok: true,
    inviteUrl,
    collaborator: data as Collaborator,
  };
}

export async function revokeCollaboratorAction(
  collaboratorId: string,
  tripId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: trip } = await supabase
    .from("trips")
    .select("owner_id")
    .eq("id", tripId)
    .single();
  if (!trip || trip.owner_id !== user.id) {
    return { ok: false, error: "Only the owner can revoke access" };
  }

  const { error } = await supabase
    .from("trip_collaborators")
    .update({ status: "revoked" })
    .eq("id", collaboratorId)
    .eq("trip_id", tripId);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/trips/${tripId}`);
  return { ok: true };
}

export async function acceptInviteAction(
  token: string,
): Promise<{ ok: true; tripId: string } | { ok: false; error: string }> {
  await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_trip_invite", {
    p_token: token,
  });
  if (error) return { ok: false, error: error.message };
  const tripId = data as string;
  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/trips");
  return { ok: true, tripId };
}
