"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ticket } from "lucide-react";
import { redeemPromoCodeAction } from "@/app/actions/promo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PromoCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await redeemPromoCodeAction(code);
          if (!res.ok) {
            toast.error(res.error);
            return;
          }
          try {
            const { default: posthog } = await import("posthog-js");
            posthog.capture("promo_redeemed");
          } catch {
            /* ignore */
          }
          toast.success(res.message);
          setCode("");
          router.refresh();
        });
      }}
    >
      <Label htmlFor="promo" className="flex items-center gap-2">
        <Ticket className="h-4 w-4 text-[var(--coral)]" />
        Have a promo code?
      </Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="promo"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          className="font-mono uppercase tracking-wide"
          autoComplete="off"
          required
        />
        <Button type="submit" disabled={pending || !code.trim()}>
          {pending ? "Applying…" : "Apply code"}
        </Button>
      </div>
      <p className="text-xs text-[var(--muted)]">
        Codes unlock Pro time or bonus AI generations. One use per account.
      </p>
    </form>
  );
}
