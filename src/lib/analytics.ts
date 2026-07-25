/**
 * Client analytics helpers (PostHog). Safe no-ops when not configured.
 */

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
export const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

export function isPostHogConfigured() {
  return Boolean(POSTHOG_KEY);
}

export type AnalyticsEvent =
  | "signup_completed"
  | "user_signed_in"
  | "user_signed_out"
  | "trip_created"
  | "trip_generated"
  | "paywall_shown"
  | "checkout_started"
  | "promo_redeemed"
  | "share_created"
  | "ai_chat_sent"
  | "explore_country_lookup";

/** Fire-and-forget client event. Initialized via instrumentation-client.ts. */
export function trackEvent(
  name: AnalyticsEvent | string,
  properties?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  if (!isPostHogConfigured()) return;
  try {
    import("posthog-js").then(({ default: posthog }) => {
      posthog.capture(name, properties);
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}
