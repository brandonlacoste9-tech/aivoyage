import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ensureProfileRow } from "@/lib/auth";
import { getPlanningModel } from "@/lib/ai/model";
import {
  isAiConfigured,
  isSupabaseConfigured,
} from "@/lib/config";
import { buildPhotoVibeSystemPrompt } from "@/lib/ai/prompts";

export const maxDuration = 60;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const vibeSchema = z.object({
  destination_guess: z.string(),
  vibe: z.string(),
  interests: z.array(z.string()).default([]),
  pace: z.enum(["relaxed", "balanced", "packed"]).default("balanced"),
  suggested_days: z.coerce.number().int().min(2).max(14).default(5),
  prompt: z.string(),
});

/**
 * Analyze a travel photo (Instagram export, screenshot, vibe image)
 * and return structured planning signals — no real Instagram API needed.
 */
export async function POST(req: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Supabase not configured" },
        { status: 500 },
      );
    }
    if (!isAiConfigured()) {
      return NextResponse.json(
        { ok: false, error: "AI not configured" },
        { status: 503 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Not signed in" },
        { status: 401 },
      );
    }
    await ensureProfileRow(user.id, user.email);

    const form = await req.formData();
    const file = form.get("image") as File | null;
    const imageUrl = String(form.get("imageUrl") || "").trim();

    let imagePart:
      | { type: "image"; image: string }
      | { type: "image"; image: Uint8Array }
      | null = null;

    if (file && file.size > 0) {
      if (file.size > 8 * 1024 * 1024) {
        return NextResponse.json(
          { ok: false, error: "Image must be under 8MB" },
          { status: 400 },
        );
      }
      const buf = new Uint8Array(await file.arrayBuffer());
      imagePart = { type: "image", image: buf };
    } else if (imageUrl && /^https?:\/\//i.test(imageUrl)) {
      imagePart = { type: "image", image: imageUrl };
    } else {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Upload a photo or paste an image URL (Instagram download / export works).",
        },
        { status: 400 },
      );
    }

    const model = getPlanningModel();
    if (!model) {
      return NextResponse.json(
        { ok: false, error: "No model" },
        { status: 503 },
      );
    }

    // Prefer vision-capable model id when available
    const visionModel =
      process.env.XAI_VISION_MODEL ||
      process.env.XAI_MODEL ||
      "grok-4.20-non-reasoning";

    const { xai } = await import("@ai-sdk/xai");
    const { anthropic } = await import("@ai-sdk/anthropic");
    const { isXaiConfigured } = await import("@/lib/config");

    const m = isXaiConfigured()
      ? xai(visionModel)
      : anthropic(process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5");

    const { output } = await generateText({
      model: m,
      system: buildPhotoVibeSystemPrompt(),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this travel photo and return planning signals as structured data. If it looks like Instagram aesthetic, extract the vibe.",
            },
            imagePart,
          ],
        },
      ],
      output: Output.object({ schema: vibeSchema }),
      maxOutputTokens: 1200,
      temperature: 0.5,
    });

    if (!output) {
      return NextResponse.json(
        { ok: false, error: "Could not analyze photo" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, analysis: output });
  } catch (e) {
    console.error("[from-photo]", e);
    return NextResponse.json(
      {
        ok: false,
        error:
          e instanceof Error
            ? e.message
            : "Photo analysis failed — try a clearer travel image",
      },
      { status: 500 },
    );
  }
}
