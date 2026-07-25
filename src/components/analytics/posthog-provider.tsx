"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import {
  isPostHogConfigured,
  POSTHOG_HOST,
  POSTHOG_KEY,
} from "@/lib/analytics";

let initialized = false;

function initPostHog() {
  if (initialized || !isPostHogConfigured() || typeof window === "undefined") {
    return;
  }
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false, // we capture manually for App Router
    capture_pageleave: true,
    persistence: "localStorage+cookie",
  });
  // Expose for trackEvent helper
  (window as unknown as { posthog: typeof posthog }).posthog = posthog;
  initialized = true;
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isPostHogConfigured()) return;
    initPostHog();
    if (!pathname) return;
    let url = window.origin + pathname;
    const q = searchParams?.toString();
    if (q) url += `?${q}`;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  if (!isPostHogConfigured()) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}
