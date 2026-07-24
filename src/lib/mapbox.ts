import { isMapboxConfigured } from "@/lib/config";

export async function geocodePlace(
  query: string,
  near?: string,
): Promise<{ lat: number; lng: number; place_name: string } | null> {
  const token =
    process.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token || !isMapboxConfigured()) return null;

  const search = near ? `${query}, ${near}` : query;
  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(search)}.json`,
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
  if (!res.ok) return null;
  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) return null;
  const [lng, lat] = feature.center;
  return { lat, lng, place_name: feature.place_name };
}

/** Rough city-center fallbacks for demo map markers when geocoding is off. */
export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  kyoto: { lat: 35.0116, lng: 135.7681 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  paris: { lat: 48.8566, lng: 2.3522 },
  rome: { lat: 41.9028, lng: 12.4964 },
  bali: { lat: -8.4095, lng: 115.1889 },
  lisbon: { lat: 38.7223, lng: -9.1393 },
  barcelona: { lat: 41.3874, lng: 2.1686 },
  "new york": { lat: 40.7128, lng: -74.006 },
  london: { lat: 51.5074, lng: -0.1278 },
  seoul: { lat: 37.5665, lng: 126.978 },
};

export function fallbackCoords(destination: string, index: number) {
  const key = destination.toLowerCase();
  const base =
    Object.entries(CITY_COORDS).find(([k]) => key.includes(k))?.[1] ?? {
      lat: 48.8566,
      lng: 2.3522,
    };
  // slight offset per activity so markers don't stack
  const angle = (index * 47) % 360;
  const rad = (angle * Math.PI) / 180;
  const d = 0.008 + (index % 3) * 0.004;
  return {
    lat: base.lat + Math.sin(rad) * d,
    lng: base.lng + Math.cos(rad) * d,
  };
}
