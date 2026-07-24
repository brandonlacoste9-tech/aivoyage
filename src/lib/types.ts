export type Plan = "free" | "pro";
export type TripStatus = "draft" | "generating" | "ready" | "failed" | "archived";
export type ActivityType =
  | "food"
  | "culture"
  | "nature"
  | "nightlife"
  | "shopping"
  | "transport"
  | "stay"
  | "other";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  plan: Plan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  ai_generations_month: number;
  ai_generations_reset_at: string;
  created_at: string;
}

export interface Trip {
  id: string;
  owner_id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget_cents: number | null;
  currency: string;
  preferences: TripPreferences;
  status: TripStatus;
  share_token: string | null;
  cover_url: string | null;
  error_message: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TripPreferences {
  pace?: "relaxed" | "balanced" | "packed";
  interests?: string[];
  travelers?: number;
  style?: string;
  prompt?: string;
}

export interface Day {
  id: string;
  trip_id: string;
  date: string;
  day_order: number;
  notes: string | null;
}

export interface Activity {
  id: string;
  day_id: string;
  title: string;
  description: string | null;
  type: ActivityType;
  start_time: string | null;
  duration_min: number | null;
  cost_cents: number | null;
  lat: number | null;
  lng: number | null;
  place_id: string | null;
  address: string | null;
  sort_order: number;
  notes: string | null;
}

export interface Expense {
  id: string;
  trip_id: string;
  activity_id: string | null;
  amount_cents: number;
  category: string;
  note: string | null;
  created_at: string;
}

export interface TripWithDetails extends Trip {
  days: (Day & { activities: Activity[] })[];
  expenses: Expense[];
}

export interface WeatherDay {
  date: string;
  temp_max: number;
  temp_min: number;
  condition: string;
  icon: string;
  precip_chance: number;
}
