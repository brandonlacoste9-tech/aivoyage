export type DestinationSeed = {
  name: string;
  blurb: string;
  tags: string;
  season: string;
  image: string;
  prompt: string;
};

export const DESTINATIONS: DestinationSeed[] = [
  {
    name: "Kyoto",
    blurb: "Temples, tea houses, golden-hour alleys",
    tags: "culture · food",
    season: "Best in autumn",
    image:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    prompt: "7-day Kyoto food and culture trip, temples at dawn, kaiseki dinners",
  },
  {
    name: "Lisbon",
    blurb: "Hills, miradouros, late dinners",
    tags: "food · walks",
    season: "Year-round light",
    image:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80",
    prompt: "5-day Lisbon getaway with food, viewpoints, and one beach day",
  },
  {
    name: "Bali",
    blurb: "Rice terraces, temples, slow mornings",
    tags: "nature · relax",
    season: "Dry season magic",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    prompt: "Week in Bali: beaches, rice terraces, temples, relaxed pace",
  },
  {
    name: "Rome",
    blurb: "History stacked on long lunches",
    tags: "history · food",
    season: "Spring & fall",
    image:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
    prompt: "Rome first-timers: landmarks, pasta, gelato, no FOMO",
  },
  {
    name: "Seoul",
    blurb: "Palaces by day, neon by night",
    tags: "culture · nightlife",
    season: "Cherry blossom",
    image:
      "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1200&q=80",
    prompt: "Seoul culture and food week with markets and nightlife",
  },
  {
    name: "New York",
    blurb: "Neighborhoods that feel like countries",
    tags: "city · food",
    season: "Fall energy",
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80",
    prompt: "Long weekend in New York: food, museums, neighborhoods",
  },
  {
    name: "Paris",
    blurb: "Cafés, museums, flâneur evenings",
    tags: "culture · romance",
    season: "Spring light",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    prompt: "Romantic 5 days in Paris: museums, cafés, evening walks",
  },
  {
    name: "Tokyo",
    blurb: "Neon, temples, perfect bowls of ramen",
    tags: "food · city",
    season: "Anytime energy",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
    prompt: "Tokyo food and culture: neighborhoods, ramen, temples, night streets",
  },
];

/** Best-effort cover image for a free-text destination. */
export function coverForDestination(destination: string): string {
  const key = destination.toLowerCase();
  const hit = DESTINATIONS.find((d) => key.includes(d.name.toLowerCase()));
  if (hit) return hit.image;
  // Generic travel fallback
  return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";
}
