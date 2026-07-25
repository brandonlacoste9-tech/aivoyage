import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/components/legal/legal-shell";
import { APP_NAME, APP_DOMAIN } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms governing use of ${APP_NAME} at ${APP_DOMAIN}.`,
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="July 25, 2026">
      <section>
        <h2 className="font-display text-xl font-semibold">1. Agreement</h2>
        <p className="mt-2 text-[var(--muted)]">
          By accessing or using {APP_NAME} at {APP_DOMAIN} (the “Service”), you
          agree to these Terms of Service (“Terms”). If you do not agree, do not
          use the Service.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">2. The Service</h2>
        <p className="mt-2 text-[var(--muted)]">
          {APP_NAME} provides AI-assisted travel planning tools, including
          day-by-day itineraries, maps, weather context, budgets, chat
          refinement, and sharing features. Features may change as we improve the
          product. Free and paid plans have different limits as described on our{" "}
          <Link href="/pricing" className="text-[var(--lagoon)] hover:underline">
            Pricing
          </Link>{" "}
          page.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">3. Accounts</h2>
        <p className="mt-2 text-[var(--muted)]">
          You must provide accurate account information and keep your credentials
          secure. You are responsible for activity under your account. Notify us
          promptly of unauthorized use at hello@trip-planner.co.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">
          4. AI-generated content
        </h2>
        <p className="mt-2 text-[var(--muted)]">
          Itineraries, suggestions, costs, and place details are AI-generated
          estimates and may be incomplete, outdated, or incorrect. Always verify
          opening hours, visas, transport, safety, and booking details before you
          travel. {APP_NAME} is a planning aid, not a booking agent, travel
          insurer, or licensed travel advisor.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">
          5. Acceptable use
        </h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-[var(--muted)]">
          <li>Do not abuse, overload, or reverse engineer the Service.</li>
          <li>Do not use the Service for unlawful, harmful, or deceptive purposes.</li>
          <li>Do not attempt to bypass plan limits, credits, or security controls.</li>
          <li>
            Do not submit content that infringes others’ rights or contains
            malware.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">
          6. Subscriptions & billing
        </h2>
        <p className="mt-2 text-[var(--muted)]">
          Paid plans (e.g. Pro) are billed through Stripe on a recurring basis
          until canceled. Prices are shown at checkout and may change with notice
          for future periods. You can manage or cancel via the in-app billing
          portal when available. Fees already charged are generally
          non-refundable except where required by law or expressly stated by us.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">
          7. Your content
        </h2>
        <p className="mt-2 text-[var(--muted)]">
          You retain ownership of content you create (trip notes, preferences,
          custom edits). You grant us a limited license to host, process, and
          display that content solely to operate and improve the Service. Public
          share links make itinerary content viewable by anyone with the link.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">
          8. Third-party services
        </h2>
        <p className="mt-2 text-[var(--muted)]">
          Maps, weather, payments, AI models, hotels/flights affiliate links, and
          similar integrations are provided by third parties under their own
          terms. We are not responsible for third-party sites or services.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">
          9. Disclaimers
        </h2>
        <p className="mt-2 text-[var(--muted)]">
          THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTIES
          OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR
          A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. We do not warrant that
          itineraries will be accurate, available, or uninterrupted.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">
          10. Limitation of liability
        </h2>
        <p className="mt-2 text-[var(--muted)]">
          To the maximum extent permitted by law, {APP_NAME} and its operators
          will not be liable for indirect, incidental, special, consequential, or
          punitive damages, or any loss of profits, data, travel costs, or
          goodwill arising from your use of the Service. Our aggregate liability
          for claims relating to the Service will not exceed the greater of (a)
          amounts you paid us in the 12 months before the claim or (b) USD $50.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">11. Termination</h2>
        <p className="mt-2 text-[var(--muted)]">
          We may suspend or terminate access if you violate these Terms or abuse
          the Service. You may stop using the Service at any time and request
          account deletion by contacting us.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">12. Privacy</h2>
        <p className="mt-2 text-[var(--muted)]">
          Our{" "}
          <Link href="/privacy" className="text-[var(--lagoon)] hover:underline">
            Privacy Policy
          </Link>{" "}
          describes how we handle personal data.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">13. Changes</h2>
        <p className="mt-2 text-[var(--muted)]">
          We may update these Terms by posting a revised version on this page.
          Continued use after changes constitutes acceptance of the updated
          Terms.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">14. Contact</h2>
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
