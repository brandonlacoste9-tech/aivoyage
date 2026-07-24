"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createSampleTripAction } from "@/app/actions/sample-trip";
import { Button } from "@/components/ui/button";

export function SampleTripButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const res = await createSampleTripAction();
          if (!res.ok) {
            toast.error(res.error);
            return;
          }
          toast.success("Sample Kyoto trip ready");
          router.push(`/trips/${res.id}`);
          router.refresh();
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "Creating…" : "Try a sample trip"}
    </Button>
  );
}