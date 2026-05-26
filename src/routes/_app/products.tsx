import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Search, X, Package, Barcode, CreditCard as Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { formatCurrency, rupeesToCents, centsToRupees } from "@/lib/db";
import type { Database } from "@/lib/supabase";

type Product = Database["public"]["Tables"]["products"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type Brand = Database["public"]["Tables"]["brands"]["Row"];

export const Route = createFileRoute("/_app/products")({
  component: ProductsPage,
});

function ProductsPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products", q],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`*, categories(name), brands(name)`)
        .order("name", { ascending: true });

      if (q) {
        query = query.or(`name.ilike.%${q}%,code.ilike.%${q}%,barcode.eq.${q}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data, error } = await supabase.from("brands").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase
      .from("products")
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete product");
      return;
    }

    toast.success("Product deleted");
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Catalog with cash and installment pricing. {products.length} products.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setOpen(true);
          }}
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
          placeholder="Search by name, code or barcode..."
          className="w-full h-10 pl-9 pr-3 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading products...</div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5">Product</th>
                  <th className="text-left font-medium px-4 py-2.5">Code</th>
                  <th className="text-left font-medium px-4 py-2.5">Barcode</th>
                  <th className="text-left font-medium px-4 py-2.5">Category</th>
                  <th className="text-left font-medium px-4 py-2.5">Brand</th>
                  <th className="text-right font-medium px-4 py-2.5">Cash</th>
                  <th className="text-right font-medium px-4 py-2.5">Installment</th>
                  <th className="text-left font-medium px-4 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const product = p as any;
                  return (
                    <tr key={p.id} className="border-t hover:bg-muted/30">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          {p.image_url && (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="size-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{p.name}</div>
                            {!p.is_active && (
                              <span className="text-xs text-muted-foreground">(Inactive)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{p.code}</td>
                      <td className="px-4 py-2.5 font-mono text-xs">
                        <div className="flex items-center gap-1">
                          <Barcode className="size-3" />
                          {p.barcode}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {product.categories?.name || "—"}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {product.brands?.name || "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {formatCurrency(p.cash_price)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-primary font-medium">
                        {formatCurrency(p.installment_price)}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setOpen(true);
                            }}
                            className="size-8 grid place-items-center rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="size-8 grid place-items-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {open && (
        <ProductDialog
          product={editingProduct}
          categories={categories}
          brands={brands}
          onClose={() => {
            setOpen(false);
            setEditingProduct(null);
            queryClient.invalidateQueries({ queryKey: ["products"] });
          }}
        />
      )}
    </div>
  );
}

function ProductDialog({
  product,
  categories,
  brands,
  onClose,
}: {
  product: Product | null;
  categories: Category[];
  brands: Brand[];
  onClose: () => void;
}) {
  const isEditing = !!product;

  const [form, setForm] = useState({
    name: product?.name || "",
    code: product?.code || "",
    barcode: product?.barcode || "",
    category_id: product?.category_id || "",
    brand_id: product?.brand_id || "",
    cost_price: product ? centsToRupees(product.cost_price).toString() : "",
    cash_price: product ? centsToRupees(product.cash_price).toString() : "",
    installment_price: product ? centsToRupees(product.installment_price).toString() : "",
    warranty_months: product?.warranty_months?.toString() || "12",
    low_stock_threshold: product?.low_stock_threshold?.toString() || "10",
    has_serial: product?.has_serial || false,
  });

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim() || !form.cash_price) {
      toast.error("Name, code and cash price are required.");
      return;
    }

    const productData = {
      name: form.name.trim(),
      code: form.code.trim(),
      barcode: form.barcode.trim() || null,
      category_id: form.category_id || null,
      brand_id: form.brand_id || null,
      cost_price: rupeesToCents(Number(form.cost_price) || 0),
      cash_price: rupeesToCents(Number(form.cash_price) || 0),
      installment_price:
        form.installment_price && Number(form.installment_price) > 0
          ? rupeesToCents(Number(form.installment_price))
          : Math.round(rupeesToCents(Number(form.cash_price) || 0) * 1.2),
      warranty_months: Number(form.warranty_months) || 0,
      low_stock_threshold: Number(form.low_stock_threshold) || 10,
      has_serial: form.has_serial,
      is_active: true,
    };

    if (isEditing && product) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", product.id);

      if (error) {
        toast.error("Failed to update product");
        return;
      }
      toast.success("Product updated");
    } else {
      const { error } = await supabase.from("products").insert(productData);

      if (error) {
        toast.error("Failed to create product");
        return;
      }
      toast.success("Product created");
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="bg-card rounded-xl border shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">{isEditing ? "Edit product" : "New product"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="size-8 grid place-items-center rounded-md hover:bg-accent"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="p-4 grid gap-3 sm:grid-cols-2">
          <Field label="Name *" className="sm:col-span-2">
            <input value={form.name} onChange={set("name")} className={inputCls} required />
          </Field>
          <Field label="Code *">
            <input value={form.code} onChange={set("code")} className={inputCls} required />
          </Field>
          <Field label="Barcode">
            <input value={form.barcode} onChange={set("barcode")} className={inputCls} />
          </Field>
          <Field label="Category">
            <select value={form.category_id} onChange={set("category_id")} className={inputCls}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Brand">
            <select value={form.brand_id} onChange={set("brand_id")} className={inputCls}>
              <option value="">Select brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Cost price (Rs)">
            <input
              type="number"
              value={form.cost_price}
              onChange={set("cost_price")}
              className={inputCls}
              min="0"
              step="0.01"
            />
          </Field>
          <Field label="Cash price (Rs) *">
            <input
              type="number"
              value={form.cash_price}
              onChange={set("cash_price")}
              className={inputCls}
              required
              min="0"
              step="0.01"
            />
          </Field>
          <Field label="Installment price (Rs)">
            <input
              type="number"
              value={form.installment_price}
              onChange={set("installment_price")}
              className={inputCls}
              min="0"
              step="0.01"
            />
          </Field>
          <Field label="Warranty (months)">
            <input
              type="number"
              value={form.warranty_months}
              onChange={set("warranty_months")}
              className={inputCls}
              min="0"
            />
          </Field>
          <Field label="Low stock threshold">
            <input
              type="number"
              value={form.low_stock_threshold}
              onChange={set("low_stock_threshold")}
              className={inputCls}
              min="0"
            />
          </Field>
          <Field label="Has serial number" className="sm:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.has_serial}
                onChange={(e) => setForm((f) => ({ ...f, has_serial: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Track serial numbers for warranty</span>
            </label>
          </Field>
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-md border text-sm hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            {isEditing ? "Update product" : "Save product"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full h-9 px-3 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-ring";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"space-y-1.5 " + className}>
      <label className="text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
