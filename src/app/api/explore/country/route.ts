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
  const base = name;
  return [
    `7-day food and culture trip to ${base}`,
    `5-day relaxed ${base} getaway with local neighborhoods`,
    `10-day ${base} adventure covering nature and cities`,
    region
      ? `Multi-city ${region} trip starting in ${base}`
      : `Weekend in ${base} for first-timers`,
  ];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const mode = searchParams.get("mode") || "lookup"; // lookup | suggest

  if (!q || q.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Type at least 2 characters" },
      { status: 400 },
    );
  }

  try {
    if (mode === "suggest") {
      const res = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(q)}?fields=name,cca2,flags,region`,
        { next: { revalidate: 86400 } },
      );
      if (!res.ok) {
        return NextResponse.json({ ok: true, suggestions: [] });
      }
      const data = (await res.json()) as Array<{
        name: { common: string; official: string };
        cca2: string;
        flags?: { png?: string; svg?: string };
        region?: string;
      }>;
      const suggestions = (Array.isArray(data) ? data : [])
        .slice(0, 12)
        .map((c) => ({
          name: c.name.common,
          official: c.name.official,
          code: c.cca2,
          flag: c.flags?.png || c.flags?.svg || null,
          region: c.region || null,
        }));
      return NextResponse.json({ ok: true, suggestions });
    }

    // Full lookup
    const res = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(q)}?fullText=false&fields=name,capital,region,subregion,population,flags,languages,currencies,cca2,latlng,timezones,continents`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "Country not found. Try another spelling." },
        { status: 404 },
      );
    }
    const list = (await res.json()) as Array<Record<string, unknown>>;
    const c = (Array.isArray(list) ? list[0] : list) as {
      name: { common: string; official: string };
      capital?: string[];
      region?: string;
      subregion?: string;
      population?: number;
      flags?: { png?: string; svg?: string };
      languages?: Record<string, string>;
      currencies?: Record<string, { name?: string; symbol?: string }>;
      continents?: string[];
      latlng?: number[];
      timezones?: string[];
      cca2?: string;
    };

    const common = c.name.common;
    const wiki = await wikiSummary(common);

    const currencies = c.currencies
      ? Object.values(c.currencies).map(
          (x) =>
            `${x.name || ""}${x.symbol ? ` (${x.symbol})` : ""}`.trim(),
        )
      : [];

    const info: CountryInfo = {
      name: common,
      officialName: c.name.official,
      capital: c.capital?.[0] || null,
      region: c.region || null,
      subregion: c.subregion || null,
      population: c.population ?? null,
      flagPng: c.flags?.png || null,
      flagSvg: c.flags?.svg || null,
      languages: c.languages ? Object.values(c.languages) : [],
      currencies,
      continents: c.continents || [],
      latlng:
        c.latlng && c.latlng.length >= 2
          ? [c.latlng[0], c.latlng[1]]
          : null,
      timezones: c.timezones?.slice(0, 4) || [],
      cca2: c.cca2 || null,
      wikiExtract: wiki?.extract || null,
      wikiThumb: wiki?.thumb || null,
      wikiUrl: wiki?.url || null,
      tripIdeas: tripIdeas(common, c.region || null),
    };

    return NextResponse.json({ ok: true, country: info });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Lookup failed",
      },
      { status: 500 },
    );
  }
}
