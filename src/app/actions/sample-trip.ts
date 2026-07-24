"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { generateShareToken } from "@/lib/utils";
import { fallbackCoords } from "@/lib/mapbox";

/** Create a ready-made sample Kyoto trip for first-time users. */
export async function createSampleTripAction(): Promise<
  { ok: true; id: string } | { ok: false; error: string }
> {
  try {
    const profile = await requireProfile();
    const supabase = await createClient();

    const { count } = await supabase
      .from("trips")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", profile.id);
    if ((count ?? 0) > 0) {
      return { ok: false, error: "You already have trips" };
    }

    const start = new Date();
    start.setDate(start.getDate() + 30);
    const end = new Date(start);
    end.setDate(end.getDate() + 2);
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    const { data: trip, error } = await supabase
      .from("trips")
      .insert({
        owner_id: profile.id,
        title: "Sample: Kyoto long weekend",
        destination: "Kyoto",
        start_date: startStr,
        end_date: endStr,
        budget_cents: 120000,
        preferences: {
          pace: "balanced",
          interests: ["culture", "food"],
          prompt: "Sample onboarding trip",
        },
        status: "ready",
        share_token: generateShareToken(),
        notes:
          "This is a sample itinerary so you can explore the workspace. Delete it anytime and plan your own trip.",
      })
      .select("id")
      .single();

    if (error || !trip) {
      return { ok: false, error: error?.message || "Could not create sample" };
    }

    const days = [
      {
        order: 1,
        notes: "Arrive and settle into Gion",
        acts: [
          {
            title: "Check-in near Yasaka",
            type: "stay",
            start: "15:00",
            cost: 0,
            desc: "Drop bags and orient yourself.",
          },
          {
            title: "Kiyomizu-dera at golden hour",
            type: "culture",
            start: "17:00",
            cost: 400,
            desc: "Iconic hillside temple with city views.",
          },
          {
            title: "Kaiseki dinner in a machiya",
            type: "food",
            start: "19:30",
            cost: 12000,
            desc: "Seasonal multi-course Kyoto cuisine.",
          },
        ],
      },
      {
        order: 2,
        notes: "Temples and markets",
        acts: [
          {
            title: "Fushimi Inari early",
            type: "nature",
            start: "07:30",
            cost: 0,
            desc: "Thousand torii gates before crowds.",
          },
          {
            title: "Nishiki Market lunch crawl",
            type: "food",
            start: "12:00",
            cost: 3500,
            desc: "Skewer snacks and local specialties.",
          },
          {
            title: "Arashiyama bamboo & tea",
            type: "culture",
            start: "15:00",
            cost: 1500,
            desc: "Bamboo grove walk and a quiet tea house.",
          },
        ],
      },
      {
        order: 3,
        notes: "Slow morning and departure",
        acts: [
          {
            title: "Philosopher’s Path stroll",
            type: "nature",
            start: "09:00",
            cost: 0,
            desc: "Canal-side walk with small temples.",
          },
          {
            title: "Final matcha & souvenirs",
            type: "shopping",
            start: "11:30",
            cost: 2500,
            desc: "Pick up tea and sweets for home.",
          },
        ],
      },
    ];

    let ai = 0;
    for (const d of days) {
      const date = new Date(start);
      date.setDate(start.getDate() + (d.order - 1));
      const { data: dayRow, error: dayErr } = await supabase
        .from("days")
        .insert({
          trip_id: trip.id,
          date: date.toISOString().slice(0, 10),
          day_order: d.order,
          notes: d.notes,
        })
        .select("id")
        .single();
      if (dayErr || !dayRow) continue;

      const rows = d.acts.map((a, idx) => {
        const fb = fallbackCoords("Kyoto", ai++);
        return {
          day_id: dayRow.id,
          title: a.title,
          description: a.desc,
          type: a.type,
          start_time: a.start,
          duration_min: 90,
          cost_cents: a.cost,
          lat: fb.lat,
          lng: fb.lng,
          sort_order: idx,
        };
      });
      await supabase.from("activities").insert(rows);
    }

    revalidatePath("/dashboard");
    revalidatePath("/trips");
    return { ok: true, id: trip.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Sample trip failed",
    };
  }
}
