"use client";

import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { chatAboutTripText } from "@/app/actions/chat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

export function AIChat({ tripId }: { tripId: string }) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi — I'm your VoyageAI co-pilot. Ask me to slow a day, swap restaurants, or suggest nightlife.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await chatAboutTripText(tripId, text);
      if (!res.ok) {
        toast.error(res.error);
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `Sorry: ${res.error}` },
        ]);
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: res.text }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full min-h-[320px] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "rounded-2xl px-3 py-2 text-sm leading-relaxed",
              m.role === "assistant"
                ? "bg-gradient-to-br from-indigo-50 to-cyan-50 text-slate-800 dark:from-indigo-950/50 dark:to-cyan-950/40 dark:text-slate-100"
                : "ml-6 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
            )}
          >
            {m.role === "assistant" ? (
              <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                <Sparkles className="h-3 w-3" /> AI
              </span>
            ) : null}
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {loading ? (
          <p className="text-xs text-slate-500 animate-pulse">Thinking…</p>
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
