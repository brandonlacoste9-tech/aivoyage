"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Peer = {
  key: string;
  name: string;
  color: string;
  online_at: string;
};

const COLORS = [
  "#0f5c63",
  "#e07a5f",
  "#2a9d8f",
  "#8b5cf6",
  "#c4a35a",
  "#ec4899",
];

function colorFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * 17) % COLORS.length;
  return COLORS[h];
}

export function PresenceBar({
  tripId,
  userId,
  displayName,
}: {
  tripId: string;
  userId: string;
  displayName: string;
}) {
  const [peers, setPeers] = useState<Peer[]>([]);
  const label = useMemo(
    () => displayName || "Traveler",
    [displayName],
  );

  useEffect(() => {
    if (!tripId || !userId) return;
    const supabase = createClient();
    const channel = supabase.channel(`trip-presence:${tripId}`, {
      config: { presence: { key: userId } },
    });

    const sync = () => {
      const state = channel.presenceState() as Record<
        string,
        { name?: string; online_at?: string }[]
      >;
      const next: Peer[] = [];
      for (const [key, metas] of Object.entries(state)) {
        const meta = metas[0] || {};
        next.push({
          key,
          name: meta.name || "Traveler",
          color: colorFor(key),
          online_at: meta.online_at || "",
        });
      }
      setPeers(next.sort((a, b) => a.name.localeCompare(b.name)));
    };

    channel
      .on("presence", { event: "sync" }, sync)
      .on("presence", { event: "join" }, sync)
      .on("presence", { event: "leave" }, sync)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            name: label,
            online_at: new Date().toISOString(),
          });
        }
      });

    const ping = setInterval(() => {
      void channel.track({
        name: label,
        online_at: new Date().toISOString(),
      });
    }, 30000);

    return () => {
      clearInterval(ping);
      void supabase.removeChannel(channel);
    };
  }, [tripId, userId, label]);

  if (peers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-3 py-2">
      <div className="flex -space-x-2">
        {peers.slice(0, 6).map((p) => (
          <span
            key={p.key}
            title={p.name}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--card)] text-[11px] font-bold text-white"
            style={{ background: p.color }}
          >
            {p.name.slice(0, 1).toUpperCase()}
          </span>
        ))}
      </div>
      <p className="text-xs text-[var(--muted)]">
        <span className="font-semibold text-[var(--foreground)]">
          {peers.length}
        </span>{" "}
        online
        {peers.length === 1 ? " (just you)" : ""}
        {peers.length > 1
          ? ` · ${peers
              .filter((p) => p.key !== userId)
              .map((p) => p.name)
              .slice(0, 3)
              .join(", ")}`
          : ""}
      </p>
      <span className="ml-auto flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-emerald-600">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        Live
      </span>
    </div>
  );
}
