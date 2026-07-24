import { anthropic } from "@ai-sdk/anthropic";
import { xai } from "@ai-sdk/xai";
import {
  isAnthropicConfigured,
  isXaiConfigured,
} from "@/lib/config";

/**
 * Prefer Grok (xAI), then Claude.
 * Default to a faster non-reasoning Grok model so Netlify functions finish in time.
 * Override with XAI_MODEL (e.g. grok-4.5 for higher quality).
 */
export function getPlanningModel() {
  if (isXaiConfigured()) {
    // grok-4.20-non-reasoning is faster; fall back to env override for quality
    return xai(process.env.XAI_MODEL || "grok-4.20-non-reasoning");
  }
  if (isAnthropicConfigured()) {
    return anthropic(process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5");
  }
  return null;
}

export function getAiProviderLabel() {
  if (isXaiConfigured()) {
    return `Grok (${process.env.XAI_MODEL || "grok-4.20-non-reasoning"})`;
  }
  if (isAnthropicConfigured()) return "Claude (Anthropic)";
  return "demo mock";
}
