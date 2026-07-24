"use client";

import Link from "next/link";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton({ tripId }: { tripId: string }) {
  return (
    <Button asChild variant="outline" size="sm">
      <Link href={`/trips/${tripId}/print`} target="_blank">
        <Printer className="h-4 w-4" />
        Print / PDF
      </Link>
    </Button>
  );
}
