import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, Trash2 } from "lucide-react";
import {
  deleteFavoriteAction,
  listFavoritesAction,
} from "@/app/actions/favorites";
import { coverForDestination } from "@/lib/destinations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Favorites" };

async function removeFavorite(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (!id) return;
  await deleteFavoriteAction(id);
}

export default async function FavoritesPage() {
  const favorites = await listFavoritesAction();

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--coral)]">
          Saved
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Favorite places
        </h1>
        <p className="mt-1 text-[var(--muted)]">
          Heart activities on a trip to collect them here for later voyages.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-[var(--border)] bg-[var(--card)] px-8 py-16 text-center">
          <Heart className="mx-auto h-8 w-8 text-[var(--coral)]" />
          <h2 className="mt-4 font-display text-xl font-semibold">
            No favorites yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
            Open a trip workspace and tap the heart on any activity to save it.
          </p>
          <Button asChild className="mt-6" variant="accent">
            <Link href="/trips">Browse trips</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((f) => {
            const img =
              f.image_url ||
              coverForDestination(f.destination || f.title || "travel");
            return (
              <article
                key={f.id}
                className="overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] shadow-sm"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={img}
                    alt={f.title}
                    fill
                    className="object-cover"
                    sizes="33vw"
                  />
                  <div className="absolute left-3 top-3">
                    <Badge variant="secondary" className="capitalize">
                      {f.type}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h2 className="font-display text-lg font-semibold">
                    {f.title}
                  </h2>
                  {f.destination ? (
                    <p className="mt-1 flex items-center gap-1 text-sm text-[var(--muted)]">
                      <MapPin className="h-3.5 w-3.5" />
                      {f.destination}
                    </p>
                  ) : null}
                  {f.description ? (
                    <p className="mt-2 line-clamp-3 text-sm text-[var(--muted)]">
                      {f.description}
                    </p>
                  ) : null}
                  <form action={removeFavorite} className="mt-4">
                    <input type="hidden" name="id" value={f.id} />
                    <Button type="submit" size="sm" variant="outline">
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
