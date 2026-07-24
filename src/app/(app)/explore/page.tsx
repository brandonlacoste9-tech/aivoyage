import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Explore" };

const places = [
  {
    name: "Kyoto",
    blurb: "Temples, tea houses, autumn leaves",
    tags: "culture, food",
  },
  {
    name: "Lisbon",
    blurb: "Hills, pastéis, and golden light",
    tags: "food, walks",
  },
  {
    name: "Bali",
    blurb: "Beaches, rice terraces, temples",
    tags: "nature, relaxation",
  },
  {
    name: "Rome",
    blurb: "History stacked on history — and pasta",
    tags: "history, food",
  },
  {
    name: "Seoul",
    blurb: "Palaces, street food, nightlife",
    tags: "culture, nightlife",
  },
  {
    name: "New York",
    blurb: "Neighborhoods that feel like countries",
    tags: "city, food",
  },
];

export default function ExplorePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Spark ideas — start a trip from a destination
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {places.map((p) => (
          <Link
            key={p.name}
            href={`/trips/new?destination=${encodeURIComponent(p.name)}`}
          >
            <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
                <CardDescription>
                  {p.blurb}
                  <br />
                  <span className="text-xs text-indigo-600 dark:text-indigo-300">
                    {p.tags}
                  </span>
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
