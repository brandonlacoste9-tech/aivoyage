/** Client-side place photo helpers (Wikipedia + Mapbox static fallback). */

const cache = new Map<string, string>();

export function mapboxStaticUrl(
  lng: number,
  lat: number,
  token: string,
  w = 320,
  h = 160,
) {
  const lon = Number(lng.toFixed(5));
  const la = Number(lat.toFixed(5));
  return `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/pin-s+e07a5f(${lon},${la})/${lon},${la},14,0/${w}x${h}@2x?access_token=${token}`;
}

export async function fetchWikipediaThumb(
  query: string,
): Promise<string | null> {
  try {
    const searchUrl = new URL("https://en.wikipedia.org/w/api.php");
    searchUrl.searchParams.set("action", "query");
    searchUrl.searchParams.set("list", "search");
    searchUrl.searchParams.set("srsearch", query);
    searchUrl.searchParams.set("srlimit", "1");
    searchUrl.searchParams.set("format", "json");
    searchUrl.searchParams.set("origin", "*");

    const searchRes = await fetch(searchUrl.toString());
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const title = searchData?.query?.search?.[0]?.title as string | undefined;
    if (!title) return null;

    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const sumRes = await fetch(summaryUrl, {
      headers: { Accept: "application/json" },
    });
    if (!sumRes.ok) return null;
    const sum = await sumRes.json();
    const src = sum?.thumbnail?.source || sum?.originalimage?.source || null;
    return typeof src === "string" ? src : null;
  } catch {
    return null;
  }
}

export async function resolvePlacePhoto(opts: {
  key: string;
  title: string;
  destination?: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  mapboxToken?: string | null;
}): Promise<string | null> {
  if (cache.has(opts.key)) return cache.get(opts.key)!;

  const queries = [
    opts.title,
    opts.address || "",
    opts.destination ? `${opts.title} ${opts.destination}` : "",
    opts.destination || "",
  ].filter(Boolean);

  for (const q of queries) {
    const wiki = await fetchWikipediaThumb(q);
    if (wiki) {
      cache.set(opts.key, wiki);
      return wiki;
    }
  }

  if (
    opts.mapboxToken &&
    opts.lat != null &&
    opts.lng != null &&
    Number.isFinite(opts.lat) &&
    Number.isFinite(opts.lng)
  ) {
    const staticUrl = mapboxStaticUrl(opts.lng, opts.lat, opts.mapboxToken, 200, 200);
    cache.set(opts.key, staticUrl);
    return staticUrl;
  }

  return null;
}
