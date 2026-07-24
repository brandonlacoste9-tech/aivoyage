import type { ElementType } from "react";
import {
  Camera,
  Coffee,
  Mountain,
  Moon,
  ShoppingBag,
  Bus,
  Bed,
  MapPin,
} from "lucide-react";
import type { Activity, ActivityType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const typeIcon: Record<ActivityType, ElementType> = {
  food: Coffee,
  culture: Camera,
  nature: Mountain,
  nightlife: Moon,
  shopping: ShoppingBag,
  transport: Bus,
  stay: Bed,
  other: MapPin,
};

const typeColor: Record<ActivityType, string> = {
  food: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  culture: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200",
  nature: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  nightlife: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
  shopping: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200",
  transport: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  stay: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200",
  other: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
};

export function ActivityCard({
  activity,
  active,
  onSelect,
}: {
  activity: Activity;
  active?: boolean;
  onSelect?: () => void;
}) {
  const Icon = typeIcon[activity.type] || MapPin;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900",
        active && "ring-2 ring-indigo-500",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            typeColor[activity.type],
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium leading-snug">{activity.title}</p>
            {activity.cost_cents != null && activity.cost_cents > 0 ? (
              <span className="shrink-0 text-xs font-medium text-slate-500">
                {formatCurrency(activity.cost_cents)}
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {activity.start_time ? (
              <span className="text-xs text-slate-500">{activity.start_time}</span>
            ) : null}
            <Badge variant="outline" className="text-[10px] capitalize">
              {activity.type}
            </Badge>
            {activity.duration_min ? (
              <span className="text-xs text-slate-400">
                {activity.duration_min}m
              </span>
            ) : null}
          </div>
          {activity.description ? (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">
              {activity.description}
            </p>
          ) : null}
        </div>
      </div>
    </button>
  );
}
