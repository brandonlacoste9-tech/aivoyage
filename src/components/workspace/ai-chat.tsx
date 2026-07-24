"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PaywallModal } from "@/components/paywall-modal";

type Msg = { role: "user" | "assistant"; content: string };

export function AIChat({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi — I'm your Trip Planner co-pilot. Ask me to change the plan and I'll **apply** edits when I can (e.g. “add a ramen stop on day 2” or “make day 1 less packed”).",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [paywall, setPaywall] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/trips/chat-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, message: text }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        reply?: string;
        applied?: number;
        error?: string;
        paywall?: boolean;
      };

      if (res.status === 402 || data.paywall) {
        setPaywall(true);
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: data.error || "Free AI limit reached — upgrade to keep planning.",
          },
        ]);
        return;
      }

      if (!res.ok || !data.ok) {
        toast.error(data.error || "Chat failed");
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `Sorry: ${data.error || "something went wrong"}` },
        ]);
        return;
      }

      const suffix =
        data.applied && data.applied > 0
          ? `\n\n✅ Applied **${data.applied}** change(s) to your itinerary.`
          : "\n\n_(No automatic edits — I only advised.)_";
      setMessages((m) => [
        ...m,
        { role: "assistant", content: (data.reply || "Done.") + suffix },
      ]);
      if (data.applied && data.applied > 0) {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full min-h-[320px] flex-col">
      <PaywallModal open={paywall} onClose={() => setPaywall(false)} />
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "rounded-2xl px-3 py-2 text-sm leading-relaxed",
              m.role === "assistant"
                ? "bg-gradient-to-br from-[var(--lagoon)]/10 to-[var(--coral)]/10 text-[var(--foreground)]"
                : "ml-6 bg-[var(--sand-deep)] text-[var(--foreground)]",
            )}
          >
            {m.role === "assistant" ? (
              <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--lagoon)]">
                <Sparkles className="h-3 w-3" /> AI
              </span>
            ) : null}
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {loading ? (
          <p className="flex items-center gap-1 text-xs text-[var(--muted)] animate-pulse">
            <Wand2 className="h-3 w-3" /> Thinking & applying…
          </p>
        ) : null}
      </div>
      <div className="mt-3 flex gap-2">
        <Textarea
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Make day 2 more food-focused…"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <Button
          type="button"
          size="icon"
          className="shrink-0 self-end"
          disabled={loading}
          onClick={() => void send()}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
