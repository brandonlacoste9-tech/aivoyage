"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import type { TripWithDetails, WeatherDay } from "@/lib/types";
import { buildPackingList, type PackingItem } from "@/lib/packing";
import { savePackingListAction } from "@/app/actions/packing";
import { Button } from "@/components/ui/button";

export function PackingPanel({
  trip,
  weather,
  canEdit,
}: {
  trip: TripWithDetails;
  weather: WeatherDay[] | null;
  canEdit: boolean;
}) {
  const generated = useMemo(
    () => buildPackingList(trip, weather),
    [trip, weather],
  );
  const stored = (trip as TripWithDetails & { packing_list?: PackingItem[] })
    .packing_list;
  const [items, setItems] = useState<PackingItem[]>(
    Array.isArray(stored) && stored.length ? stored : generated,
  );
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)),
    );
  }

  function regenerate() {
    setItems(buildPackingList(trip, weather));
    toast.message("Packing list refreshed from trip + weather");
  }

  function save() {
    if (!canEdit) return;
    startTransition(async () => {
      const res = await savePackingListAction(trip.id, items);
      if (!res.ok) toast.error(res.error);
      else toast.success("Packing list saved");
    });
  }

  const byCat = items.reduce<Record<string, PackingItem[]>>((acc, i) => {
    (acc[i.category] ||= []).push(i);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={regenerate}>
          Rebuild from trip
        </Button>
        {canEdit ? (
          <Button type="button" size="sm" onClick={save} disabled={pending}>
            Save list
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-[var(--muted)]">
        Built from your activities and forecast (rain, heat, cold).
      </p>
      {Object.entries(byCat).map(([cat, list]) => (
        <div key={cat}>
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[var(--lagoon)]">
            {cat}
          </p>
          <ul className="space-y-1">
            {list.map((item) => (
              <li key={item.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--sand-deep)]">
                  <input
                    type="checkbox"
                    checked={!!item.checked}
                    onChange={() => toggle(item.id)}
                    className="rounded border-[var(--border)]"
                  />
                  <span className={item.checked ? "line-through opacity-60" : ""}>
                    {item.label}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
