import { notFound } from "next/navigation";
import { getTripWithDetails } from "@/app/actions/trips";
import { requireProfile, requireUser } from "@/lib/auth";
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
  const profile = await requireProfile();
  const trip = await getTripWithDetails(id);
  if (!trip) notFound();

  // Weather for primary city (first segment of multi-city)
  const weatherCity =
    (Array.isArray(trip.cities) && trip.cities[0]?.name) ||
    trip.destination.split(/→|->/)[0]?.trim() ||
    trip.destination;
  const weather = await fetchWeather(weatherCity, 7);

  return (
    <div className="p-2 sm:p-4 lg:p-6">
      <TripWorkspace
        trip={trip}
        weather={weather}
        currentUserId={user.id}
        displayName={profile.display_name || user.email?.split("@")[0] || "Traveler"}
      />
    </div>
  );
}
