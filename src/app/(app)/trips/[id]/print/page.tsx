import { notFound } from "next/navigation";
import { getTripWithDetails } from "@/app/actions/trips";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PrintClient } from "./print-client";

export default async function PrintTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = await getTripWithDetails(id);
  if (!trip) notFound();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PrintClient title={trip.title} />
      <main className="mx-auto max-w-3xl px-6 py-10 print:px-0 print:py-4">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
            VoyageAI itinerary
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">
            {trip.title}
          </h1>
          <p className="mt-2 text-slate-600">
            {trip.destination} · {formatDate(trip.start_date)} –{" "}
            {formatDate(trip.end_date)}
          </p>
          {trip.notes ? (
            <p className="mt-4 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
              {trip.notes.replace(/\n\n— Planned with.*$/, "")}
            </p>
          ) : null}
        </header>

        <div className="mt-8 space-y-8">
          {trip.days.map((day, i) => (
            <section key={day.id} className="break-inside-avoid">
              <h2 className="font-serif text-xl font-semibold">
                Day {i + 1} · {formatDate(day.date)}
              </h2>
              {day.notes ? (
                <p className="mt-1 text-sm text-slate-600">{day.notes}</p>
              ) : null}
              <ol className="mt-4 space-y-3">
                {day.activities.map((a, idx) => (
                  <li
                    key={a.id}
                    className="flex gap-3 border-b border-slate-100 pb-3"
                  >
                    <span className="w-6 shrink-0 text-sm font-semibold text-slate-400">
                      {idx + 1}.
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {a.start_time ? (
                          <span className="mr-2 font-mono text-xs text-slate-500">
                            {a.start_time}
                          </span>
                        ) : null}
                        {a.title}
                      </p>
                      {a.description ? (
                        <p className="mt-0.5 text-sm text-slate-600">
                          {a.description}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                        {a.type}
                        {a.duration_min ? ` · ${a.duration_min}m` : ""}
                        {a.cost_cents
                          ? ` · ${formatCurrency(a.cost_cents, trip.currency)}`
                          : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        {trip.expenses.length > 0 ? (
          <section className="mt-10 break-inside-avoid border-t border-slate-200 pt-6">
            <h2 className="font-serif text-xl font-semibold">Budget snapshot</h2>
            <ul className="mt-3 space-y-1 text-sm">
              {trip.expenses.map((e) => (
                <li key={e.id} className="flex justify-between gap-4">
                  <span className="text-slate-600">
                    {e.note || e.category}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(e.amount_cents, trip.currency)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-right text-sm font-semibold">
              Total{" "}
              {formatCurrency(
                trip.expenses.reduce((s, e) => s + e.amount_cents, 0),
                trip.currency,
              )}
            </p>
          </section>
        ) : null}

        <footer className="mt-12 border-t border-slate-200 pt-4 text-center text-xs text-slate-400 print:mt-8">
          Planned with VoyageAI · {new Date().toLocaleDateString()}
        </footer>
      </main>
    </div>
  );
}
