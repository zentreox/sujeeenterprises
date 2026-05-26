import { createFileRoute } from "@tanstack/react-router";
import { fmtLKR, type Product } from "@/lib/mock-data";
import { useProducts, addProduct } from "@/lib/store";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/products")({
  component: ProductsPage,
});

const CATEGORIES = ["Kitchen", "Appliances", "Electronics", "Furniture", "Other"];

function ProductsPage() {
  const products = useProducts();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = products.filter((p) =>
    !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.code.toLowerCase().includes(q.toLowerCase()) || p.barcode.includes(q),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">Catalog with cash and installment pricing.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
        >
          + New product
        </button>
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

      {open && <NewProductDialog onClose={() => setOpen(false)} />}
    </div>
  );
}

function NewProductDialog({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: "",
    code: "",
    barcode: "",
    category: "Kitchen",
    brand: "",
    costPrice: "",
    cashPrice: "",
    installmentPrice: "",
    warehouseQty: "",
    lowStockAt: "10",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim() || !form.cashPrice) {
      toast.error("Name, code and cash price are required.");
      return;
    }
    const p: Product = {
      id: `P${Date.now().toString(36).toUpperCase()}`,
      name: form.name.trim(),
      code: form.code.trim(),
      barcode: form.barcode.trim() || `999${Date.now()}`.slice(0, 13),
      category: form.category,
      brand: form.brand.trim() || "Generic",
      costPrice: Number(form.costPrice) || 0,
      cashPrice: Number(form.cashPrice) || 0,
      installmentPrice: Number(form.installmentPrice) || Math.round((Number(form.cashPrice) || 0) * 1.2),
      warehouseQty: Number(form.warehouseQty) || 0,
      lowStockAt: Number(form.lowStockAt) || 0,
    };
    addProduct(p);
    toast.success(`${p.name} added to catalog.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="bg-card rounded-xl border shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">New product</h2>
          <button type="button" onClick={onClose} className="size-8 grid place-items-center rounded-md hover:bg-accent">
            <X className="size-4" />
          </button>
        </div>
        <div className="p-4 grid gap-3 sm:grid-cols-2">
          <Field label="Name *" className="sm:col-span-2">
            <input value={form.name} onChange={set("name")} className={inputCls} />
          </Field>
          <Field label="Code *">
            <input value={form.code} onChange={set("code")} className={inputCls} />
          </Field>
          <Field label="Barcode">
            <input value={form.barcode} onChange={set("barcode")} className={inputCls} />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={set("category")} className={inputCls}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Brand">
            <input value={form.brand} onChange={set("brand")} className={inputCls} />
          </Field>
          <Field label="Cost price (Rs)">
            <input type="number" value={form.costPrice} onChange={set("costPrice")} className={inputCls} />
          </Field>
          <Field label="Cash price (Rs) *">
            <input type="number" value={form.cashPrice} onChange={set("cashPrice")} className={inputCls} />
          </Field>
          <Field label="Installment price (Rs)">
            <input type="number" value={form.installmentPrice} onChange={set("installmentPrice")} className={inputCls} />
          </Field>
          <Field label="Stock qty">
            <input type="number" value={form.warehouseQty} onChange={set("warehouseQty")} className={inputCls} />
          </Field>
          <Field label="Low stock at">
            <input type="number" value={form.lowStockAt} onChange={set("lowStockAt")} className={inputCls} />
          </Field>
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-9 px-4 rounded-md border text-sm hover:bg-accent">Cancel</button>
          <button type="submit" className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Save product</button>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full h-9 px-3 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-ring";

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={"space-y-1.5 " + className}>
      <label className="text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
