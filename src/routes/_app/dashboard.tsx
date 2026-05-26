import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/stat-card";
import { Wallet, ShoppingCart, Users, AlertTriangle, TrendingUp, Truck } from "lucide-react";
import { SALES_TREND, LORRY_PERFORMANCE, SALES, PRODUCTS, fmtLKR } from "@/lib/mock-data";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar,
} from "recharts";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const todayCash = 184500;
  const todayInstallment = 96200;
  const todayTotal = todayCash + todayInstallment;
  const outstanding = 1_245_000;
  const lowStock = PRODUCTS.filter((p) => p.warehouseQty <= p.lowStockAt).length;
  const recent = SALES.slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of today's activity across all lorries and counters.</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's Sales" value={fmtLKR(todayTotal)} delta="↑ 12.4% vs yesterday" icon={ShoppingCart} />
        <StatCard label="Cash Collected" value={fmtLKR(todayCash)} delta="42 transactions" icon={Wallet} tone="success" />
        <StatCard label="Outstanding" value={fmtLKR(outstanding)} delta="68 active installments" icon={Users} tone="warning" />
        <StatCard label="Low Stock Items" value={String(lowStock)} delta="Requires reorder" icon={AlertTriangle} tone="destructive" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-medium">Sales — last 14 days</div>
              <div className="text-xs text-muted-foreground">Cash vs Installment</div>
            </div>
            <TrendingUp className="size-4 text-muted-foreground" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SALES_TREND} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickFormatter={(v) => (v / 1000).toFixed(0) + "k"} />
                <Tooltip
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => fmtLKR(v)}
                />
                <Area type="monotone" dataKey="cash" stroke="var(--color-chart-1)" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="installment" stroke="var(--color-chart-3)" fill="url(#g2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-medium">Lorry performance</div>
              <div className="text-xs text-muted-foreground">Today's revenue (12 lorries)</div>
            </div>
            <Truck className="size-4 text-muted-foreground" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={LORRY_PERFORMANCE} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="lorry" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickFormatter={(v) => (v / 1000).toFixed(0) + "k"} />
                <Tooltip
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => fmtLKR(v)}
                />
                <Bar dataKey="sales" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b">
          <div className="font-medium">Recent sales</div>
          <div className="text-xs text-muted-foreground">Latest transactions across all channels</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Invoice</th>
                <th className="text-left font-medium px-4 py-2.5">Date</th>
                <th className="text-left font-medium px-4 py-2.5">Customer</th>
                <th className="text-left font-medium px-4 py-2.5">Staff</th>
                <th className="text-left font-medium px-4 py-2.5">Type</th>
                <th className="text-right font-medium px-4 py-2.5">Total</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-2.5 font-medium">{s.id}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{s.date}</td>
                  <td className="px-4 py-2.5">{s.customer}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{s.staff}</td>
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
