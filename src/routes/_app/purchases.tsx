import { createFileRoute } from "@tanstack/react-router";
import { PURCHASES, fmtLKR } from "@/lib/mock-data";
import { StatCard } from "@/components/stat-card";
import { ReceiptText, Clock, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_app/purchases")({
  component: PurchasesPage,
});

function PurchasesPage() {
  const total = PURCHASES.reduce((s, x) => s + x.total, 0);
  const pending = PURCHASES.filter((p) => p.status === "pending");
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Purchases</h1>
          <p className="text-sm text-muted-foreground">Purchase orders from suppliers and goods received.</p>
        </div>
        <button className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">+ New PO</button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatCard label="Total Spend" value={fmtLKR(total)} icon={ReceiptText} />
        <StatCard label="Pending Orders" value={String(pending.length)} icon={Clock} tone="warning" />
        <StatCard label="Received" value={String(PURCHASES.length - pending.length)} icon={CheckCircle2} tone="success" />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">PO #</th>
                <th className="text-left font-medium px-4 py-2.5">Date</th>
                <th className="text-left font-medium px-4 py-2.5">Supplier</th>
                <th className="text-right font-medium px-4 py-2.5">Items</th>
                <th className="text-right font-medium px-4 py-2.5">Total</th>
                <th className="text-left font-medium px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {PURCHASES.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-2.5 font-medium">{p.id}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.date}</td>
                  <td className="px-4 py-2.5">{p.supplier}</td>
                  <td className="px-4 py-2.5 text-right">{p.items}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{fmtLKR(p.total)}</td>
                  <td className="px-4 py-2.5">
                    <span className={
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                      (p.status === "pending" ? "bg-warning/20 text-warning-foreground" : "bg-success/15 text-success")
                    }>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
