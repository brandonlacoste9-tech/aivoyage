import { TripWizard } from "@/components/trips/trip-wizard";

export const metadata = { title: "New trip" };

export default async function NewTripPage({
  searchParams,
}: {
  searchParams: Promise<{ prompt?: string; destination?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New trip</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Tell us the basics — AI builds the day-by-day plan
        </p>
      </div>
      <TripWizard
        defaultDestination={params.destination ?? ""}
        defaultPrompt={params.prompt ?? ""}
      />
    </div>
  );
}
