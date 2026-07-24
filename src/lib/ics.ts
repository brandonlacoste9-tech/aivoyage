import type { TripWithDetails } from "@/lib/types";

/** Build a simple .ics calendar string for the trip activities. */
export function buildTripIcs(trip: TripWithDetails): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VoyageAI//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const day of trip.days) {
    for (const a of day.activities) {
      const date = day.date.replace(/-/g, "");
      const start = (a.start_time || "10:00").replace(":", "");
      const duration = a.duration_min || 90;
      const end = addMinutes(start, duration);
      const uid = `${a.id}@voyageai`;
      const desc = (a.description || "").replace(/\n/g, "\\n");
      lines.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${date}T${start.padEnd(6, "0")}Z`,
        `DTSTART:${date}T${start.padEnd(6, "0")}`,
        `DTEND:${date}T${end.padEnd(6, "0")}`,
        `SUMMARY:${escapeIcs(a.title)}`,
        `DESCRIPTION:${escapeIcs(desc)}`,
        a.address || a.lat != null
          ? `LOCATION:${escapeIcs(a.address || `${a.lat},${a.lng}`)}`
          : "",
        "END:VEVENT",
      );
    }
  }

  lines.push("END:VCALENDAR");
  return lines.filter(Boolean).join("\r\n");
}

function escapeIcs(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function addMinutes(hhmm: string, mins: number) {
  const h = parseInt(hhmm.slice(0, 2) || "10", 10);
  const m = parseInt(hhmm.slice(2, 4) || "0", 10);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}${String(nm).padStart(2, "0")}`;
}
