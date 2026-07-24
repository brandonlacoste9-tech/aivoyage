import { anthropic } from "@ai-sdk/anthropic";
import { xai } from "@ai-sdk/xai";
import {
  isAnthropicConfigured,
  isXaiConfigured,
} from "@/lib/config";

/** Prefer Grok (xAI), then Claude. Returns null if no AI key is set. */
export function getPlanningModel() {
  if (isXaiConfigured()) {
    return xai(process.env.XAI_MODEL || "grok-4.5");
  }
  if (isAnthropicConfigured()) {
    return anthropic(process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5");
  }
  return null;
}

export function getAiProviderLabel() {
  if (isXaiConfigured()) return "Grok (xAI)";
  if (isAnthropicConfigured()) return "Claude (Anthropic)";
  return "demo mock";
}
