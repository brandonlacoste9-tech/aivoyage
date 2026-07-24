import { requireProfile, requireUser } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  isAnthropicConfigured,
  isMapboxConfigured,
  isStripeConfigured,
  isWeatherConfigured,
  isXaiConfigured,
} from "@/lib/config";
import { getAiProviderLabel } from "@/lib/ai/model";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await requireProfile();

  const integrations = [
    { name: "xAI Grok (primary AI)", ok: isXaiConfigured() },
    { name: "Anthropic Claude (fallback)", ok: isAnthropicConfigured() },
    { name: "Mapbox", ok: isMapboxConfigured() },
    { name: "WeatherAPI", ok: isWeatherConfigured() },
    { name: "Stripe", ok: isStripeConfigured() },
  ];
  const activeAi = getAiProviderLabel();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Account and environment status
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>From Supabase Auth + profiles table</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-slate-500">Email:</span> {user.email}
          </p>
          <p>
            <span className="text-slate-500">Name:</span>{" "}
            {profile.display_name || "—"}
          </p>
          <p className="flex items-center gap-2">
            <span className="text-slate-500">Plan:</span>
            <Badge variant={profile.plan === "pro" ? "default" : "secondary"}>
              {profile.plan}
            </Badge>
          </p>
          <p>
            <span className="text-slate-500">AI generations this month:</span>{" "}
            {profile.ai_generations_month}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Active AI provider: <strong>{activeAi}</strong>. Optional APIs
            degrade gracefully when keys are missing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {integrations.map((i) => (
            <div
              key={i.name}
              className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm dark:border-slate-800"
            >
              <span>{i.name}</span>
              <Badge variant={i.ok ? "success" : "warning"}>
                {i.ok ? "configured" : "missing"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
