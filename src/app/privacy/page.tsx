import type { Metadata } from "next";
import { LegalShell } from "@/components/legal/legal-shell";
import { APP_NAME, APP_DOMAIN } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${APP_NAME} collects, uses, and protects your data.`,
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="July 25, 2026">
      <section>
        <h2 className="font-display text-xl font-semibold">1. Who we are</h2>
        <p className="mt-2 text-[var(--muted)]">
          {APP_NAME} (“we”, “us”) operates the website and service at{" "}
          <strong>{APP_DOMAIN}</strong> (the “Service”). This policy explains
          what information we collect and how we use it when you plan trips with
          our AI itinerary tools.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">
          2. Information we collect
        </h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-[var(--muted)]">
          <li>
            <strong>Account data:</strong> email address, display name, and
            authentication identifiers when you sign up (via email/password or
            OAuth providers you choose).
          </li>
          <li>
            <strong>Trip content:</strong> destinations, dates, preferences,
            itineraries, notes, packing lists, and related planning data you
            create.
          </li>
          <li>
            <strong>Billing data:</strong> subscription status and Stripe
            customer IDs. Card numbers are processed by Stripe; we do not store
            full card details on our servers.
          </li>
          <li>
            <strong>Usage & device data:</strong> pages visited, feature usage,
            approximate location from IP (for security/analytics), browser type,
            and error logs.
          </li>
          <li>
            <strong>Communications:</strong> emails you send us and messages you
            exchange with our AI chat for itinerary refinement.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">
          3. How we use information
        </h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-[var(--muted)]">
          <li>Provide and improve AI trip planning, maps, weather, and chat.</li>
          <li>Authenticate accounts, enforce free/Pro limits, and process payments.</li>
          <li>Send transactional email (welcome, trip ready, billing-related).</li>
          <li>Monitor reliability, prevent abuse, and secure the Service.</li>
          <li>Understand product usage via analytics (e.g. PostHog) to improve UX.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">
          4. AI processing
        </h2>
        <p className="mt-2 text-[var(--muted)]">
          Trip prompts and itinerary content may be sent to AI providers (such as
          xAI Grok or configured fallbacks) to generate and refine plans. Do not
          include sensitive personal data (passports, government IDs, health
          details, or payment card numbers) in trip prompts or chat.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">
          5. Sharing & processors
        </h2>
        <p className="mt-2 text-[var(--muted)]">
          We use trusted service providers who process data on our behalf, for
          example:
        </p>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-[var(--muted)]">
          <li>Supabase — authentication and database</li>
          <li>Stripe — payments and subscriptions</li>
          <li>Netlify — hosting</li>
          <li>Mapbox / WeatherAPI — maps and forecasts</li>
          <li>xAI (and optional AI fallbacks) — itinerary generation</li>
          <li>Resend — transactional email (when enabled)</li>
          <li>PostHog — product analytics (when enabled)</li>
        </ul>
        <p className="mt-2 text-[var(--muted)]">
          We do not sell your personal information. Shared public trip links
          expose only the itinerary content you choose to share.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">6. Cookies</h2>
        <p className="mt-2 text-[var(--muted)]">
          We use essential cookies for authentication and session security, and
          optional analytics cookies/local storage when analytics is enabled. You
          can block non-essential cookies in your browser; core planning may
          still work, but sign-in requires essential cookies.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">7. Retention</h2>
        <p className="mt-2 text-[var(--muted)]">
          We retain account and trip data while your account is active. You may
          request deletion of your account and associated data by emailing{" "}
          <a
            href="mailto:hello@trip-planner.co"
            className="text-[var(--lagoon)] hover:underline"
          >
            hello@trip-planner.co
          </a>
          . Backup copies may persist for a limited period for security and legal
          compliance.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">8. Your rights</h2>
        <p className="mt-2 text-[var(--muted)]">
          Depending on your location, you may have rights to access, correct,
          export, or delete personal data, or object to certain processing.
          Contact us to exercise these rights. If you are in the EEA/UK, you may
          also lodge a complaint with your local supervisory authority.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">9. Children</h2>
        <p className="mt-2 text-[var(--muted)]">
          The Service is not directed to children under 16. We do not knowingly
          collect personal information from children under 16.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">10. Changes</h2>
        <p className="mt-2 text-[var(--muted)]">
          We may update this policy from time to time. We will post the updated
          version on this page and revise the “Last updated” date.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">11. Contact</h2>
        <p className="mt-2 text-[var(--muted)]">
          {APP_NAME} · {APP_DOMAIN}
          <br />
          Email:{" "}
          <a
            href="mailto:hello@trip-planner.co"
            className="text-[var(--lagoon)] hover:underline"
          >
            hello@trip-planner.co
          </a>
        </p>
      </section>
    </LegalShell>
  );
}
