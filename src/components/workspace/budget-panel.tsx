import type { Expense, Trip } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export function BudgetPanel({
  trip,
  expenses,
}: {
  trip: Trip;
  expenses: Expense[];
}) {
  const spent = expenses.reduce((s, e) => s + e.amount_cents, 0);
  const budget = trip.budget_cents;
  const pct =
    budget && budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount_cents;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Spent
            </p>
            <p className="text-2xl font-bold">
              {formatCurrency(spent, trip.currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Budget</p>
            <p className="font-medium">
              {budget != null
                ? formatCurrency(budget, trip.currency)
                : "Not set"}
            </p>
          </div>
        </div>
        {budget != null ? <Progress value={pct} /> : null}
        {budget != null ? (
          <p className="mt-1 text-xs text-slate-500">{pct}% of budget</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">By category</p>
        {Object.keys(byCategory).length === 0 ? (
          <p className="text-sm text-slate-500">
            Costs appear after AI generates activities with prices.
          </p>
        ) : (
          Object.entries(byCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([cat, amount]) => (
              <div
                key={cat}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/50"
              >
                <span className="capitalize">{cat}</span>
                <span className="font-medium">
                  {formatCurrency(amount, trip.currency)}
                </span>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
