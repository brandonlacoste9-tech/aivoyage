"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Activity } from "@/lib/types";

const DAY_COLORS = [
  "#0f5c63",
  "#2a9d8f",
  "#e07a5f",
  "#c4a35a",
  "#ec4899",
  "#8b5cf6",
  "#ef4444",
];

export function MapView({
  activities,
  selectedId,
  onSelect,
  dark,
  destination,
}: {
  activities: (Activity & { dayIndex: number })[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  dark?: boolean;
  destination?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const photoCache = useRef<Map<string, string>>(new Map());

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const hasMap = Boolean(token);

  useEffect(() => {
    if (!hasMap || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token!;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: dark
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/outdoors-v12",
      center: [2.3522, 48.8566],
      zoom: 11,
    });
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right",
    );
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
    if (!map || !hasMap || !token) return;

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
      el.setAttribute("aria-label", a.title);
      el.style.cssText = `
        width: 28px; height: 28px; border-radius: 9999px;
        background: ${color}; border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,.25); cursor: pointer;
        ${selectedId === a.id ? "transform: scale(1.25); outline: 2px solid #0f5c63;" : ""}
      `;
      el.addEventListener("click", () => onSelect?.(a.id));

      const meta = [a.start_time, a.type].filter(Boolean).join(" · ");
      const staticMap = mapboxStaticUrl(a.lng!, a.lat!, token);
      const cachedPhoto = photoCache.current.get(a.id);
      const imgSrc = cachedPhoto || staticMap;

      const popup = new mapboxgl.Popup({
        offset: 18,
        closeButton: true,
        maxWidth: "280px",
        className: "voyage-map-popup",
      }).setHTML(
        buildPopupHtml({
          title: a.title,
          meta,
          imgSrc,
          imgAlt: a.title,
          loading: !cachedPhoto,
        }),
      );

      popup.on("open", () => {
        void hydratePopupPhoto({
          popup,
          activityId: a.id,
          title: a.title,
          destination,
          address: a.address,
          lng: a.lng!,
          lat: a.lat!,
          token,
          meta,
          cache: photoCache.current,
        });
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([a.lng!, a.lat!])
        .setPopup(popup)
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
  }, [activities, selectedId, onSelect, hasMap, token, destination]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const a = activities.find((x) => x.id === selectedId);
    if (a?.lat != null && a?.lng != null) {
      map.flyTo({ center: [a.lng, a.lat], zoom: 14 });
      // Open popup for selected activity
      const idx = activities
        .filter((x) => x.lat != null && x.lng != null)
        .findIndex((x) => x.id === selectedId);
      if (idx >= 0 && markersRef.current[idx]) {
        markersRef.current[idx].togglePopup();
      }
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

function mapboxStaticUrl(lng: number, lat: number, token: string) {
  const lon = Number(lng.toFixed(5));
  const la = Number(lat.toFixed(5));
  return `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/pin-s+e07a5f(${lon},${la})/${lon},${la},14,0/320x160@2x?access_token=${token}`;
}

function buildPopupHtml({
  title,
  meta,
  imgSrc,
  imgAlt,
  loading,
}: {
  title: string;
  meta: string;
  imgSrc: string;
  imgAlt: string;
  loading?: boolean;
}) {
  return `
    <div class="voyage-popup">
      <div class="voyage-popup-media${loading ? " is-loading" : ""}">
        <img
          class="voyage-popup-img"
          src="${escapeAttr(imgSrc)}"
          alt="${escapeAttr(imgAlt)}"
          width="320"
          height="160"
          loading="lazy"
          referrerpolicy="no-referrer"
        />
      </div>
      <div class="voyage-popup-body">
        <span class="voyage-popup-title">${escapeHtml(title)}</span>
        ${meta ? `<span class="voyage-popup-meta">${escapeHtml(meta)}</span>` : ""}
      </div>
    </div>
  `;
}

async function hydratePopupPhoto({
  popup,
  activityId,
  title,
  destination,
  address,
  lng,
  lat,
  token,
  meta,
  cache,
}: {
  popup: mapboxgl.Popup;
  activityId: string;
  title: string;
  destination?: string;
  address?: string | null;
  lng: number;
  lat: number;
  token: string;
  meta: string;
  cache: Map<string, string>;
}) {
  if (cache.has(activityId)) {
    const el = popup.getElement();
    const img = el?.querySelector(".voyage-popup-img") as HTMLImageElement | null;
    const wrap = el?.querySelector(".voyage-popup-media");
    if (img) img.src = cache.get(activityId)!;
    wrap?.classList.remove("is-loading");
    return;
  }

  const queries = [
    title,
    address || "",
    destination ? `${title} ${destination}` : "",
    destination || "",
  ].filter(Boolean);

  let photoUrl: string | null = null;
  for (const q of queries) {
    photoUrl = await fetchWikipediaThumb(q);
    if (photoUrl) break;
  }

  const finalUrl = photoUrl || mapboxStaticUrl(lng, lat, token);
  cache.set(activityId, finalUrl);

  if (!popup.isOpen()) return;

  const el = popup.getElement();
  const img = el?.querySelector(".voyage-popup-img") as HTMLImageElement | null;
  const wrap = el?.querySelector(".voyage-popup-media");
  if (img) {
    img.src = finalUrl;
    img.onload = () => wrap?.classList.remove("is-loading");
    img.onerror = () => {
      img.src = mapboxStaticUrl(lng, lat, token);
      wrap?.classList.remove("is-loading");
    };
  } else {
    popup.setHTML(
      buildPopupHtml({
        title,
        meta,
        imgSrc: finalUrl,
        imgAlt: title,
        loading: false,
      }),
    );
  }
}

async function fetchWikipediaThumb(query: string): Promise<string | null> {
  try {
    // Search first for best page match
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
    const src =
      sum?.thumbnail?.source ||
      sum?.originalimage?.source ||
      null;
    return typeof src === "string" ? src : null;
  } catch {
    return null;
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}
