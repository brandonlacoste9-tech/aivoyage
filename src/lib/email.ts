import { Resend } from "resend";
import { APP_NAME, getAppUrl, isResendConfigured } from "@/lib/config";

let resend: Resend | null = null;

function getResend() {
  if (!isResendConfigured()) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY!);
  return resend;
}

function fromAddress() {
  return (
    process.env.RESEND_FROM ||
    `${APP_NAME} <onboarding@trip-planner.co>`
  );
}

export async function sendWelcomeEmail(input: {
  to: string;
  name?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const client = getResend();
  if (!client) return { ok: false, error: "Email not configured" };

  const first = input.name?.trim() || "traveler";
  const app = getAppUrl();

  try {
    const { error } = await client.emails.send({
      from: fromAddress(),
      to: input.to,
      subject: `Welcome to ${APP_NAME} — your next trip is one sentence away`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; color: #1a2b2e;">
          <h1 style="font-size: 22px;">Welcome, ${escapeHtml(first)} ✈️</h1>
          <p>Thanks for joining <strong>${APP_NAME}</strong>. Turn a half-formed idea into a day-by-day itinerary with real places, maps, weather, and budget.</p>
          <p><a href="${app}/trips/new" style="display:inline-block;background:#0f5c63;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:600;">Plan your first trip</a></p>
          <p style="color:#5a6b6e;font-size:14px;">Free plan includes a few AI itineraries every month. Upgrade anytime at <a href="${app}/pricing">${app}/pricing</a>.</p>
          <p style="color:#5a6b6e;font-size:12px;">— The ${APP_NAME} team · <a href="${app}">${app}</a></p>
        </div>
      `,
      text: `Welcome to ${APP_NAME}!\n\nPlan your first trip: ${app}/trips/new\nPricing: ${app}/pricing\n`,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Send failed",
    };
  }
}

export async function sendTripReadyEmail(input: {
  to: string;
  tripTitle: string;
  tripId: string;
  destination: string;
}): Promise<{ ok: boolean; error?: string }> {
  const client = getResend();
  if (!client) return { ok: false, error: "Email not configured" };

  const app = getAppUrl();
  const url = `${app}/trips/${input.tripId}`;

  try {
    const { error } = await client.emails.send({
      from: fromAddress(),
      to: input.to,
      subject: `Your ${input.destination} itinerary is ready`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; color: #1a2b2e;">
          <h1 style="font-size: 22px;">${escapeHtml(input.tripTitle)}</h1>
          <p>Your day-by-day plan for <strong>${escapeHtml(input.destination)}</strong> is ready — map pins, timing, and budget included.</p>
          <p><a href="${url}" style="display:inline-block;background:#0f5c63;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:600;">Open itinerary</a></p>
          <p style="color:#5a6b6e;font-size:14px;">Refine it in chat anytime. Share a public link when you're ready.</p>
          <p style="color:#5a6b6e;font-size:12px;">— ${APP_NAME}</p>
        </div>
      `,
      text: `Your itinerary is ready: ${input.tripTitle}\n${url}\n`,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Send failed",
    };
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
