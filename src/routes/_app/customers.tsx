import { createFileRoute } from "@tanstack/react-router";
import { useInstallments } from "@/lib/store";
import { fmtLKR } from "@/lib/mock-data";
import { useMemo, useState } from "react";
import { Users } from "lucide-react";

export const Route = createFileRoute("/_app/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const orders = useInstallments();
  const [selected, setSelected] = useState<string | null>(null);

  const customers = useMemo(() => {
    const map = new Map<string, { nic: string; name: string; phone: string; orders: typeof orders; totalFinanced: number }>();
    for (const o of orders) {
      const ex = map.get(o.customer.nic) ?? {
        nic: o.customer.nic,
        name: o.customer.name,
        phone: o.customer.phone,
        orders: [] as typeof orders,
        totalFinanced: 0,
      };
      ex.orders.push(o);
      ex.totalFinanced += o.financed;
      map.set(o.customer.nic, ex);
    }
    return Array.from(map.values());
  }, [orders]);

  const active = customers.find((c) => c.nic === selected);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">Customers with installment orders, linked to staff.</p>
      </div>

      {!customers.length ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Users className="size-10 mx-auto text-muted-foreground/50" />
          <div className="mt-3 font-medium">No customers yet</div>
          <p className="text-sm text-muted-foreground mt-1">
            Complete an installment sale from POS to register a customer.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <div className="rounded-xl border bg-card overflow-hidden divide-y">
            {customers.map((c) => (
              <button
                key={c.nic}
                onClick={() => setSelected(c.nic)}
                className={
                  "w-full text-left p-4 hover:bg-muted/50 transition " +
                  (selected === c.nic ? "bg-muted/60" : "")
                }
              >
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">NIC {c.nic} · {c.phone}</div>
                <div className="mt-1 text-xs">
                  <span className="text-muted-foreground">{c.orders.length} order(s) · </span>
                  <span className="font-medium text-primary">{fmtLKR(c.totalFinanced)} financed</span>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-xl border bg-card p-4">
            {!active ? (
              <div className="text-sm text-muted-foreground text-center py-12">Select a customer to view orders.</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="text-lg font-semibold">{active.name}</div>
                  <div className="text-xs text-muted-foreground">NIC {active.nic} · {active.phone}</div>
                </div>
                <div className="space-y-3">
                  {active.orders.map((o) => (
                    <div key={o.id} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <div className="font-medium text-sm">{o.id}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(o.date).toLocaleString("en-LK")} · by {o.staff.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{fmtLKR(o.financed)}</div>
                          <div className="text-xs text-muted-foreground">
                            {fmtLKR(o.monthly)} × {o.periodMonths}m
                          </div>
                        </div>
                      </div>
                      <ul className="mt-2 text-xs text-muted-foreground space-y-0.5">
                        {o.items.map((i) => (
                          <li key={i.productId}>
                            {i.qty} × {i.name} — {fmtLKR(i.price * i.qty)}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2 text-xs flex flex-wrap gap-x-4 gap-y-1 pt-2 border-t">
                        <span>Total: <b>{fmtLKR(o.total)}</b></span>
                        <span>Down: <b>{fmtLKR(o.downPayment)}</b></span>
                        <span>Discount: <b>{fmtLKR(o.discount)}</b></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
