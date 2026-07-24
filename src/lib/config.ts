export const APP_NAME = "VoyageAI";
export const APP_TAGLINE = "Itineraries that feel like a local wrote them";

export const FREE_AI_GENERATIONS_PER_MONTH = 3;
export const FREE_ACTIVE_TRIPS = 3;

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function isAnthropicConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function isMapboxConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);
}

export function isWeatherConfigured() {
  return Boolean(process.env.WEATHER_API_KEY);
}

export function isStripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_PRO,
  );
}

export function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
