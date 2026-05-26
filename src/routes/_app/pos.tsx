import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { PRODUCTS, fmtLKR, type Product } from "@/lib/mock-data";
import { ScanBarcode, Search, Trash2, Plus, Minus, ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/_app/pos")({
  component: POSPage,
});

type CartItem = { product: Product; qty: number };

function POSPage() {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentType, setPaymentType] = useState<"cash" | "installment">("cash");
  const [discount, setDiscount] = useState(0);
  const barcodeRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return PRODUCTS;
    const q = query.toLowerCase();
    return PRODUCTS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.barcode.includes(q),
    );
  }, [query]);

  const add = (p: Product) => {
    setCart((c) => {
      const ex = c.find((i) => i.product.id === p.id);
      if (ex) return c.map((i) => (i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { product: p, qty: 1 }];
    });
  };
  const setQty = (id: string, qty: number) => {
    if (qty <= 0) return setCart((c) => c.filter((i) => i.product.id !== id));
    setCart((c) => c.map((i) => (i.product.id === id ? { ...i, qty } : i)));
  };
  const remove = (id: string) => setCart((c) => c.filter((i) => i.product.id !== id));

  const priceOf = (p: Product) => (paymentType === "cash" ? p.cashPrice : p.installmentPrice);
  const subtotal = cart.reduce((s, i) => s + priceOf(i.product) * i.qty, 0);
  const total = Math.max(0, subtotal - discount);

  const onBarcode = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const code = e.currentTarget.value.trim();
    const p = PRODUCTS.find((x) => x.barcode === code || x.code.toLowerCase() === code.toLowerCase());
    if (p) {
      add(p);
      e.currentTarget.value = "";
    }
  };

  const checkout = () => {
    if (!cart.length) return;
    alert(`Sale completed!\nType: ${paymentType}\nTotal: ${fmtLKR(total)}\nItems: ${cart.reduce((s, i) => s + i.qty, 0)}`);
    setCart([]);
    setDiscount(0);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px] h-[calc(100vh-7rem)]">
      <div className="flex flex-col min-h-0 rounded-xl border bg-card overflow-hidden">
        <div className="p-4 border-b space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products by name or code…"
                className="w-full h-10 pl-9 pr-3 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="relative sm:w-64">
              <ScanBarcode className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={barcodeRef}
                onKeyDown={onBarcode}
                placeholder="Scan barcode + Enter"
                className="w-full h-10 pl-9 pr-3 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => add(p)}
                className="text-left rounded-lg border bg-background p-3 hover:border-primary hover:shadow-sm transition group"
              >
                <div className="aspect-square rounded-md bg-muted grid place-items-center mb-2 text-2xl font-semibold text-muted-foreground/60">
                  {p.name.charAt(0)}
                </div>
                <div className="text-sm font-medium line-clamp-2 leading-tight">{p.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{p.code}</div>
                <div className="mt-2 flex items-baseline justify-between">
                  <div className="text-sm font-semibold text-primary">{fmtLKR(priceOf(p))}</div>
                  <div className="text-xs text-muted-foreground">{p.warehouseQty} in stock</div>
                </div>
              </button>
            ))}
          </div>
          {!filtered.length && (
            <div className="text-center py-12 text-sm text-muted-foreground">No products match "{query}"</div>
          )}
        </div>
      </div>

      <div className="flex flex-col min-h-0 rounded-xl border bg-card overflow-hidden">
        <div className="p-4 border-b flex items-center gap-2">
          <ShoppingCart className="size-4" />
          <div className="font-medium">Cart</div>
          <div className="ml-auto text-xs text-muted-foreground">{cart.reduce((s, i) => s + i.qty, 0)} items</div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y">
          {!cart.length && <div className="p-8 text-center text-sm text-muted-foreground">Cart is empty</div>}
          {cart.map((i) => (
            <div key={i.product.id} className="p-3 flex gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{i.product.name}</div>
                <div className="text-xs text-muted-foreground">{fmtLKR(priceOf(i.product))} × {i.qty}</div>
                <div className="mt-2 inline-flex items-center rounded-md border">
                  <button onClick={() => setQty(i.product.id, i.qty - 1)} className="size-7 grid place-items-center hover:bg-accent rounded-l-md"><Minus className="size-3" /></button>
                  <div className="w-8 text-center text-sm">{i.qty}</div>
                  <button onClick={() => setQty(i.product.id, i.qty + 1)} className="size-7 grid place-items-center hover:bg-accent rounded-r-md"><Plus className="size-3" /></button>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{fmtLKR(priceOf(i.product) * i.qty)}</div>
                <button onClick={() => remove(i.product.id)} className="mt-2 text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-4 space-y-3 bg-muted/30">
          <div className="grid grid-cols-2 gap-2">
            {(["cash", "installment"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setPaymentType(t)}
                className={
                  "h-9 rounded-md border text-sm font-medium capitalize transition " +
                  (paymentType === t ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent")
                }
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Discount (Rs)</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{fmtLKR(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>− {fmtLKR(discount)}</span></div>
            <div className="flex justify-between text-base font-semibold pt-2 border-t"><span>Total</span><span>{fmtLKR(total)}</span></div>
          </div>

          <button
            onClick={checkout}
            disabled={!cart.length}
            className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete sale · {fmtLKR(total)}
          </button>
        </div>
      </div>
    </div>
  );
}
