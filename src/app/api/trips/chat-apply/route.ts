import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileRow } from "@/lib/auth";
import { getPlanningModel } from "@/lib/ai/model";
import { isAiConfigured, isSupabaseConfigured } from "@/lib/config";
import { applyItineraryPatchesAction } from "@/app/actions/activities";

export const maxDuration = 60;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  reply: z.string().describe("Friendly message to the user about what changed"),
  patches: z.array(
    z.object({
      action: z.enum(["update", "add", "delete", "move"]),
      activityId: z.string().optional(),
      dayNumber: z.number().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      type: z
        .enum([
          "food",
          "culture",
          "nature",
          "nightlife",
          "shopping",
          "transport",
          "stay",
          "other",
        ])
        .optional(),
      start_time: z.string().optional(),
      duration_min: z.number().optional(),
      cost_cents: z.number().optional(),
    }),
  ),
});

export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ ok: false, error: "Supabase not configured" }, { status: 500 });
    }
    const body = await req.json();
    const tripId = body.tripId as string;
    const message = String(body.message || "").trim();
    if (!tripId || !message) {
      return NextResponse.json({ ok: false, error: "tripId and message required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
    }
    await ensureProfileRow(user.id, user.email);

    const { data: trip } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .single();
    if (!trip) {
      return NextResponse.json({ ok: false, error: "Trip not found" }, { status: 404 });
    }

    const { data: days } = await supabase
      .from("days")
      .select("id, day_order, date, notes")
      .eq("trip_id", tripId)
      .order("day_order");
    const dayIds = (days ?? []).map((d) => d.id);
    const { data: acts } = dayIds.length
      ? await supabase
          .from("activities")
          .select("id, day_id, title, type, start_time, cost_cents, description")
          .in("day_id", dayIds)
          .order("sort_order")
      : { data: [] };

    const itinerary = (days ?? []).map((d) => ({
      day_number: d.day_order,
      date: d.date,
      notes: d.notes,
      activities: (acts ?? [])
        .filter((a) => a.day_id === d.id)
        .map((a) => ({
          id: a.id,
          title: a.title,
          type: a.type,
          start_time: a.start_time,
          cost_cents: a.cost_cents,
          description: a.description,
        })),
    }));

    const model = getPlanningModel();
    if (!model || !isAiConfigured()) {
      return NextResponse.json({
        ok: true,
        reply: `I'd update the trip for "${message}" but AI is not configured. Try regenerating a day from the day tabs.`,
        applied: 0,
      });
    }

    const { output } = await generateText({
      model,
      system: `You are Trip Planner on trip-planner.co. Given the current itinerary and a user request, respond with:
1) a short friendly reply
2) concrete patches to apply (use real activityId values from the itinerary for updates/deletes).
Only emit patches you are confident about. Prefer update over delete. For new stops use action add + dayNumber.`,
      prompt: `Current itinerary JSON:
${JSON.stringify(itinerary, null, 2)}

User request: ${message}

Return patches that implement the request.`,
      output: Output.object({ schema: patchSchema }),
      maxOutputTokens: 2500,
      temperature: 0.4,
    });

    if (!output) {
      return NextResponse.json({
        ok: true,
        reply: "I understood your request but couldn't structure the changes. Try being more specific (e.g. 'remove the museum on day 2').",
        applied: 0,
      });
    }

    let applied = 0;
    if (output.patches?.length) {
      const res = await applyItineraryPatchesAction({
        tripId,
        patches: output.patches,
      });
      if (res.ok) applied = res.data?.applied ?? 0;
    }

    return NextResponse.json({
      ok: true,
      reply: output.reply,
      applied,
      patchCount: output.patches?.length ?? 0,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Chat apply failed" },
      { status: 500 },
    );
  }
}
