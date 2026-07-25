import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export type CountryInfo = {
  name: string;
  officialName: string;
  capital: string | null;
  region: string | null;
  subregion: string | null;
  population: number | null;
  flagPng: string | null;
  flagSvg: string | null;
  languages: string[];
  currencies: string[];
  continents: string[];
  latlng: [number, number] | null;
  timezones: string[];
  cca2: string | null;
  wikiExtract: string | null;
  wikiThumb: string | null;
  wikiUrl: string | null;
  tripIdeas: string[];
};

/** Shape from apicountries.com (v1-style country objects) */
type ApiCountry = {
  name?: string;
  nativeName?: string;
  capital?: string | string[];
  region?: string;
  subregion?: string;
  population?: number;
  flag?: string;
  flags?: { png?: string; svg?: string };
  languages?: Array<{ name?: string } | string> | Record<string, string>;
  currencies?: Array<{ name?: string; code?: string; symbol?: string }> | Record<
    string,
    { name?: string; symbol?: string }
  >;
  latlng?: number[];
  timezones?: string[];
  alpha2Code?: string;
  cca2?: string;
  cioc?: string;
  demonym?: string;
  area?: number;
};

async function wikiSummary(name: string) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      extract: (data.extract as string) || null,
      thumb: (data.thumbnail?.source as string) || null,
      url: (data.content_urls?.desktop?.page as string) || null,
    };
  } catch {
    return null;
  }
}

function tripIdeas(name: string, region: string | null): string[] {
  return [
    `7-day food and culture trip to ${name}`,
    `5-day relaxed ${name} getaway with local neighborhoods`,
    `10-day ${name} adventure covering nature and cities`,
    region
      ? `Multi-city ${region} trip starting in ${name}`
      : `Weekend in ${name} for first-timers`,
  ];
}

function asList(data: unknown): ApiCountry[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.filter(
      (c): c is ApiCountry =>
        !!c && typeof c === "object" && typeof (c as ApiCountry).name === "string",
    );
  }
  if (typeof data === "object" && data !== null && "name" in data) {
    const c = data as ApiCountry;
    if (typeof c.name === "string") return [c];
  }
  return [];
}

function capitalOf(c: ApiCountry): string | null {
  if (Array.isArray(c.capital)) return c.capital[0] || null;
  if (typeof c.capital === "string") return c.capital;
  return null;
}

function languagesOf(c: ApiCountry): string[] {
  if (!c.languages) return [];
  if (Array.isArray(c.languages)) {
    return c.languages
      .map((l) => (typeof l === "string" ? l : l?.name || ""))
      .filter(Boolean) as string[];
  }
  if (typeof c.languages === "object") {
    return Object.values(c.languages).filter(Boolean) as string[];
  }
  return [];
}

function currenciesOf(c: ApiCountry): string[] {
  if (!c.currencies) return [];
  if (Array.isArray(c.currencies)) {
    return c.currencies
      .map((x) => {
        if (!x) return "";
        const name = x.name || x.code || "";
        return x.symbol ? `${name} (${x.symbol})` : name;
      })
      .filter(Boolean);
  }
  if (typeof c.currencies === "object") {
    return Object.values(c.currencies)
      .map((x) => {
        if (!x) return "";
        return `${x.name || ""}${x.symbol ? ` (${x.symbol})` : ""}`.trim();
      })
      .filter(Boolean);
  }
  return [];
}

async function fetchCountries(q: string): Promise<ApiCountry[]> {
  const encoded = encodeURIComponent(q.trim());
  const url = `https://www.apicountries.com/countries/name/${encoded}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return asList(data);
  } catch (e) {
    console.error("[explore/country] fetch failed", e);
    return [];
  }
}

function pickBest(list: ApiCountry[], q: string): ApiCountry | null {
  if (!list.length) return null;
  const lower = q.toLowerCase();
  return (
    list.find((c) => c.name?.toLowerCase() === lower) ||
    list.find((c) => c.name?.toLowerCase().startsWith(lower)) ||
    list[0] ||
    null
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const mode = searchParams.get("mode") || "lookup";

  if (!q || q.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Type at least 2 characters" },
      { status: 400 },
    );
  }

  try {
    const list = await fetchCountries(q);

    if (mode === "suggest") {
      const suggestions = list.slice(0, 12).map((c) => ({
        name: c.name!,
        official: c.nativeName || c.name!,
        code: c.alpha2Code || c.cca2 || c.cioc || c.name!,
        flag: c.flags?.png || c.flags?.svg || null,
        region: c.region || null,
      }));
      return NextResponse.json({ ok: true, suggestions });
    }

    const c = pickBest(list, q);
    if (!c?.name) {
      return NextResponse.json(
        {
          ok: false,
          error: "Country not found. Try another spelling (e.g. Japan, Portugal).",
        },
        { status: 404 },
      );
    }

    const common = c.name;
    const wiki = await wikiSummary(common);
    const latlng =
      Array.isArray(c.latlng) && c.latlng.length >= 2
        ? ([Number(c.latlng[0]), Number(c.latlng[1])] as [number, number])
        : null;

    const info: CountryInfo = {
      name: common,
      officialName: c.nativeName || common,
      capital: capitalOf(c),
      region: c.region || null,
      subregion: c.subregion || null,
      population: typeof c.population === "number" ? c.population : null,
      flagPng: c.flags?.png || null,
      flagSvg: c.flags?.svg || null,
      languages: languagesOf(c),
      currencies: currenciesOf(c),
      continents: c.region ? [c.region] : [],
      latlng,
      timezones: Array.isArray(c.timezones) ? c.timezones.slice(0, 4) : [],
      cca2: c.alpha2Code || c.cca2 || null,
      wikiExtract: wiki?.extract || null,
      wikiThumb: wiki?.thumb || null,
      wikiUrl: wiki?.url || null,
      tripIdeas: tripIdeas(common, c.region || null),
    };

    return NextResponse.json({ ok: true, country: info });
  } catch (e) {
    console.error("[explore/country]", e);
    return NextResponse.json(
      {
        ok: false,
        error:
          e instanceof Error
            ? e.message
            : "Lookup failed. Try another country name.",
      },
      { status: 500 },
    );
  }
}
