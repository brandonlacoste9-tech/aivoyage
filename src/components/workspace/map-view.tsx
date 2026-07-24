"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Activity } from "@/lib/types";

const DAY_COLORS = [
  "#4F46E5",
  "#06B6D4",
  "#F59E0B",
  "#10B981",
  "#EC4899",
  "#8B5CF6",
  "#EF4444",
];

export function MapView({
  activities,
  selectedId,
  onSelect,
  dark,
}: {
  activities: (Activity & { dayIndex: number })[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  dark?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const hasMap = Boolean(token);

  useEffect(() => {
    if (!hasMap || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token!;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: dark
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/streets-v12",
      center: [2.3522, 48.8566],
      zoom: 11,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [hasMap, token, dark]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !hasMap) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const withCoords = activities.filter(
      (a) => a.lat != null && a.lng != null,
    );
    if (!withCoords.length) return;

    const bounds = new mapboxgl.LngLatBounds();

    withCoords.forEach((a) => {
      const color = DAY_COLORS[a.dayIndex % DAY_COLORS.length];
      const el = document.createElement("button");
      el.type = "button";
      el.className = "voyage-marker";
      el.style.cssText = `
        width: 28px; height: 28px; border-radius: 9999px;
        background: ${color}; border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,.25); cursor: pointer;
        ${selectedId === a.id ? "transform: scale(1.25); outline: 2px solid #4F46E5;" : ""}
      `;
      el.addEventListener("click", () => onSelect?.(a.id));

      const meta = [a.start_time, a.type].filter(Boolean).join(" · ");
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([a.lng!, a.lat!])
        .setPopup(
          new mapboxgl.Popup({
            offset: 18,
            closeButton: true,
            maxWidth: "240px",
            className: "voyage-map-popup",
          }).setHTML(
            `<span class="voyage-popup-title">${escapeHtml(a.title)}</span>` +
              (meta
                ? `<span class="voyage-popup-meta">${escapeHtml(meta)}</span>`
                : ""),
          ),
        )
        .addTo(map);

      markersRef.current.push(marker);
      bounds.extend([a.lng!, a.lat!]);
    });

    if (withCoords.length === 1) {
      map.flyTo({
        center: [withCoords[0].lng!, withCoords[0].lat!],
        zoom: 13,
      });
    } else {
      map.fitBounds(bounds, { padding: 48, maxZoom: 14 });
    }
  }, [activities, selectedId, onSelect, hasMap]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const a = activities.find((x) => x.id === selectedId);
    if (a?.lat != null && a?.lng != null) {
      map.flyTo({ center: [a.lng, a.lat], zoom: 14 });
    }
  }, [selectedId, activities]);

  if (!hasMap) {
    return (
      <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-900/50">
        <p className="font-medium">Map placeholder</p>
        <p className="max-w-sm text-sm text-slate-500">
          Set <code className="text-xs">NEXT_PUBLIC_MAPBOX_TOKEN</code> to enable
          Mapbox GL markers and fly-to.
        </p>
        <ul className="mt-2 max-h-40 w-full max-w-md space-y-1 overflow-y-auto text-left text-xs text-slate-600 dark:text-slate-400">
          {activities
            .filter((a) => a.lat != null)
            .slice(0, 12)
            .map((a) => (
              <li key={a.id}>
                {a.title}: {a.lat?.toFixed(3)}, {a.lng?.toFixed(3)}
              </li>
            ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full min-h-[280px] w-full rounded-2xl"
      role="application"
      aria-label="Trip map"
    />
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

