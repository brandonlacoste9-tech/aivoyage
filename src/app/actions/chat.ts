"use server";

import { generateText } from "ai";
import { requireUser } from "@/lib/auth";
import { isAiConfigured } from "@/lib/config";
import { buildChatSystemPrompt } from "@/lib/ai/prompts";
import { getAiProviderLabel, getPlanningModel } from "@/lib/ai/model";
import { getTripWithDetails } from "@/app/actions/trips";

export async function chatAboutTripText(
  tripId: string,
  message: string,
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  try {
    const user = await requireUser();
    const trip = await getTripWithDetails(tripId);
    if (!trip || trip.owner_id !== user.id) {
      return { ok: false, error: "Trip not found" };
    }

    const model = getPlanningModel();
    if (!model || !isAiConfigured()) {
      return {
        ok: true,
        text: `I'd love to help refine **${trip.title}** in ${trip.destination}!

*(Demo mode — add \`XAI_API_KEY\` for live Grok chat, or \`ANTHROPIC_API_KEY\` for Claude.)*

You said: "${message}"

Ideas based on your ${trip.days.length}-day plan:
1. Cluster food and culture stops by neighborhood to cut transit time.
2. Keep one flexible half-day for weather or serendipity.
3. Cap daily paid activities if you're tracking budget closely.

Tell me which day to change, or ask for more food / slower pace / nightlife.`,
      };
    }

    const itineraryJson = JSON.stringify(
      {
        title: trip.title,
        destination: trip.destination,
        days: trip.days.map((d) => ({
          date: d.date,
          notes: d.notes,
          activities: d.activities.map((a) => ({
            title: a.title,
            type: a.type,
            start_time: a.start_time,
            cost_cents: a.cost_cents,
          })),
        })),
      },
      null,
      2,
    );

    const { text } = await generateText({
      model,
      system: buildChatSystemPrompt(itineraryJson),
      prompt: message,
    });

    return { ok: true, text };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : `Chat failed (${getAiProviderLabel()})`,
    };
  }
}
