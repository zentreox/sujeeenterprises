import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Plus, Users, Phone, MapPin, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/db";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const [q, setQ] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [addOpen, setAddOpen] = useState(false);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers", q],
    queryFn: async () => {
      let query = supabase.from("customers").select("*").order("name");

      if (q) {
        query = query.or(`name.ilike.%${q}%,nic.ilike.%${q}%,phone.ilike.%${q}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: installmentPlans = [] } = useQuery({
    queryKey: ["customer-installments", selectedCustomer?.id],
    enabled: !!selectedCustomer,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("installment_plans")
        .select(`*`)
        .eq("customer_id", selectedCustomer.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Calculate stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c: any) => c.status === "active").length;
  const blacklisted = customers.filter((c: any) => c.status === "blacklisted").length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">
            Customers with installment orders, linked to staff.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="size-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatCard label="Total Customers" value={String(totalCustomers)} icon={Users} />
        <StatCard label="Active" value={String(activeCustomers)} icon={CreditCard} tone="success" />
        <StatCard label="Blacklisted" value={String(blacklisted)} icon={CreditCard} tone="destructive" />
      </div>

      <div className="relative max-w-md">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, NIC or phone..."
          className="w-full h-10 pl-9 pr-3 rounded-md border bg-card text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {!customers.length ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Users className="size-10 mx-auto text-muted-foreground/50" />
          <div className="mt-3 font-medium">No customers yet</div>
          <p className="text-sm text-muted-foreground mt-1">
            Add customers directly or complete an installment sale from POS.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <div className="rounded-xl border bg-card overflow-hidden divide-y max-h-[calc(100vh-16rem)] overflow-y-auto">
            {customers.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setSelectedCustomer(c)}
                className={
                  "w-full text-left p-4 hover:bg-muted/50 transition " +
                  (selectedCustomer?.id === c.id ? "bg-muted/60" : "")
                }
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{c.name}</span>
                  <Badge
                    variant={
                      c.status === "active"
                        ? "default"
                        : c.status === "blacklisted"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {c.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <Phone className="size-3" />
                    {c.phone}
                  </div>
                  {c.nic && <div>NIC: {c.nic}</div>}
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-xl border bg-card p-4">
            {!selectedCustomer ? (
              <div className="text-sm text-muted-foreground text-center py-12">
                Select a customer to view details.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-semibold">{selectedCustomer.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                      <Phone className="size-3" />
                      {selectedCustomer.phone}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="size-3" />
                      {selectedCustomer.address}
                    </div>
                    {selectedCustomer.nic && (
                      <div className="text-xs text-muted-foreground mt-1">
                        NIC: {selectedCustomer.nic}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge variant={selectedCustomer.status === "active" ? "default" : "destructive"}>
                      {selectedCustomer.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      Credit Score: {selectedCustomer.credit_score}
                    </div>
                  </div>
                </div>

                {selectedCustomer.guarantor_name && (
                  <div className="text-sm p-3 rounded bg-muted/50">
                    <div className="font-medium">Guarantor</div>
                    <div className="text-muted-foreground">{selectedCustomer.guarantor_name}</div>
                    {selectedCustomer.guarantor_phone && (
                      <div className="text-xs text-muted-foreground">
                        {selectedCustomer.guarantor_phone}
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="font-medium mb-3">Installment Plans</div>
                  {installmentPlans.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No installment plans
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {installmentPlans.map((plan: any) => (
                        <div key={plan.id} className="rounded-lg border p-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <div className="font-medium text-sm">{plan.plan_number}</div>
                              <div className="text-xs text-muted-foreground">
                                Started: {new Date(plan.start_date).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold">
                                {formatCurrency(plan.financed_amount)}
                              </div>
                              <Badge
                                variant={
                                  plan.status === "paid"
                                    ? "default"
                                    : plan.status === "overdue"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {plan.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-2 text-xs flex flex-wrap gap-x-4 gap-y-1 pt-2 border-t">
                            <span>Total: {formatCurrency(plan.total_payable)}</span>
                            <span>Monthly: {formatCurrency(plan.monthly_payment)}</span>
                            <span>Period: {plan.period_months}m</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <AddCustomerDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function AddCustomerDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    nic: "",
    phone: "",
    phone2: "",
    address: "",
    city: "",
    guarantor_name: "",
    guarantor_phone: "",
    guarantor_nic: "",
  });

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.address) {
      toast.error("Name, phone and address are required");
      return;
    }

    const { error } = await supabase.from("customers").insert({
      name: form.name,
      nic: form.nic || null,
      phone: form.phone,
      phone2: form.phone2 || null,
      address: form.address,
      city: form.city || null,
      guarantor_name: form.guarantor_name || null,
      guarantor_phone: form.guarantor_phone || null,
      guarantor_nic: form.guarantor_nic || null,
      status: "active",
      credit_score: 100,
    });

    if (error) {
      toast.error("Failed to add customer");
      return;
    }

    toast.success("Customer added successfully");
    setForm({
      name: "",
      nic: "",
      phone: "",
      phone2: "",
      address: "",
      city: "",
      guarantor_name: "",
      guarantor_phone: "",
      guarantor_nic: "",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <div className="space-y-1.5">
            <Label>Full Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Customer name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>NIC Number</Label>
            <Input
              value={form.nic}
              onChange={(e) => setForm((f) => ({ ...f, nic: e.target.value }))}
              placeholder="National ID"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Phone *</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="07XXXXXXXX"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone 2</Label>
              <Input
                value={form.phone2}
                onChange={(e) => setForm((f) => ({ ...f, phone2: e.target.value }))}
                placeholder="Alternate"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Address *</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Full address"
            />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="City"
            />
          </div>
          <div className="border-t pt-3 mt-3">
            <div className="text-sm font-medium mb-3">Guarantor (Optional)</div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Guarantor Name</Label>
                <Input
                  value={form.guarantor_name}
                  onChange={(e) => setForm((f) => ({ ...f, guarantor_name: e.target.value }))}
                  placeholder="Guarantor name"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Guarantor Phone</Label>
                  <Input
                    value={form.guarantor_phone}
                    onChange={(e) => setForm((f) => ({ ...f, guarantor_phone: e.target.value }))}
                    placeholder="Phone"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Guarantor NIC</Label>
                  <Input
                    value={form.guarantor_nic}
                    onChange={(e) => setForm((f) => ({ ...f, guarantor_nic: e.target.value }))}
                    placeholder="NIC"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Customer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
