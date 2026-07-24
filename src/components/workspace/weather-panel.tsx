import { CloudSun } from "lucide-react";
import type { WeatherDay } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function WeatherPanel({
  weather,
  destination,
}: {
  weather: WeatherDay[] | null;
  destination: string;
}) {
  if (!weather) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-sm text-slate-500">
        <CloudSun className="h-8 w-8 text-cyan-500" />
        <p>
          Weather for {destination} requires{" "}
          <code className="text-xs">WEATHER_API_KEY</code> (WeatherAPI.com).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {weather.map((d) => (
        <div
          key={d.date}
          className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-800"
        >
          {d.icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={d.icon} alt="" className="h-10 w-10" />
          ) : (
            <CloudSun className="h-8 w-8 text-cyan-500" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{formatDate(d.date)}</p>
            <p className="truncate text-xs text-slate-500">{d.condition}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">{Math.round(d.temp_max)}°</p>
            <p className="text-xs text-slate-500">{Math.round(d.temp_min)}°</p>
          </div>
          <p className="w-10 text-right text-xs text-slate-400">
            {d.precip_chance}%
          </p>
        </div>
      ))}
    </div>
  );
}
