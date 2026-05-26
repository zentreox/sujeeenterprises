import { createFileRoute } from "@tanstack/react-router";
import { PRODUCTS, fmtLKR } from "@/lib/mock-data";
import { AlertTriangle, Boxes, Package2, Warehouse } from "lucide-react";
import { StatCard } from "@/components/stat-card";

export const Route = createFileRoute("/_app/inventory")({
  component: InventoryPage,
});

function InventoryPage() {
  const totalSKU = PRODUCTS.length;
  const totalUnits = PRODUCTS.reduce((s, p) => s + p.warehouseQty, 0);
  const stockValue = PRODUCTS.reduce((s, p) => s + p.warehouseQty * p.costPrice, 0);
  const lowStock = PRODUCTS.filter((p) => p.warehouseQty <= p.lowStockAt);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">Warehouse stock levels and reorder alerts.</p>
        </div>
        <button className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">+ Stock movement</button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total SKUs" value={String(totalSKU)} icon={Package2} />
        <StatCard label="Units in Warehouse" value={totalUnits.toLocaleString()} icon={Warehouse} />
        <StatCard label="Stock Value (cost)" value={fmtLKR(stockValue)} icon={Boxes} tone="success" />
        <StatCard label="Low Stock" value={String(lowStock.length)} icon={AlertTriangle} tone="destructive" />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b">
          <div className="font-medium">Warehouse stock</div>
          <div className="text-xs text-muted-foreground">All products with current levels</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Product</th>
                <th className="text-left font-medium px-4 py-2.5">Code</th>
                <th className="text-left font-medium px-4 py-2.5">Category</th>
                <th className="text-right font-medium px-4 py-2.5">Cost</th>
                <th className="text-right font-medium px-4 py-2.5">Qty</th>
                <th className="text-right font-medium px-4 py-2.5">Value</th>
                <th className="text-left font-medium px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map((p) => {
                const low = p.warehouseQty <= p.lowStockAt;
                return (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-2.5 font-medium">{p.name}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{p.code}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{p.category}</td>
                    <td className="px-4 py-2.5 text-right text-muted-foreground">{fmtLKR(p.costPrice)}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{p.warehouseQty}</td>
                    <td className="px-4 py-2.5 text-right">{fmtLKR(p.warehouseQty * p.costPrice)}</td>
                    <td className="px-4 py-2.5">
                      <span className={
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                        (low ? "bg-destructive/10 text-destructive" : "bg-success/15 text-success")
                      }>
                        {low ? "Low" : "OK"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
