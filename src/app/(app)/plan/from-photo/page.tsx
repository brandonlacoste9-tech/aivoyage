"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ImageIcon, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Analysis = {
  destination_guess: string;
  vibe: string;
  interests: string[];
  pace: string;
  suggested_days: number;
  prompt: string;
};

export default function PlanFromPhotoPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  function onFile(f: File | null) {
    setFile(f);
    setAnalysis(null);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  async function analyze() {
    setLoading(true);
    try {
      const fd = new FormData();
      if (file) fd.set("image", file);
      if (imageUrl.trim()) fd.set("imageUrl", imageUrl.trim());
      const res = await fetch("/api/trips/from-photo", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        analysis?: Analysis;
      };
      if (!res.ok || !data.ok || !data.analysis) {
        toast.error(
          data.error ||
            "Could not analyze photo. Sign in and try a clear travel image.",
        );
        return;
      }
      setAnalysis(data.analysis);
      toast.success("Vibe extracted — continue to plan");
    } finally {
      setLoading(false);
    }
  }

  function continueToWizard() {
    if (!analysis) return;
    const params = new URLSearchParams({
      destination: analysis.destination_guess || "",
      prompt: analysis.prompt || "",
      vibe: analysis.vibe || "",
    });
    router.push(`/trips/new?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral)]">
          Plan from photo
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          Instagram vibe → itinerary
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Upload a travel photo or paste an image URL (save/export from Instagram
          works). We analyze the vibe with AI — no Instagram login required.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ImageIcon className="h-5 w-5 text-[var(--lagoon)]" />
            Your photo
          </CardTitle>
          <CardDescription>
            Food, landscapes, city streets, hotel rooms — anything with a travel
            mood.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Upload image</Label>
            <Input
              id="file"
              type="file"
              accept="image/*"
              onChange={(e) => onFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="relative text-center text-xs text-[var(--muted)]">
            or paste a public image URL
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">Image URL</Label>
            <Input
              id="url"
              placeholder="https://…"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setPreview(e.target.value || preview);
              }}
            />
          </div>

          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--sand-deep)]/40 text-[var(--muted)]">
              <Upload className="mr-2 h-5 w-5" />
              Preview appears here
            </div>
          )}

          <Button
            type="button"
            className="w-full"
            disabled={loading || (!file && !imageUrl.trim())}
            onClick={() => void analyze()}
          >
            <Sparkles className="h-4 w-4" />
            {loading ? "Analyzing…" : "Extract vibe with AI"}
          </Button>
        </CardContent>
      </Card>

      {analysis ? (
        <Card className="border-[var(--lagoon)]/40">
          <CardHeader>
            <CardTitle className="font-display text-xl">
              {analysis.destination_guess || "Your vibe"}
            </CardTitle>
            <CardDescription>{analysis.vibe}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {analysis.interests?.map((i) => (
                <span
                  key={i}
                  className="rounded-full bg-[var(--lagoon)]/10 px-3 py-1 text-xs font-medium text-[var(--lagoon)]"
                >
                  {i}
                </span>
              ))}
              <span className="rounded-full bg-[var(--sand-deep)] px-3 py-1 text-xs">
                ~{analysis.suggested_days} days · {analysis.pace}
              </span>
            </div>
            <p className="text-sm text-[var(--muted)]">{analysis.prompt}</p>
            <Button type="button" variant="accent" className="w-full" onClick={continueToWizard}>
              Continue to trip wizard
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <p className="text-center text-sm text-[var(--muted)]">
        <Link href="/trips/new" className="text-[var(--lagoon)] hover:underline">
          Skip — type a destination instead
        </Link>
      </p>
    </div>
  );
}
