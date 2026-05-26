import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Wallet, Users, CircleCheck as CheckCircle, Clock, MapPin, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/db";
import { StatCard } from "@/components/stat-card";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/collections")({
  component: CollectionsPage,
});

function CollectionsPage() {
  const [collectionDialog, setCollectionDialog] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);

  const { data: collectors = [] } = useQuery({
    queryKey: ["collectors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "collector")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: overduePlans = [] } = useQuery({
    queryKey: ["overdue-installments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("installment_schedule")
        .select(
          `*, installment_plans!inner(id, plan_number, monthly_payment, customers(id, name, phone, address), status)`
        )
        .eq("status", "overdue")
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: collectionRoutes = [] } = useQuery({
    queryKey: ["collection-routes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collection_routes")
        .select(`*, users(id, name)`)
        .order("route_date", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  // Calculate stats
  const totalOverdue = overduePlans.reduce((s: number, p: any) => s + p.amount_due - p.amount_paid, 0);
  const todayRoutes = collectionRoutes.filter(
    (r: any) => r.route_date === new Date().toISOString().split("T")[0]
  );
  const todayCollected = todayRoutes.reduce((s: number, r: any) => s + r.total_collected, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cash Collections</h1>
          <p className="text-sm text-muted-foreground">
            Daily collection routes, payment entry and collector performance.
          </p>
        </div>
        <Button>
          <MapPin className="size-4 mr-2" />
          Start Collection Route
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Overdue Amount"
          value={formatCurrency(totalOverdue)}
          icon={Clock}
          tone="destructive"
        />
        <StatCard
          label="Overdue Accounts"
          value={String(overduePlans.length)}
          icon={Users}
        />
        <StatCard
          label="Today Collected"
          value={formatCurrency(todayCollected)}
          icon={CheckCircle}
          tone="success"
        />
        <StatCard label="Collectors" value={String(collectors.length)} icon={Wallet} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Overdue Accounts</CardTitle>
            <CardDescription>
              Customers with overdue installments requiring collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {overduePlans.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No overdue accounts
                </p>
              ) : (
                overduePlans.map((schedule: any) => {
                  const plan = schedule.installment_plans;
                  const customer = plan?.customers;
                  const dueAmount = schedule.amount_due - schedule.amount_paid;

                  return (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between text-sm p-3 rounded bg-muted/50 hover:bg-muted cursor-pointer"
                      onClick={() => {
                        setSelectedVisit({ schedule, plan, customer });
                        setCollectionDialog(true);
                      }}
                    >
                      <div>
                        <div className="font-medium">{customer?.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {customer?.phone} · {plan?.plan_number}
                        </div>
                        <div className="text-xs text-destructive">
                          Due: {new Date(schedule.due_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-destructive">
                          {formatCurrency(dueAmount)}
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          Overdue
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Collection Routes</CardTitle>
            <CardDescription>Collection activities by staff</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {collectionRoutes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No collection routes recorded
                </p>
              ) : (
                collectionRoutes.map((route: any) => (
                  <div
                    key={route.id}
                    className="flex items-center justify-between text-sm p-3 rounded bg-muted/50"
                  >
                    <div>
                      <div className="font-medium">{route.route_name || "Daily Route"}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(route.route_date).toLocaleDateString()} · Collector:{" "}
                        {route.users?.name || "Unassigned"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(route.total_collected)}
                      </div>
                      <Badge
                        variant={
                          route.status === "completed"
                            ? "default"
                            : route.status === "in_progress"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {route.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <CollectionPaymentDialog
        open={collectionDialog}
        onClose={() => {
          setCollectionDialog(false);
          setSelectedVisit(null);
        }}
        visit={selectedVisit}
      />
    </div>
  );
}

function CollectionPaymentDialog({
  open,
  onClose,
  visit,
}: {
  open: boolean;
  onClose: () => void;
  visit: any;
}) {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  if (!visit) return null;

  const { schedule, plan, customer } = visit;
  const dueAmount = schedule.amount_due - schedule.amount_paid;

  const handlePayment = async () => {
    const paymentAmount = parseInt(amount) * 100; // Convert to cents

    if (!amount || paymentAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (paymentAmount > dueAmount) {
      toast.error("Amount cannot exceed due amount");
      return;
    }

    try {
      // Record payment
      const { error: paymentError } = await supabase.from("installment_payments").insert({
        plan_id: plan.id,
        schedule_id: schedule.id,
        amount: paymentAmount,
        payment_method: "cash",
        receipt_number: `RCP-${Date.now()}`,
        notes,
      });

      if (paymentError) throw paymentError;

      // Update schedule
      const newAmountPaid = schedule.amount_paid + paymentAmount;
      const newStatus = newAmountPaid >= schedule.amount_due ? "paid" : "pending";

      const { error: updateError } = await supabase
        .from("installment_schedule")
        .update({
          amount_paid: newAmountPaid,
          status: newStatus,
          payment_date: new Date().toISOString(),
        })
        .eq("id", schedule.id);

      if (updateError) throw updateError;

      toast.success(`Payment of ${formatCurrency(paymentAmount)} recorded`);
      setAmount("");
      setNotes("");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to record payment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Collection</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-sm space-y-2">
            <div className="font-medium text-lg">{customer?.name}</div>
            <div className="text-muted-foreground">{customer?.address}</div>
            <div className="text-muted-foreground">{customer?.phone}</div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Plan: </span>
              <span className="font-medium">{plan?.plan_number}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Due: </span>
              <span className="font-medium text-destructive">
                {formatCurrency(dueAmount)}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Payment Amount (Rs)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              max={dueAmount / 100}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAmount(String(Math.round(dueAmount / 100)))}
              >
                Full
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAmount(String(Math.round((dueAmount / 100) * 0.5)))}
              >
                Half
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handlePayment}>
            <DollarSign className="size-4 mr-1" />
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
