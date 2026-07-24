import type { TripWithDetails, WeatherDay } from "@/lib/types";

export type PackingItem = {
  id: string;
  label: string;
  category: string;
  checked?: boolean;
};

export function buildPackingList(
  trip: TripWithDetails,
  weather: WeatherDay[] | null,
): PackingItem[] {
  const items: PackingItem[] = [];
  const add = (category: string, label: string) => {
    items.push({
      id: `${category}-${label}`.toLowerCase().replace(/\s+/g, "-"),
      label,
      category,
      checked: false,
    });
  };

  // Basics
  add("essentials", "Passport / ID");
  add("essentials", "Phone + charger");
  add("essentials", "Wallet & cards");
  add("essentials", "Medications");
  add("essentials", "Reusable water bottle");

  const types = new Set(
    trip.days.flatMap((d) => d.activities.map((a) => a.type)),
  );

  if (types.has("nature")) {
    add("clothing", "Comfortable walking shoes");
    add("gear", "Daypack");
    add("gear", "Sunglasses");
  }
  if (types.has("culture")) {
    add("clothing", "Smart-casual outfit for temples/museums");
    add("clothing", "Modest cover-up (shoulders/knees)");
  }
  if (types.has("nightlife")) {
    add("clothing", "Evening outfit");
  }
  if (types.has("food")) {
    add("essentials", "Cash for markets");
  }
  if (types.has("shopping")) {
    add("gear", "Foldable tote bag");
  }

  // Weather-based
  const rainy = weather?.some((w) => w.precip_chance >= 40);
  const hot = weather?.some((w) => w.temp_max >= 28);
  const cold = weather?.some((w) => w.temp_min <= 10);

  if (rainy) {
    add("weather", "Compact umbrella");
    add("weather", "Light rain jacket");
  }
  if (hot) {
    add("weather", "Sunscreen SPF 30+");
    add("weather", "Hat / cap");
    add("clothing", "Breathable shirts");
  }
  if (cold) {
    add("weather", "Warm layer / fleece");
    add("clothing", "Closed-toe shoes");
  }
  if (!hot && !cold) {
    add("clothing", "Layers for mild weather");
  }

  add("tech", "Power bank");
  add("tech", "Universal adapter (if abroad)");
  add("health", "Basic first-aid / band-aids");

  // Deduplicate by id
  const seen = new Set<string>();
  return items.filter((i) => {
    if (seen.has(i.id)) return false;
    seen.add(i.id);
    return true;
  });
}
