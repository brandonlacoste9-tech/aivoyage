"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Expense, Trip } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const COLORS = ["#0f5c63", "#2a9d8f", "#e07a5f", "#c4a35a", "#8b5cf6", "#ec4899"];

export function BudgetChart({
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

  const byCategory = Object.entries(
    expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount_cents;
      return acc;
    }, {}),
  )
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: value / 100,
      cents: value,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
              Spent
            </p>
            <p className="font-display text-2xl font-semibold">
              {formatCurrency(spent, trip.currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--muted)]">Budget</p>
            <p className="font-medium">
              {budget != null
                ? formatCurrency(budget, trip.currency)
                : "Not set"}
            </p>
          </div>
        </div>
        {budget != null ? <Progress value={pct} /> : null}
        {budget != null ? (
          <p className="mt-1 text-xs text-[var(--muted)]">{pct}% of budget</p>
        ) : null}
      </div>

      {byCategory.length > 0 ? (
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCategory} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                formatter={(v) =>
                  formatCurrency(Math.round(Number(v) * 100), trip.currency)
                }
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {byCategory.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          Costs appear after activities with prices are generated.
        </p>
      )}
    </div>
  );
}
