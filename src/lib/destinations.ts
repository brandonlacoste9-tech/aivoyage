export type DestinationSeed = {
  name: string;
  blurb: string;
  tags: string;
  season: string;
  image: string;
  prompt: string;
  /** Answer-first summary for SEO / AI citation */
  summary: string;
  /** Practical highlights (quotable bullets) */
  highlights: string[];
  /** Best time / logistics notes */
  bestTime: string;
  /** Suggested trip length */
  tripLength: string;
  faqs: Array<{ question: string; answer: string }>;
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
    summary:
      "Kyoto is Japan’s cultural capital — best planned as a mix of early temple visits, neighborhood walks (Gion, Arashiyama, Higashiyama), and unhurried meals. A 5–7 day AI itinerary should balance famous sites with quieter alleys and avoid packing every shrine into one day.",
    highlights: [
      "Start temples at opening time to beat crowds",
      "Cluster days by neighborhood to cut transit time",
      "Book at least one kaiseki or tea experience in advance",
      "Autumn foliage and spring cherry blossom are peak seasons",
    ],
    bestTime: "Late March–April (cherry blossom) and November (fall color); shoulder seasons are milder and less crowded.",
    tripLength: "5–7 days",
    faqs: [
      {
        question: "How many days do you need in Kyoto?",
        answer:
          "Most first-timers do well with 5–7 days: enough for temples, food, Arashiyama, and one slower neighborhood day without rushing.",
      },
      {
        question: "Is Kyoto good for a food-focused trip?",
        answer:
          "Yes. Plan kaiseki, street snacks, coffee, and tea houses into the day-by-day schedule rather than treating meals as leftovers.",
      },
    ],
  },
  {
    name: "Lisbon",
    blurb: "Hills, miradouros, late dinners",
    tags: "food · walks",
    season: "Year-round light",
    image:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80",
    prompt: "5-day Lisbon getaway with food, viewpoints, and one beach day",
    summary:
      "Lisbon rewards walkable, viewpoint-heavy itineraries with long lunches and late dinners. A strong 4–6 day plan covers Alfama, Baixa, Belém, a miradouro circuit, and optionally Cascais or Sintra as a day trip.",
    highlights: [
      "Build days around hills and tram corridors",
      "Reserve one full food day (markets + tascas)",
      "Add Sintra or Cascais if you have 5+ days",
      "Evenings work best for miradouros and soft light",
    ],
    bestTime: "April–June and September–October for mild weather; summer is lively but hotter and busier.",
    tripLength: "4–6 days",
    faqs: [
      {
        question: "Is Lisbon walkable for a city break?",
        answer:
          "Yes, but hills are real. Group activities by neighborhood and use trams or metro between clusters to keep the plan realistic.",
      },
      {
        question: "Should I add Sintra to a Lisbon itinerary?",
        answer:
          "If you have 5+ days, yes — plan Sintra as a full day with an early start so you are not rushing palaces at closing time.",
      },
    ],
  },
  {
    name: "Bali",
    blurb: "Rice terraces, temples, slow mornings",
    tags: "nature · relax",
    season: "Dry season magic",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    prompt: "Week in Bali: beaches, rice terraces, temples, relaxed pace",
    summary:
      "Bali works best as a multi-base trip: Ubud for culture and rice terraces, south coast for beaches, and optional north/east for quieter nature. A 7–10 day itinerary should include travel buffers between areas.",
    highlights: [
      "Split the week between Ubud and a beach base",
      "Keep one day almost empty for rest",
      "Temples and terraces pair well in the same region day",
      "Dry season (roughly Apr–Oct) is easiest for outdoor plans",
    ],
    bestTime: "April–October dry season is most reliable for beaches and outdoor days.",
    tripLength: "7–10 days",
    faqs: [
      {
        question: "How should I structure a week in Bali?",
        answer:
          "Spend 3–4 nights in Ubud and 3–4 on the coast. Build transfer days lightly so you are not sightseeing after long drives.",
      },
      {
        question: "Is Bali good for a relaxed honeymoon or slow trip?",
        answer:
          "Yes — prioritize fewer bases, spa or beach blocks, and one highlight outing per day rather than island-wide hopping.",
      },
    ],
  },
  {
    name: "Rome",
    blurb: "History stacked on long lunches",
    tags: "history · food",
    season: "Spring & fall",
    image:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
    prompt: "Rome first-timers: landmarks, pasta, gelato, no FOMO",
    summary:
      "Rome is dense: the best first-timer itineraries cluster ancient sites, Vatican, Trastevere, and centro storico with long meal breaks. Three to five days covers icons without turning the trip into a checklist sprint.",
    highlights: [
      "Book Vatican and Colosseum tickets ahead",
      "Alternate heavy monument mornings with food afternoons",
      "Trastevere and Testaccio reward dinner-focused evenings",
      "Spring and fall beat midsummer heat",
    ],
    bestTime: "April–May and September–October for comfortable walking weather.",
    tripLength: "3–5 days",
    faqs: [
      {
        question: "How many days in Rome for first-timers?",
        answer:
          "Three full days cover the essentials; five days lets you slow down for neighborhoods, markets, and day trips like Tivoli or Ostia.",
      },
      {
        question: "Can an AI itinerary help with Rome crowds?",
        answer:
          "Yes — a good plan sequences major sites early, groups nearby landmarks, and leaves buffer time for security lines and meals.",
      },
    ],
  },
  {
    name: "Seoul",
    blurb: "Palaces by day, neon by night",
    tags: "culture · nightlife",
    season: "Cherry blossom",
    image:
      "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=1200&q=80",
    prompt: "Seoul culture and food week with markets and nightlife",
    summary:
      "Seoul shines when days mix palaces and neighborhoods (Insadong, Hongdae, Itaewon, Gangnam) with market food and nightlife. A 5–7 day plan can include a day trip to Suwon or the DMZ if desired.",
    highlights: [
      "Palace mornings + neighborhood afternoons work well",
      "Build at least two dedicated food market blocks",
      "Use metro corridors to structure days",
      "Spring cherry blossom and autumn foliage are peak photo seasons",
    ],
    bestTime: "April–May and late September–November are especially pleasant.",
    tripLength: "5–7 days",
    faqs: [
      {
        question: "Is Seoul better as a food trip or culture trip?",
        answer:
          "Both — the strongest itineraries deliberately interleave palaces/museums with markets, cafés, and evening neighborhoods.",
      },
      {
        question: "Do I need more than a long weekend in Seoul?",
        answer:
          "A long weekend works for highlights; five or more days is better if you want nightlife, shopping, and a day trip without rushing.",
      },
    ],
  },
  {
    name: "New York",
    blurb: "Neighborhoods that feel like countries",
    tags: "city · food",
    season: "Fall energy",
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80",
    prompt: "Long weekend in New York: food, museums, neighborhoods",
    summary:
      "New York is neighborhood-first planning: pick 1–2 areas per day (e.g. Downtown + West Village, UES museums + Central Park, Brooklyn food). A 3–5 day itinerary should mix icons with local food stops and transit realism.",
    highlights: [
      "One major museum day max for most short trips",
      "Pair parks with nearby neighborhoods",
      "Reserve dinner for high-demand spots",
      "Fall and late spring feel especially energetic outdoors",
    ],
    bestTime: "April–June and September–November; December is festive but crowded.",
    tripLength: "3–5 days",
    faqs: [
      {
        question: "How do you plan NYC without wasting time on transit?",
        answer:
          "Cluster by borough and neighborhood each day. Crossing the city twice in one afternoon is the most common first-timer mistake.",
      },
      {
        question: "Is New York good for a food-focused AI itinerary?",
        answer:
          "Yes — build meal anchors first, then place museums and walks around them so the day stays enjoyable.",
      },
    ],
  },
  {
    name: "Paris",
    blurb: "Cafés, museums, flâneur evenings",
    tags: "culture · romance",
    season: "Spring light",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    prompt: "Romantic 5 days in Paris: museums, cafés, evening walks",
    summary:
      "Paris rewards unhurried, arrondissement-based days: one major museum or landmark per half-day, café time, and evening walks along the Seine. Four to six days is ideal for first-timers who want romance without burnout.",
    highlights: [
      "Limit major museums to one primary site per day",
      "Walk between nearby arrondissements when possible",
      "Evenings are for light shows, river walks, and long dinners",
      "Spring and early fall offer the best outdoor pacing",
    ],
    bestTime: "April–June and September–October for pleasant walking weather.",
    tripLength: "4–6 days",
    faqs: [
      {
        question: "How many days do you need in Paris?",
        answer:
          "Four full days covers core highlights at a human pace; six days allows Montmartre, a market day, and Versailles without rushing.",
      },
      {
        question: "What makes a good romantic Paris itinerary?",
        answer:
          "Fewer checkboxes, more cafés, golden-hour walks, and one special dinner — with logistics handled so you are not queueing all day.",
      },
    ],
  },
  {
    name: "Tokyo",
    blurb: "Neon, temples, perfect bowls of ramen",
    tags: "food · city",
    season: "Anytime energy",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
    prompt: "Tokyo food and culture: neighborhoods, ramen, temples, night streets",
    summary:
      "Tokyo is best planned by neighborhood clusters: Asakusa/Skytree, Shibuya/Harajuku, Shinjuku, and a quieter day in Yanaka or Odaiba. Food should be a primary axis of the itinerary, not an afterthought.",
    highlights: [
      "One neighborhood focus per day beats city-wide hopping",
      "Book popular restaurants and teamLab-style attractions early",
      "Mix neon nights with at least one temple/garden morning",
      "Works year-round; cherry blossom and autumn are peak beauty",
    ],
    bestTime: "March–April and October–November are especially popular; any season works with indoor backup plans.",
    tripLength: "5–8 days",
    faqs: [
      {
        question: "How many days in Tokyo is enough?",
        answer:
          "Five days covers major neighborhoods; seven to eight days is better if you want day trips (Nikko, Kamakura, Hakone) or deeper food exploration.",
      },
      {
        question: "Should I use an AI itinerary for Tokyo?",
        answer:
          "Yes — Tokyo’s scale rewards pre-clustered days, timed transit, and meal anchors so you do not waste energy crossing the city randomly.",
      },
    ],
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

export function destinationSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}
