"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export function PrintClient({ title }: { title: string }) {
  useEffect(() => {
    document.title = `${title} · Print`;
  }, [title]);

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur print:hidden">
      <p className="text-sm text-slate-600">
        Use your browser’s print dialog → <strong>Save as PDF</strong>
      </p>
      <Button type="button" onClick={() => window.print()}>
        Print / Save PDF
      </Button>
    </div>
  );
}
