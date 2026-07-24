"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";
import type { TripWithDetails } from "@/lib/types";
import { buildTripIcs } from "@/lib/ics";
import { Button } from "@/components/ui/button";

export function ExportIcsButton({ trip }: { trip: TripWithDetails }) {
  function exportIcs() {
    if (!trip.days.length) {
      toast.error("No activities to export yet");
      return;
    }
    const ics = buildTripIcs(trip);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${trip.title.replace(/[^\w\-]+/g, "_") || "voyage"}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Calendar file downloaded");
  }

  return (
    <Button variant="outline" size="sm" onClick={exportIcs} type="button">
      <Download className="h-4 w-4" />
      Export
    </Button>
  );
}
