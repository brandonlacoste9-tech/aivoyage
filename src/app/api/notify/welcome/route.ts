import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email";
import { isResendConfigured } from "@/lib/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** POST — send welcome email to the signed-in user (best-effort). */
export async function POST() {
  if (!isResendConfigured()) {
    return NextResponse.json({ ok: false, skipped: true, reason: "email_off" });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const name =
      (user.user_metadata?.display_name as string | undefined) ||
      user.email.split("@")[0];

    const result = await sendWelcomeEmail({ to: user.email, name });
    return NextResponse.json(result);
  } catch (e) {
    console.error("[notify/welcome]", e);
    return NextResponse.json({ ok: false, error: "Failed" }, { status: 500 });
  }
}
