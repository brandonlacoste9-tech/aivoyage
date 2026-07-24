import { isWeatherConfigured } from "@/lib/config";
import type { WeatherDay } from "@/lib/types";

export async function fetchWeather(
  destination: string,
  days = 7,
): Promise<WeatherDay[] | null> {
  if (!isWeatherConfigured()) return null;

  const key = process.env.WEATHER_API_KEY!;
  const url = new URL("https://api.weatherapi.com/v1/forecast.json");
  url.searchParams.set("key", key);
  url.searchParams.set("q", destination);
  url.searchParams.set("days", String(Math.min(days, 10)));
  url.searchParams.set("aqi", "no");
  url.searchParams.set("alerts", "no");

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) return null;

  const data = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.forecast?.forecastday ?? []).map((d: any) => ({
    date: d.date,
    temp_max: d.day.maxtemp_c,
    temp_min: d.day.mintemp_c,
    condition: d.day.condition?.text ?? "—",
    icon: d.day.condition?.icon
      ? `https:${d.day.condition.icon}`
      : "",
    precip_chance: d.day.daily_chance_of_rain ?? 0,
  }));
}
