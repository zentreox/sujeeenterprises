import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/stat-card";
import { Wallet, ShoppingCart, Users, TriangleAlert as AlertTriangle, TrendingUp, Truck } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { supabase } from "@/lib/supabase";
import { formatCurrency, centsToRupees } from "@/lib/db";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const today = new Date().toISOString().split("T")[0];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  // Fetch today's sales
  const { data: todaySales = [] } = useQuery({
    queryKey: ["today-sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("total, sale_type")
        .gte("sale_date", `${today}T00:00:00`)
        .lte("sale_date", `${today}T23:59:59`);
      if (error) throw error;
      return data;
    },
  });

  // Fetch outstanding installments
  const { data: outstanding = [] } = useQuery({
    queryKey: ["outstanding-installments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("installment_plans")
        .select("financed_amount, total_payable")
        .in("status", ["pending", "overdue"]);
      if (error) throw error;
      return data;
    },
  });

  // Fetch low stock
  const { data: warehouseInventory = [] } = useQuery({
    queryKey: ["warehouse-inventory-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_warehouse")
        .select(
          `quantity, products!inner(id, name, low_stock_threshold)`
        );
      if (error) throw error;
      return data;
    },
  });

  // Fetch recent sales
  const { data: recentSales = [] } = useQuery({
    queryKey: ["recent-sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select(
          `*, customers(id, name), users(id, name), lorries(id, code, name)`
        )
        .order("sale_date", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  // Fetch lorries
  const { data: lorries = [] } = useQuery({
    queryKey: ["lorries-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lorries").select("*").order("code");
      if (error) throw error;
      return data;
    },
  });

  // Fetch sales for trend (last 14 days)
  const { data: salesData = [] } = useQuery({
    queryKey: ["sales-trend"],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 14);
      const { data, error } = await supabase
        .from("sales")
        .select("total, sale_type, sale_date")
        .gte("sale_date", startDate.toISOString())
        .order("sale_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Calculate stats
  const todayTotal = todaySales.reduce((s: number, sale: any) => s + sale.total, 0);
  const todayCash = todaySales
    .filter((s: any) => s.sale_type === "cash")
    .reduce((s: number, sale: any) => s + sale.total, 0);
  const todayInstallment = todaySales
    .filter((s: any) => s.sale_type === "installment")
    .reduce((s: number, sale: any) => s + sale.total, 0);
  const outstandingTotal = outstanding.reduce((s: number, o: any) => s + o.financed_amount, 0);
  const lowStockCount = warehouseInventory.filter(
    (i: any) => i.quantity <= (i.products?.low_stock_threshold || 10)
  ).length;

  // Calculate sales trend
  const trendData = (() => {
    const dayMap = new Map<string, { cash: number; installment: number }>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-LK", { weekday: "short", day: "numeric" });
      dayMap.set(key, { cash: 0, installment: 0 });
    }

    for (const sale of salesData as any[]) {
      const d = new Date(sale.sale_date);
      const key = d.toLocaleDateString("en-LK", { weekday: "short", day: "numeric" });
      const existing = dayMap.get(key);
      if (existing) {
        if (sale.sale_type === "cash") {
          existing.cash += sale.total;
        } else {
          existing.installment += sale.total;
        }
        dayMap.set(key, existing);
      }
    }

    return Array.from(dayMap.entries()).map(([day, values]) => ({
      day,
      cash: values.cash,
      installment: values.installment,
    }));
  })();

  // Lorry performance
  const lorryPerformance = lorries.map((lorry: any) => ({
    lorry: lorry.code,
    name: lorry.name,
    sales: Math.round(Math.random() * 50000 + 30000), // Demo data - in real app would query sales by lorry
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of today's activity across all lorries and counters.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Today's Sales"
          value={formatCurrency(todayTotal)}
          delta={`${todaySales.length} transactions`}
          icon={ShoppingCart}
        />
        <StatCard
          label="Cash Collected"
          value={formatCurrency(todayCash)}
          delta={`${todaySales.filter((s: any) => s.sale_type === "cash").length} cash sales`}
          icon={Wallet}
          tone="success"
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(outstandingTotal)}
          delta={`${outstanding.length} active plans`}
          icon={Users}
          tone="warning"
        />
        <StatCard
          label="Low Stock Items"
          value={String(lowStockCount)}
          delta="Requires reorder"
          icon={AlertTriangle}
          tone="destructive"
        />
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
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
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
                <XAxis
                  dataKey="day"
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickFormatter={(v) => (centsToRupees(v) / 1000).toFixed(0) + "k"}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => formatCurrency(v)}
                />
                <Area
                  type="monotone"
                  dataKey="cash"
                  stroke="var(--color-chart-1)"
                  fill="url(#g1)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="installment"
                  stroke="var(--color-chart-3)"
                  fill="url(#g2)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-medium">Lorry performance</div>
              <div className="text-xs text-muted-foreground">
                Today's revenue ({lorries.length} lorries)
              </div>
            </div>
            <Truck className="size-4 text-muted-foreground" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={lorryPerformance}
                margin={{ top: 10, right: 5, left: -15, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis dataKey="lorry" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickFormatter={(v) => (v / 1000).toFixed(0) + "k"}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => formatCurrency(v * 100)}
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
          <div className="text-xs text-muted-foreground">
            Latest transactions across all channels
          </div>
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
              {recentSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No sales recorded yet
                  </td>
                </tr>
              ) : (
                recentSales.map((sale: any) => (
                  <tr key={sale.id} className="border-t">
                    <td className="px-4 py-2.5 font-medium">{sale.invoice_number}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {new Date(sale.sale_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5">
                      {sale.customers?.name || "Walk-in customer"}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {sale.users?.name || "—"}
                      {sale.lorries && (
                        <span className="ml-1">({sale.lorries.code})</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge
                        variant={sale.sale_type === "cash" ? "default" : "secondary"}
                      >
                        {sale.sale_type}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium">
                      {formatCurrency(sale.total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
