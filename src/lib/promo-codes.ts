/**
 * In-app promo codes for Trip Planner (trip-planner.co).
 * Codes are case-insensitive. Keep this list server-only.
 */

export type PromoEffect =
  | { type: "pro_days"; days: number; label: string }
  | { type: "bonus_gens"; count: number; label: string };

export type PromoDefinition = {
  code: string;
  effect: PromoEffect;
  /** Max total redemptions across all users (null = unlimited) */
  maxRedemptions: number | null;
  active: boolean;
  description: string;
};

export const PROMO_CODES: PromoDefinition[] = [
  {
    code: "TRIPPLANNER-VIP",
    effect: { type: "pro_days", days: 90, label: "Pro for 90 days" },
    maxRedemptions: null,
    active: true,
    description: "Founder launch — 3 months of Pro free",
  },
  {
    code: "LAUNCH2026",
    effect: { type: "pro_days", days: 30, label: "Pro for 30 days" },
    maxRedemptions: 500,
    active: true,
    description: "Launch offer — 1 month of Pro",
  },
  {
    code: "EXTRA5",
    effect: { type: "bonus_gens", count: 5, label: "+5 AI generations" },
    maxRedemptions: null,
    active: true,
    description: "Five extra free AI plans this month",
  },
];

export function findPromo(code: string): PromoDefinition | null {
  const normalized = code.trim().toUpperCase();
  return (
    PROMO_CODES.find((p) => p.code === normalized && p.active) ?? null
  );
}

/** Primary code for the founder to share */
export const FOUNDER_PROMO_CODE = "TRIPPLANNER-VIP";
