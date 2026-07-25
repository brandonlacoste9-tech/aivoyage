/** Deep links to major OTAs — no API keys required. */

export type TripBookingContext = {
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  travelers?: number;
  cities?: { name: string }[];
  origin?: string; // optional home airport city
};

function ymd(d: string) {
  return d.slice(0, 10);
}

/** Google Flights explore-style search URL */
export function googleFlightsUrl(ctx: TripBookingContext) {
  const origin = encodeURIComponent(ctx.origin || "");
  // Free-form query works in the UI
  const q = encodeURIComponent(
    `Flights to ${ctx.cities?.[0]?.name || ctx.destination} ${ymd(ctx.startDate)} to ${ymd(ctx.endDate)}`,
  );
  return `https://www.google.com/travel/flights?q=${q}${origin ? `&tfs=${origin}` : ""}&curr=USD`;
}

export function kayakFlightsUrl(ctx: TripBookingContext) {
  const dest = (ctx.cities?.[0]?.name || ctx.destination.split(/→|,/)[0].trim())
    .replace(/\s+/g, "-")
    .toLowerCase();
  const from = (ctx.origin || "anywhere").replace(/\s+/g, "-").toLowerCase();
  // Kayak flexible city search
  return `https://www.kayak.com/flights/${from}-${dest}/${ymd(ctx.startDate)}/${ymd(ctx.endDate)}?sort=bestflight_a&adults=${ctx.travelers || 1}`;
}

export function skyscannerFlightsUrl(ctx: TripBookingContext) {
  const dest = encodeURIComponent(
    ctx.cities?.[0]?.name || ctx.destination.split(/→|,/)[0].trim(),
  );
  return `https://www.skyscanner.com/transport/flights/from/${dest}/${ymd(ctx.startDate).replace(/-/g, "")}/${ymd(ctx.endDate).replace(/-/g, "")}/?adults=${ctx.travelers || 1}`;
}

export function bookingHotelsUrl(ctx: TripBookingContext, city?: string) {
  const place = encodeURIComponent(
    city || ctx.cities?.[0]?.name || ctx.destination.split(/→|,/)[0].trim(),
  );
  const checkin = ymd(ctx.startDate);
  const checkout = ymd(ctx.endDate);
  // Booking.com search without affiliate ID (user can add aid later via env)
  const aid = process.env.NEXT_PUBLIC_BOOKING_AID;
  const base = `https://www.booking.com/searchresults.html?ss=${place}&checkin=${checkin}&checkout=${checkout}&group_adults=${ctx.travelers || 2}&no_rooms=1`;
  return aid ? `${base}&aid=${aid}` : base;
}

export function hotelsComUrl(ctx: TripBookingContext, city?: string) {
  const place = encodeURIComponent(
    city || ctx.cities?.[0]?.name || ctx.destination.split(/→|,/)[0].trim(),
  );
  return `https://www.hotels.com/Hotel-Search?destination=${place}&startDate=${ymd(ctx.startDate)}&endDate=${ymd(ctx.endDate)}&rooms=1&adults=${ctx.travelers || 2}`;
}

export function airbnbUrl(ctx: TripBookingContext, city?: string) {
  const place = encodeURIComponent(
    city || ctx.cities?.[0]?.name || ctx.destination.split(/→|,/)[0].trim(),
  );
  return `https://www.airbnb.com/s/${place}/homes?checkin=${ymd(ctx.startDate)}&checkout=${ymd(ctx.endDate)}&adults=${ctx.travelers || 2}`;
}

export type AffiliateLink = {
  id: string;
  label: string;
  description: string;
  href: string;
  kind: "flight" | "hotel" | "stay";
};

export function buildAffiliateLinks(ctx: TripBookingContext): AffiliateLink[] {
  const cities =
    ctx.cities && ctx.cities.length
      ? ctx.cities
      : ctx.destination
          .split(/→|->|,/)
          .map((s) => s.trim())
          .filter(Boolean)
          .map((name) => ({ name }));

  const links: AffiliateLink[] = [
    {
      id: "gflights",
      label: "Google Flights",
      description: "Compare airlines for your dates",
      href: googleFlightsUrl(ctx),
      kind: "flight",
    },
    {
      id: "kayak",
      label: "Kayak flights",
      description: "Flexible search & price alerts",
      href: kayakFlightsUrl(ctx),
      kind: "flight",
    },
    {
      id: "booking",
      label: "Booking.com hotels",
      description: `Stays in ${cities[0]?.name || ctx.destination}`,
      href: bookingHotelsUrl(ctx, cities[0]?.name),
      kind: "hotel",
    },
    {
      id: "hotels",
      label: "Hotels.com",
      description: "Hotels & packages",
      href: hotelsComUrl(ctx, cities[0]?.name),
      kind: "hotel",
    },
    {
      id: "airbnb",
      label: "Airbnb",
      description: "Apartments & homes",
      href: airbnbUrl(ctx, cities[0]?.name),
      kind: "stay",
    },
  ];

  // Extra hotel search per city for multi-city
  cities.slice(1).forEach((c, i) => {
    links.push({
      id: `booking-${i + 1}`,
      label: `Hotels in ${c.name}`,
      description: "Booking.com for this stop",
      href: bookingHotelsUrl(ctx, c.name),
      kind: "hotel",
    });
  });

  return links;
}
