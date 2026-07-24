import { notFound } from "next/navigation";
import { getTripWithDetails } from "@/app/actions/trips";
import { requireUser } from "@/lib/auth";
import { fetchWeather } from "@/lib/weather";
import { TripWorkspace } from "@/components/workspace/trip-workspace";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = await getTripWithDetails(id);
  return { title: trip?.title ?? "Trip" };
}

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const trip = await getTripWithDetails(id);
  if (!trip) notFound();

  const weather = await fetchWeather(trip.destination, 7);

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      <TripWorkspace
        trip={trip}
        weather={weather}
        currentUserId={user.id}
      />
    </div>
  );
}
