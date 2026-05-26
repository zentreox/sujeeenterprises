import { createFileRoute } from "@tanstack/react-router";
import { PRODUCTS, fmtLKR } from "@/lib/mock-data";
import { useState } from "react";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_app/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const [q, setQ] = useState("");
  const filtered = PRODUCTS.filter((p) =>
    !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.code.toLowerCase().includes(q.toLowerCase()) || p.barcode.includes(q),
  );
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">Catalog with cash and installment pricing.</p>
        </div>
        <button className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">+ New product</button>
      </div>

      <div className="relative max-w-md">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, code or barcode…"
          className="w-full h-10 pl-9 pr-3 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">Product</th>
                <th className="text-left font-medium px-4 py-2.5">Code</th>
                <th className="text-left font-medium px-4 py-2.5">Barcode</th>
                <th className="text-left font-medium px-4 py-2.5">Brand</th>
                <th className="text-right font-medium px-4 py-2.5">Cash</th>
                <th className="text-right font-medium px-4 py-2.5">Installment</th>
                <th className="text-right font-medium px-4 py-2.5">Stock</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">{p.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.code}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{p.barcode}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{p.brand}</td>
                  <td className="px-4 py-2.5 text-right">{fmtLKR(p.cashPrice)}</td>
                  <td className="px-4 py-2.5 text-right text-primary font-medium">{fmtLKR(p.installmentPrice)}</td>
                  <td className="px-4 py-2.5 text-right">{p.warehouseQty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
