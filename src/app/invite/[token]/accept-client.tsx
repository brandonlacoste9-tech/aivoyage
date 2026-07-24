"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { acceptInviteAction } from "@/app/actions/collaborators";
import { Button } from "@/components/ui/button";

export function AcceptInviteClient({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          const res = await acceptInviteAction(token);
          if (!res.ok) {
            toast.error(res.error);
            return;
          }
          toast.success("Invite accepted");
          router.push(`/trips/${res.tripId}`);
          router.refresh();
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "Accepting…" : "Accept invite"}
    </Button>
  );
}
