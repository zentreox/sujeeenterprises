import { createFileRoute } from "@tanstack/react-router";
import { SALES, fmtLKR } from "@/lib/mock-data";
import { useMemo, useState } from "react";
import { StatCard } from "@/components/stat-card";
import { ShoppingCart, Wallet, CreditCard } from "lucide-react";

export const Route = createFileRoute("/_app/sales")({
  component: SalesPage,
});

function SalesPage() {
  const [filter, setFilter] = useState<"all" | "cash" | "installment">("all");
  const rows = useMemo(() => SALES.filter((s) => filter === "all" || s.type === filter), [filter]);
  const totalAll = SALES.reduce((s, x) => s + x.total, 0);
  const totalCash = SALES.filter((s) => s.type === "cash").reduce((s, x) => s + x.total, 0);
  const totalInst = totalAll - totalCash;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sales</h1>
        <p className="text-sm text-muted-foreground">All transactions across cash and installment channels.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatCard label="Total Sales" value={fmtLKR(totalAll)} icon={ShoppingCart} />
        <StatCard label="Cash" value={fmtLKR(totalCash)} icon={Wallet} tone="success" />
        <StatCard label="Installment" value={fmtLKR(totalInst)} icon={CreditCard} />
      </div>

      <div className="flex gap-2">
        {(["all", "cash", "installment"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={
              "h-9 px-4 rounded-md border text-sm font-medium capitalize transition " +
              (filter === t ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-accent")
            }
          >
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Invoice</th>
                <th className="text-left font-medium px-4 py-2.5">Date</th>
                <th className="text-left font-medium px-4 py-2.5">Customer</th>
                <th className="text-left font-medium px-4 py-2.5">Staff</th>
                <th className="text-right font-medium px-4 py-2.5">Items</th>
                <th className="text-left font-medium px-4 py-2.5">Type</th>
                <th className="text-right font-medium px-4 py-2.5">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-2.5 font-medium">{s.id}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{s.date}</td>
                  <td className="px-4 py-2.5">{s.customer}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{s.staff}</td>
                  <td className="px-4 py-2.5 text-right">{s.items}</td>
                  <td className="px-4 py-2.5">
                    <span className={
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                      (s.type === "cash" ? "bg-success/15 text-success" : "bg-primary/10 text-primary")
                    }>
                      {s.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium">{fmtLKR(s.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
