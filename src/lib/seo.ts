import { APP_DOMAIN, APP_NAME, APP_TAGLINE, getAppUrl } from "@/lib/config";

export const SEO_DEFAULT_DESCRIPTION =
  "AI travel planner that turns a half-formed idea into a day-by-day itinerary with real places, maps, weather, and budget — then refine it in chat. Free to start.";

export const SEO_KEYWORDS = [
  "AI trip planner",
  "AI itinerary generator",
  "travel planner",
  "day by day itinerary",
  "trip planning app",
  "AI travel planning",
  "vacation itinerary",
  "Trip Planner",
  "trip-planner.co",
] as const;

export function absoluteUrl(path = "/") {
  const base = getAppUrl().replace(/\/$/, "");
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function siteMetadataBase() {
  return new URL(getAppUrl().endsWith("/") ? getAppUrl() : `${getAppUrl()}/`);
}

type JsonLd = Record<string, unknown>;

export function jsonLdScript(data: JsonLd | JsonLd[]) {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}

/** Organization + WebSite entity for classic SEO and AI answer engines */
export function organizationSchema(): JsonLd {
  const url = absoluteUrl("/");
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    alternateName: ["Trip Planner AI", "trip-planner.co"],
    url,
    logo: absoluteUrl("/favicon.ico"),
    description: SEO_DEFAULT_DESCRIPTION,
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: absoluteUrl("/pricing"),
    },
  };
}

export function websiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    alternateName: "trip-planner.co",
    url: absoluteUrl("/"),
    description: APP_TAGLINE,
    publisher: {
      "@type": "Organization",
      name: APP_NAME,
      url: absoluteUrl("/"),
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/explore?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function softwareApplicationSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: APP_NAME,
    applicationCategory: "TravelApplication",
    operatingSystem: "Web",
    url: absoluteUrl("/"),
    description: SEO_DEFAULT_DESCRIPTION,
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        name: "Explorer (Free)",
        description: "3 AI itineraries per month, maps, weather, share links",
      },
      {
        "@type": "Offer",
        price: "12",
        priceCurrency: "USD",
        name: "Voyager Pro",
        description: "Unlimited AI itineraries and active trips",
        url: absoluteUrl("/pricing"),
      },
    ],
    featureList: [
      "AI day-by-day itinerary generation",
      "Interactive maps with activity pins",
      "Weather-aware planning",
      "Budget rollups",
      "Chat-based itinerary refinement",
      "Public share links",
      "Multi-city trip support",
    ],
  };
}

export function faqPageSchema(
  faqs: Array<{ question: string; answer: string }>,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export function breadcrumbSchema(
  items: Array<{ name: string; path: string }>,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function destinationPageSchema(input: {
  name: string;
  description: string;
  image: string;
  path: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: input.name,
    description: input.description,
    image: input.image,
    url: absoluteUrl(input.path),
    touristType: "leisure travelers",
  };
}

export function howToSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to plan a trip with ${APP_NAME}`,
    description:
      "Create an AI day-by-day travel itinerary from a single sentence, then refine it with chat, maps, weather, and budget.",
    totalTime: "PT10M",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Describe your trip",
        text: "Enter a destination, vibe, dates, and budget in one sentence. Vague ideas are fine.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Get a day-by-day itinerary",
        text: "Receive named places, timing, estimated costs, map pins, and weather context.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Refine in conversation",
        text: "Chat to swap restaurants, slow a day, or dodge rain — then share a public link.",
      },
    ],
  };
}

export { APP_DOMAIN, APP_NAME, APP_TAGLINE };
