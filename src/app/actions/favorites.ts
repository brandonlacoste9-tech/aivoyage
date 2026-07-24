"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { Activity } from "@/lib/types";

export type FavoritePlace = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: string;
  destination: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  image_url: string | null;
  notes: string | null;
  activity_id: string | null;
  created_at: string;
};

export async function listFavoritesAction(): Promise<FavoritePlace[]> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorite_places")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("list favorites", error.message);
    return [];
  }
  return (data ?? []) as FavoritePlace[];
}

export async function saveFavoriteFromActivityAction(input: {
  activity: Pick<
    Activity,
    | "id"
    | "title"
    | "description"
    | "type"
    | "address"
    | "lat"
    | "lng"
  >;
  destination?: string;
  imageUrl?: string | null;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("favorite_places")
    .insert({
      user_id: user.id,
      title: input.activity.title,
      description: input.activity.description,
      type: input.activity.type,
      destination: input.destination ?? null,
      address: input.activity.address,
      lat: input.activity.lat,
      lng: input.activity.lng,
      image_url: input.imageUrl ?? null,
      activity_id: input.activity.id,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath("/favorites");
  return { ok: true, id: data.id };
}

export async function deleteFavoriteAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("favorite_places")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/favorites");
  return { ok: true };
}
