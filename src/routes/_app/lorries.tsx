import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Truck, Fuel, MapPin, DollarSign, Users, Package } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/db";
import { StatCard } from "@/components/stat-card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/lorries")({
  component: LorriesPage,
});

function LorriesPage() {
  const [selectedLorry, setSelectedLorry] = useState<any>(null);
  const [expenseDialog, setExpenseDialog] = useState(false);

  const { data: lorries = [], isLoading } = useQuery({
    queryKey: ["lorries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lorries").select("*").order("code");
      if (error) throw error;
      return data;
    },
  });

  const { data: lorryInventory = [] } = useQuery({
    queryKey: ["lorry-inventory", selectedLorry?.id],
    enabled: !!selectedLorry,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_lorry")
        .select(`*, products(id, name, code, cash_price, installment_price)`)
        .eq("lorry_id", selectedLorry.id);
      if (error) throw error;
      return data;
    },
  });

  const { data: lorryExpenses = [] } = useQuery({
    queryKey: ["lorry-expenses", selectedLorry?.id],
    enabled: !!selectedLorry,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lorry_expenses")
        .select("*")
        .eq("lorry_id", selectedLorry.id)
        .order("expense_date", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const { data: lorrySales = [] } = useQuery({
    queryKey: ["lorry-sales", selectedLorry?.id],
    enabled: !!selectedLorry,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .eq("lorry_id", selectedLorry.id)
        .order("sale_date", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  // Calculate stats for selected lorry
  const totalInventory = lorryInventory.reduce((s: number, i: any) => s + i.quantity, 0);
  const totalSalesToday = lorrySales
    .filter((s: any) => new Date(s.sale_date).toDateString() === new Date().toDateString())
    .reduce((s: number, sale: any) => s + sale.total, 0);
  const fuelExpenses = lorryExpenses
    .filter((e: any) => e.expense_type === "fuel")
    .reduce((s: number, e: any) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lorry Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage 12 lorries, drivers, routes, stock transfers and daily collections.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {lorries.map((lorry: any) => (
          <Card
            key={lorry.id}
            className={`cursor-pointer transition-colors ${
              selectedLorry?.id === lorry.id ? "border-primary" : "hover:border-primary/50"
            }`}
            onClick={() => setSelectedLorry(lorry)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="size-5 text-primary" />
                  <CardTitle className="text-lg">{lorry.code}</CardTitle>
                </div>
                <Badge
                  variant={lorry.status === "active" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {lorry.status}
                </Badge>
              </div>
              <CardDescription>{lorry.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="size-4" />
                <span>{lorry.driver_name || "Unassigned"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" />
                <span>{lorry.current_location || "Location unknown"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-mono text-xs">{lorry.plate_number}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedLorry && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{selectedLorry.name} Details</h2>
            <Button onClick={() => setExpenseDialog(true)}>
              <Fuel className="size-4 mr-2" />
              Add Expense
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Inventory"
              value={`${totalInventory} units`}
              icon={Package}
            />
            <StatCard
              label="Today's Sales"
              value={formatCurrency(totalSalesToday)}
              icon={DollarSign}
              tone="success"
            />
            <StatCard
              label="Fuel Expenses"
              value={formatCurrency(fuelExpenses)}
              icon={Fuel}
              tone="warning"
            />
            <StatCard
              label="Products"
              value={`${lorryInventory.length} SKUs`}
              icon={Package}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Current Inventory</CardTitle>
                <CardDescription>Products loaded on this lorry</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {lorryInventory.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No inventory assigned
                    </p>
                  ) : (
                    lorryInventory.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                      >
                        <div>
                          <div className="font-medium">{item.products?.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.products?.code}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{item.quantity} units</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Expenses</CardTitle>
                <CardDescription>Fuel, maintenance, and other costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {lorryExpenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No expenses recorded
                    </p>
                  ) : (
                    lorryExpenses.map((expense: any) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                      >
                        <div>
                          <div className="font-medium capitalize">{expense.expense_type}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(expense.expense_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="font-medium">{formatCurrency(expense.amount)}</div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Sales</CardTitle>
              <CardDescription>Latest transactions from this lorry</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {lorrySales.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No sales recorded</p>
                ) : (
                  lorrySales.map((sale: any) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                    >
                      <div>
                        <div className="font-medium">{sale.invoice_number}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(sale.sale_date).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(sale.total)}</div>
                        <Badge variant={sale.sale_type === "cash" ? "default" : "secondary"}>
                          {sale.sale_type}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ExpenseDialog
        open={expenseDialog}
        onClose={() => setExpenseDialog(false)}
        lorryId={selectedLorry?.id}
      />
    </div>
  );
}

function ExpenseDialog({
  open,
  onClose,
  lorryId,
}: {
  open: boolean;
  onClose: () => void;
  lorryId?: string;
}) {
  const [form, setForm] = useState({
    expense_type: "fuel",
    amount: "",
    description: "",
  });

  const handleSubmit = async () => {
    if (!lorryId || !form.amount) {
      toast.error("Please fill all required fields");
      return;
    }

    const { error } = await supabase.from("lorry_expenses").insert({
      lorry_id: lorryId,
      expense_type: form.expense_type,
      amount: Math.round(parseFloat(form.amount) * 100), // Convert to cents
      description: form.description,
      expense_date: new Date().toISOString().split("T")[0],
    });

    if (error) {
      toast.error("Failed to record expense");
      return;
    }

    toast.success("Expense recorded");
    setForm({ expense_type: "fuel", amount: "", description: "" });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Lorry Expense</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Expense Type</Label>
            <select
              value={form.expense_type}
              onChange={(e) => setForm((f) => ({ ...f, expense_type: e.target.value }))}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm"
            >
              <option value="fuel">Fuel</option>
              <option value="maintenance">Maintenance</option>
              <option value="repair">Repair</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Amount (Rs)</Label>
            <Input
              type="number"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="Enter amount"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Record Expense</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
