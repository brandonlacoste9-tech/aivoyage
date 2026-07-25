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
  | "trip_created"
  | "trip_generated"
  | "checkout_started"
  | "promo_redeemed"
  | "share_created"
  | "explore_country_lookup";

/** Fire-and-forget client event (requires PostHog provider mounted). */
export function trackEvent(
  name: AnalyticsEvent | string,
  properties?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  try {
    // Dynamic access avoids hard crash if provider not loaded
    const ph = (
      window as unknown as {
        posthog?: { capture: (e: string, p?: Record<string, unknown>) => void };
      }
    ).posthog;
    ph?.capture(name, properties);
  } catch {
    /* ignore */
  }
}
