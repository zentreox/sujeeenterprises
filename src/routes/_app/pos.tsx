import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  getProducts,
  getWarehouseInventory,
  createCustomer,
  createSale,
  createInstallmentPlan,
  createInstallmentSchedule,
  formatCurrency,
  rupeesToCents,
} from "@/lib/db";
import { useSession } from "@/hooks/use-session";
import { ScanBarcode, Search, Trash2, Plus, Minus, ShoppingCart, Printer, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/pos")({
  component: POSPage,
});

type CartItem = {
  product: any;
  qty: number;
};

const INSTALLMENT_PERIODS = [3, 6, 9, 12, 18, 24] as const;

function POSPage() {
  const queryClient = useQueryClient();
  const user = useSession();
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentType, setPaymentType] = useState<"cash" | "installment">("cash");
  const [discount, setDiscount] = useState(0);
  const [periodMonths, setPeriodMonths] = useState<number>(6);
  const [downPayment, setDownPayment] = useState<number>(0);
  const [custName, setCustName] = useState("");
  const [custNic, setCustNic] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const barcodeRef = useRef<HTMLInputElement>(null);
  const [completedSale, setCompletedSale] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: warehouseInventory = [] } = useQuery({
    queryKey: ["warehouse-inventory-pos"],
    queryFn: () => getWarehouseInventory(),
  });

  const products = useMemo(() => {
    const inventoryMap = new Map(
      warehouseInventory.map((i: any) => [i.product_id, i.quantity])
    );

    return warehouseInventory
      .filter((i: any) => i.products && i.products.is_active !== false)
      .map((i: any) => ({
        ...i.products,
        warehouseQty: inventoryMap.get(i.product_id) || 0,
      }));
  }, [warehouseInventory]);

  const filtered = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.includes(q))
    );
  }, [query, products]);

  const add = (p: any) => {
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

  const priceOf = (p: any) =>
    paymentType === "cash" ? p.cash_price : p.installment_price;

  const subtotal = cart.reduce((s, i) => s + priceOf(i.product) * i.qty, 0);
  const discountCents = rupeesToCents(discount);
  const total = Math.max(0, subtotal - discountCents);
  const downPaymentCents = rupeesToCents(downPayment);
  const financed =
    paymentType === "installment" ? Math.max(0, total - downPaymentCents) : 0;
  const monthly =
    paymentType === "installment" && periodMonths > 0
      ? Math.round(financed / periodMonths)
      : 0;

  const onBarcode = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const code = e.currentTarget.value.trim();
    const p = products.find(
      (x) => x.barcode === code || x.code.toLowerCase() === code.toLowerCase()
    );
    if (p) {
      add(p);
      e.currentTarget.value = "";
    } else {
      toast.error("Product not found");
    }
  };

  const checkout = async () => {
    if (!cart.length || isProcessing) return;

    if (paymentType === "installment") {
      if (!custName.trim() || !custNic.trim() || !custPhone.trim() || !custAddress.trim()) {
        toast.error("Customer name, NIC, phone and address are required for installment sales.");
        return;
      }
    }

    setIsProcessing(true);

    try {
      let customerId: string | undefined;

      // Create or find customer for installment sales
      if (paymentType === "installment") {
        const { data: existingCustomer } = await supabase
          .from("customers")
          .select("id")
          .eq("nic", custNic.trim())
          .maybeSingle();

        if (existingCustomer) {
          customerId = existingCustomer.id;
        } else {
          const newCustomer = await createCustomer({
            name: custName.trim(),
            nic: custNic.trim(),
            phone: custPhone.trim(),
            address: custAddress.trim(),
            status: "active",
            credit_score: 100,
          });
          customerId = newCustomer.id;
        }
      }

      // Get warehouse ID (using first warehouse for now)
      const { data: warehouses } = await supabase
        .from("warehouses")
        .select("id")
        .limit(1);
      const warehouseId = warehouses?.[0]?.id;

      // Create sale
      const saleItems: any[] = cart.map((i) => ({
        product_id: i.product.id,
        quantity: i.qty,
        unit_price: priceOf(i.product),
        total_price: priceOf(i.product) * i.qty,
      }));

      const saleData: any = {
        sale_type: paymentType,
        customer_id: customerId,
        warehouse_id: warehouseId,
        staff_id: (user as any)?.id,
        subtotal,
        discount: discountCents,
        total,
        payment_method: "cash",
        status: "completed",
      };

      const sale = await createSale(saleData, saleItems);

      // For installment sales, create installment plan
      let installmentPlan = null;
      if (paymentType === "installment" && customerId) {
        const planNumber = `INS-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString().slice(-6)}`;

        installmentPlan = await createInstallmentPlan({
          plan_number: planNumber,
          customer_id: customerId,
          total_amount: total,
          down_payment: downPaymentCents,
          financed_amount: financed,
          interest_rate: 0,
          interest_amount: 0,
          total_payable: financed,
          monthly_payment: monthly,
          period_months: periodMonths,
          start_date: new Date().toISOString().split("T")[0],
          status: "pending",
          staff_id: (user as any)?.id,
        });

        // Create installment schedule
        await createInstallmentSchedule(
          installmentPlan.id,
          new Date().toISOString().split("T")[0],
          monthly,
          periodMonths
        );

        // Update sale with installment plan
        await supabase
          .from("sales")
          .update({ installment_plan_id: installmentPlan.id })
          .eq("id", sale.id);
      }

      // Show completed sale in dialog
      setCompletedSale({
        ...sale,
        customer: customerId
          ? { name: custName, nic: custNic, phone: custPhone, address: custAddress }
          : null,
        items: cart.map((i) => ({
          ...i.product,
          quantity: i.qty,
          unit_price: priceOf(i.product),
          total_price: priceOf(i.product) * i.qty,
        })),
        installmentPlan,
        subtotal_display: subtotal,
        discount_display: discountCents,
        total_display: total,
        down_payment_display: downPaymentCents,
        financed_display: financed,
        monthly_display: monthly,
        period_months: periodMonths,
      });
      setShowInvoice(true);

      // Reset form
      setCart([]);
      setDiscount(0);
      setDownPayment(0);
      setCustName("");
      setCustNic("");
      setCustPhone("");
      setCustAddress("");

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["warehouse-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["installment-plans"] });
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to complete sale");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
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
                  disabled={p.warehouseQty <= 0}
                  className="text-left rounded-lg border bg-background p-3 hover:border-primary hover:shadow-sm transition group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="aspect-square rounded-md bg-muted overflow-hidden mb-2">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        loading="lazy"
                        width={512}
                        height={512}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-2xl font-semibold text-muted-foreground/60">
                        {p.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-medium line-clamp-2 leading-tight">{p.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{p.code}</div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <div className="text-sm font-semibold text-primary">
                      {formatCurrency(priceOf(p))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.warehouseQty} in stock
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {!filtered.length && (
              <div className="text-center py-12 text-sm text-muted-foreground">
                No products match "{query}"
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col min-h-0 rounded-xl border bg-card overflow-hidden">
          <div className="p-4 border-b flex items-center gap-2">
            <ShoppingCart className="size-4" />
            <div className="font-medium">Cart</div>
            <div className="ml-auto text-xs text-muted-foreground">
              {cart.reduce((s, i) => s + i.qty, 0)} items
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y">
            {!cart.length && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Cart is empty
              </div>
            )}
            {cart.map((i) => (
              <div key={i.product.id} className="p-3 flex gap-3">
                {i.product.image_url && (
                  <img
                    src={i.product.image_url}
                    alt={i.product.name}
                    loading="lazy"
                    className="size-12 rounded-md object-cover border shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{i.product.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(priceOf(i.product))} × {i.qty}
                  </div>
                  <div className="mt-2 inline-flex items-center rounded-md border">
                    <button
                      onClick={() => setQty(i.product.id, i.qty - 1)}
                      className="size-7 grid place-items-center hover:bg-accent rounded-l-md"
                    >
                      <Minus className="size-3" />
                    </button>
                    <div className="w-8 text-center text-sm">{i.qty}</div>
                    <button
                      onClick={() => setQty(i.product.id, i.qty + 1)}
                      className="size-7 grid place-items-center hover:bg-accent rounded-r-md"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {formatCurrency(priceOf(i.product) * i.qty)}
                  </div>
                  <button
                    onClick={() => remove(i.product.id)}
                    className="mt-2 text-muted-foreground hover:text-destructive"
                  >
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
                    (paymentType === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-accent")
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

            {paymentType === "installment" && (
              <div className="space-y-3 rounded-md border bg-background p-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Customer name</label>
                  <input
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="Full name"
                    className="w-full h-9 px-3 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">NIC</label>
                  <input
                    value={custNic}
                    onChange={(e) => setCustNic(e.target.value)}
                    placeholder="200012345678"
                    className="w-full h-9 px-3 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">Phone</label>
                    <input
                      value={custPhone}
                      onChange={(e) => setCustPhone(e.target.value)}
                      placeholder="07XXXXXXXX"
                      className="w-full h-9 px-3 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">City</label>
                    <input
                      value={custAddress}
                      onChange={(e) => setCustAddress(e.target.value)}
                      placeholder="City"
                      className="w-full h-9 px-3 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Installment period</label>
                  <div className="grid grid-cols-6 gap-1">
                    {INSTALLMENT_PERIODS.map((m) => (
                      <button
                        key={m}
                        onClick={() => setPeriodMonths(m)}
                        className={
                          "h-8 rounded-md border text-xs font-medium transition " +
                          (periodMonths === m
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-accent")
                        }
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Down payment (Rs)</label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) =>
                      setDownPayment(
                        Math.max(0, Math.min(total / 100, Number(e.target.value) || 0))
                      )
                    }
                    className="w-full h-9 px-3 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="flex gap-1 pt-1">
                    {[10, 20, 30, 50].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setDownPayment(Math.round((total / 100) * pct) / 100)}
                        className="flex-1 h-7 rounded border text-xs hover:bg-accent"
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Monthly</span>
                  <span className="font-semibold text-primary">
                    {formatCurrency(monthly)} × {periodMonths}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Linked to staff:{" "}
                  <span className="font-medium text-foreground">{user?.name ?? "—"}</span>
                </div>
              </div>
            )}

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>− {formatCurrency(discountCents)}</span>
              </div>
              {paymentType === "installment" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Down payment</span>
                  <span>− {formatCurrency(downPaymentCents)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold pt-2 border-t">
                <span>{paymentType === "installment" ? "To finance" : "Total"}</span>
                <span>{formatCurrency(paymentType === "installment" ? financed : total)}</span>
              </div>
            </div>

            <button
              onClick={checkout}
              disabled={!cart.length || isProcessing}
              className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing..." : `Complete sale · ${formatCurrency(total)}`}
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Dialog */}
      <InvoiceDialog
        open={showInvoice}
        onClose={() => setShowInvoice(false)}
        sale={completedSale}
        paymentType={paymentType}
      />
    </>
  );
}

function InvoiceDialog({
  open,
  onClose,
  sale,
  paymentType,
}: {
  open: boolean;
  onClose: () => void;
  sale: any;
  paymentType: "cash" | "installment";
}) {
  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="size-5 text-green-600" />
            Sale Completed
          </DialogTitle>
        </DialogHeader>

        <div className="print:shadow-none" id="invoice-content">
          {/* Invoice Header */}
          <div className="border rounded-lg p-6 bg-white print:border-none">
            <div className="flex justify-between items-start border-b pb-4 mb-4">
              <div>
                <h2 className="text-xl font-bold">SUJEE ENTERPRISES</h2>
                <p className="text-sm text-muted-foreground">Head Office, Sri Lanka</p>
                <p className="text-sm text-muted-foreground">Tel: +94 11 234 5678</p>
              </div>
              <div className="text-right">
                <Badge variant="default" className="mb-2">
                  {paymentType === "cash" ? "CASH SALE" : "INSTALLMENT SALE"}
                </Badge>
                <div className="text-sm text-muted-foreground">Invoice</div>
                <div className="font-bold text-lg">{sale.invoice_number}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(sale.sale_date).toLocaleDateString("en-LK", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* Customer Info */}
            {sale.customer && (
              <div className="mb-4 p-3 bg-muted/50 rounded">
                <div className="text-xs text-muted-foreground mb-1">CUSTOMER</div>
                <div className="font-semibold">{sale.customer.name}</div>
                <div className="text-sm text-muted-foreground">NIC: {sale.customer.nic}</div>
                <div className="text-sm text-muted-foreground">Phone: {sale.customer.phone}</div>
                {sale.customer.address && (
                  <div className="text-sm text-muted-foreground">
                    Address: {sale.customer.address}
                  </div>
                )}
              </div>
            )}

            {/* Items Table */}
            <table className="w-full text-sm mb-4">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left py-2 px-2 font-medium">Item</th>
                  <th className="text-center py-2 px-2 font-medium">Code</th>
                  <th className="text-center py-2 px-2 font-medium">Qty</th>
                  <th className="text-right py-2 px-2 font-medium">Unit Price</th>
                  <th className="text-right py-2 px-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items?.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2 px-2">{item.name}</td>
                    <td className="py-2 px-2 text-center text-muted-foreground">
                      {item.code}
                    </td>
                    <td className="py-2 px-2 text-center">{item.quantity}</td>
                    <td className="py-2 px-2 text-right">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="py-2 px-2 text-right font-medium">
                      {formatCurrency(item.total_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="space-y-1 border-t pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(sale.subtotal_display)}</span>
              </div>
              {sale.discount_display > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount</span>
                  <span>- {formatCurrency(sale.discount_display)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>{formatCurrency(sale.total_display)}</span>
              </div>

              {/* Installment Details */}
              {paymentType === "installment" && sale.installmentPlan && (
                <>
                  <div className="border-t mt-3 pt-3">
                    <div className="text-sm font-semibold mb-2">Installment Details</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Plan Number:</span>
                        <span className="ml-2 font-medium">
                          {sale.installmentPlan.plan_number}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Period:</span>
                        <span className="ml-2 font-medium">{sale.period_months} months</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Down Payment:</span>
                        <span className="ml-2 font-medium">
                          {formatCurrency(sale.down_payment_display)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Financed:</span>
                        <span className="ml-2 font-medium">
                          {formatCurrency(sale.financed_display)}
                        </span>
                      </div>
                      <div className="col-span-2 font-semibold text-primary">
                        <span className="text-muted-foreground">Monthly Payment:</span>
                        <span className="ml-2 text-lg">{formatCurrency(sale.monthly_display)}</span>
                        <span className="text-muted-foreground ml-1">× {sale.period_months}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <strong>Note:</strong> First payment due on{" "}
                    {new Date(
                      new Date(sale.sale_date).setMonth(new Date(sale.sale_date).getMonth() + 1)
                    ).toLocaleDateString("en-LK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t text-center text-xs text-muted-foreground">
              <p>Thank you for your business!</p>
              <p className="mt-1">Terms: Goods sold are not returnable. Warranty claims subject to manufacturer terms.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            <X className="size-4 mr-2" />
            Close
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="size-4 mr-2" />
            Print Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
