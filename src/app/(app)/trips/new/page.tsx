import { TripWizard } from "@/components/trips/trip-wizard";

export const metadata = { title: "New trip" };

export default async function NewTripPage({
  searchParams,
}: {
  searchParams: Promise<{
    prompt?: string;
    destination?: string;
    vibe?: string;
  }>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          New trip
        </h1>
        <p className="text-[var(--muted)]">
          Single city or multi-city — AI builds the day-by-day plan
        </p>
      </div>
      <TripWizard
        defaultDestination={params.destination ?? ""}
        defaultPrompt={params.prompt ?? ""}
        defaultVibe={params.vibe ?? ""}
      />
    </div>
  );
}
