"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Globe2,
  Loader2,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CountryInfo } from "@/app/api/explore/country/route";

type Suggestion = {
  name: string;
  official: string;
  code: string;
  flag: string | null;
  region: string | null;
};

function formatPop(n: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en", { notation: "compact" }).format(n);
}

export function CountryExplorer() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [loadingCountry, setLoadingCountry] = useState(false);
  const [country, setCountry] = useState<CountryInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggest(true);
    try {
      const res = await fetch(
        `/api/explore/country?mode=suggest&q=${encodeURIComponent(q.trim())}`,
      );
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setOpen(true);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggest(false);
    }
  }, []);

  const loadCountry = useCallback(async (name: string) => {
    setLoadingCountry(true);
    setError(null);
    setOpen(false);
    setQuery(name);
    try {
      const res = await fetch(
        `/api/explore/country?q=${encodeURIComponent(name)}`,
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setCountry(null);
        setError(data.error || "Could not load country");
        return;
      }
      setCountry(data.country as CountryInfo);
    } catch {
      setError("Lookup failed. Try again.");
      setCountry(null);
    } finally {
      setLoadingCountry(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchSuggestions(query);
    }, 280);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <section className="space-y-6">
      <div
        ref={wrapRef}
        className="relative rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm sm:p-6"
      >
        <div className="flex items-start gap-3">
          <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--lagoon)]/10 text-[var(--lagoon)]">
            <Globe2 className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-xl font-semibold">
              Search any country
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Type a country name for capital, region, languages, a short
              overview, and ready-made trip ideas.
            </p>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => suggestions.length && setOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim().length >= 2) {
                    e.preventDefault();
                    void loadCountry(query.trim());
                  }
                }}
                placeholder="e.g. Japan, Portugal, Morocco…"
                className="h-12 rounded-2xl pl-10 pr-24 text-base"
                aria-label="Search countries"
                autoComplete="off"
              />
              <Button
                type="button"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                disabled={query.trim().length < 2 || loadingCountry}
                onClick={() => void loadCountry(query.trim())}
              >
                {loadingCountry ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Search"
                )}
              </Button>

              {open && (suggestions.length > 0 || loadingSuggest) ? (
                <ul className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] py-1 shadow-xl">
                  {loadingSuggest && suggestions.length === 0 ? (
                    <li className="px-4 py-3 text-sm text-[var(--muted)]">
                      Searching…
                    </li>
                  ) : null}
                  {suggestions.map((s) => (
                    <li key={s.code + s.name}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-[var(--sand-deep)]"
                        onClick={() => void loadCountry(s.name)}
                      >
                        {s.flag ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={s.flag}
                            alt=""
                            className="h-5 w-7 rounded object-cover shadow-sm"
                          />
                        ) : (
                          <span className="h-5 w-7 rounded bg-[var(--sand-deep)]" />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="font-medium">{s.name}</span>
                          {s.region ? (
                            <span className="ml-2 text-xs text-[var(--muted)]">
                              {s.region}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Try: Japan, Italy, Thailand, Canada, Spain, Peru…
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          {error}
        </div>
      ) : null}

      {loadingCountry ? (
        <div className="flex items-center justify-center gap-2 rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] py-16 text-sm text-[var(--muted)]">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading country info…
        </div>
      ) : null}

      {country && !loadingCountry ? (
        <div className="overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] shadow-sm">
          <div className="grid gap-0 lg:grid-cols-5">
            <div className="relative min-h-[220px] lg:col-span-2">
              {country.wikiThumb || country.flagPng ? (
                <Image
                  src={country.wikiThumb || country.flagPng!}
                  alt={country.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  unoptimized
                />
              ) : (
                <div className="flex h-full min-h-[220px] items-center justify-center bg-[var(--sand-deep)]">
                  <Globe2 className="h-12 w-12 text-[var(--muted)]" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:bg-gradient-to-r" />
              <div className="absolute bottom-4 left-4 flex items-center gap-3 text-white">
                {country.flagPng ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={country.flagPng}
                    alt=""
                    className="h-8 w-12 rounded shadow-md ring-1 ring-white/30"
                  />
                ) : null}
                <div>
                  <h3 className="font-display text-2xl font-semibold">
                    {country.name}
                  </h3>
                  <p className="text-xs text-white/80">{country.officialName}</p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6 lg:col-span-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Fact
                  icon={<MapPin className="h-3.5 w-3.5" />}
                  label="Capital"
                  value={country.capital || "—"}
                />
                <Fact
                  icon={<Globe2 className="h-3.5 w-3.5" />}
                  label="Region"
                  value={
                    [country.subregion, country.region]
                      .filter(Boolean)
                      .join(", ") || "—"
                  }
                />
                <Fact
                  icon={<Users className="h-3.5 w-3.5" />}
                  label="Population"
                  value={formatPop(country.population)}
                />
                <Fact
                  label="Languages"
                  value={country.languages.slice(0, 4).join(", ") || "—"}
                />
                <Fact
                  label="Currency"
                  value={country.currencies.slice(0, 2).join(", ") || "—"}
                />
                <Fact
                  label="Timezone"
                  value={country.timezones[0] || "—"}
                />
              </div>

              {country.wikiExtract ? (
                <p className="text-sm leading-relaxed text-[var(--muted)]">
                  {country.wikiExtract}
                  {country.wikiUrl ? (
                    <>
                      {" "}
                      <a
                        href={country.wikiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[var(--lagoon)] hover:underline"
                      >
                        Wikipedia
                      </a>
                    </>
                  ) : null}
                </p>
              ) : null}

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--coral)]">
                  Trip ideas
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  {country.tripIdeas.map((idea) => (
                    <Link
                      key={idea}
                      href={`/trips/new?destination=${encodeURIComponent(country.name)}&prompt=${encodeURIComponent(idea)}`}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 px-4 py-3 text-sm transition hover:border-[var(--lagoon)]"
                    >
                      <span>{idea}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-[var(--muted)] transition group-hover:text-[var(--lagoon)]" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild variant="accent">
                  <Link
                    href={`/trips/new?destination=${encodeURIComponent(country.name)}&prompt=${encodeURIComponent(`Plan a balanced trip to ${country.name}${country.capital ? ` starting in ${country.capital}` : ""}`)}`}
                  >
                    Plan a trip to {country.name}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                {country.latlng ? (
                  <Button asChild variant="outline">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${country.latlng[0]},${country.latlng[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open in Maps
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Fact({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)]/40 px-3 py-2.5">
      <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}
