import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Boxes, Package2, Warehouse, ArrowRightLeft, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/db";
import { StatCard } from "@/components/stat-card";
import { useState } from "react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_app/inventory")({
  component: InventoryPage,
});

function InventoryPage() {
  const [transferOpen, setTransferOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("warehouses").select("*").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["warehouse-inventory", warehouses[0]?.id],
    enabled: warehouses.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_warehouse")
        .select(
          `*, products(id, name, code, barcode, cost_price, cash_price, installment_price, low_stock_threshold), warehouses(id, name, code)`
        )
        .eq("warehouse_id", warehouses[0]?.id);
      if (error) throw error;
      return data;
    },
  });

  const { data: lorries = [] } = useQuery({
    queryKey: ["lorries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lorries").select("*").eq("status", "active");
      if (error) throw error;
      return data;
    },
  });

  // Calculate stats
  const totalSKU = inventory.length;
  const totalUnits = inventory.reduce((s: number, i: any) => s + i.quantity, 0);
  const stockValue = inventory.reduce(
    (s: number, i: any) => s + i.quantity * (i.products?.cost_price || 0),
    0
  );
  const lowStockItems = inventory.filter(
    (i: any) => i.quantity <= (i.products?.low_stock_threshold || 10)
  );

  const handleTransferClick = (item: any) => {
    setSelectedProduct(item);
    setTransferOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Warehouse stock levels and reorder alerts.
          </p>
        </div>
        <Button>
          <Plus className="size-4 mr-2" />
          Stock movement
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total SKUs" value={String(totalSKU)} icon={Package2} />
        <StatCard
          label="Units in Warehouse"
          value={totalUnits.toLocaleString()}
          icon={Warehouse}
        />
        <StatCard
          label="Stock Value (cost)"
          value={formatCurrency(stockValue)}
          icon={Boxes}
          tone="success"
        />
        <StatCard
          label="Low Stock"
          value={String(lowStockItems.length)}
          icon={AlertTriangle}
          tone="destructive"
        />
      </div>

      {lowStockItems.length > 0 && (
        <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="size-5 text-destructive" />
            <span className="font-medium">Low Stock Alerts</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {lowStockItems.map((item: any) => (
              <div
                key={item.id}
                className="text-sm p-2 rounded bg-background border border-destructive/20"
              >
                <div className="font-medium">{item.products?.name}</div>
                <div className="text-xs text-muted-foreground">
                  {item.quantity} / {item.products?.low_stock_threshold} units
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b">
          <div className="font-medium">Warehouse stock</div>
          <div className="text-xs text-muted-foreground">
            {warehouses[0]?.name || "Main Warehouse"} - All products with current levels
          </div>
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
                <th className="text-left font-medium px-4 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading inventory...
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted-foreground">
                    No inventory records found
                  </td>
                </tr>
              ) : (
                inventory.map((item: any) => {
                  const low = item.quantity <= (item.products?.low_stock_threshold || 10);
                  return (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-2.5 font-medium">{item.products?.name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {item.products?.code}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">—</td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">
                        {formatCurrency(item.products?.cost_price || 0)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium">{item.quantity}</td>
                      <td className="px-4 py-2.5 text-right">
                        {formatCurrency(item.quantity * (item.products?.cost_price || 0))}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                            (low
                              ? "bg-destructive/10 text-destructive"
                              : "bg-success/15 text-success")
                          }
                        >
                          {low ? "Low" : "OK"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTransferClick(item)}
                        >
                          <ArrowRightLeft className="size-4 mr-1" />
                          Transfer
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TransferDialog
        open={transferOpen}
        onClose={() => {
          setTransferOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        lorries={lorries}
      />
    </div>
  );
}

function TransferDialog({
  open,
  onClose,
  product,
  lorries,
}: {
  open: boolean;
  onClose: () => void;
  product: any;
  lorries: any[];
}) {
  const [quantity, setQuantity] = useState("");
  const [lorryId, setLorryId] = useState("");

  const handleTransfer = async () => {
    if (!product || !quantity || !lorryId) {
      toast.error("Please fill all fields");
      return;
    }

    const qty = parseInt(quantity);
    if (qty <= 0 || qty > product.quantity) {
      toast.error("Invalid quantity");
      return;
    }

    try {
      // Deduct from warehouse
      await supabase
        .from("inventory_warehouse")
        .update({ quantity: product.quantity - qty })
        .eq("id", product.id);

      // Add to lorry (upsert)
      const { data: existingLorryInv } = await supabase
        .from("inventory_lorry")
        .select("quantity")
        .eq("lorry_id", lorryId)
        .eq("product_id", product.product_id)
        .maybeSingle();

      if (existingLorryInv) {
        await supabase
          .from("inventory_lorry")
          .update({ quantity: existingLorryInv.quantity + qty })
          .eq("lorry_id", lorryId)
          .eq("product_id", product.product_id);
      } else {
        await supabase.from("inventory_lorry").insert({
          lorry_id: lorryId,
          product_id: product.product_id,
          quantity: qty,
        });
      }

      // Record transactions
      await supabase.from("inventory_transactions").insert([
        {
          product_id: product.product_id,
          warehouse_id: product.warehouse_id,
          txn_type: "transfer_out",
          quantity: -qty,
          previous_quantity: product.quantity,
          new_quantity: product.quantity - qty,
          notes: "Transfer to lorry",
        },
        {
          product_id: product.product_id,
          lorry_id: lorryId,
          txn_type: "transfer_in",
          quantity: qty,
          previous_quantity: existingLorryInv?.quantity || 0,
          new_quantity: (existingLorryInv?.quantity || 0) + qty,
          notes: "Transfer from warehouse",
        },
      ]);

      toast.success(`Transferred ${qty} units to lorry`);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Transfer failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer to Lorry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-sm text-muted-foreground">
            Product: <span className="font-medium text-foreground">{product?.products?.name}</span>
            <br />
            Available: <span className="font-medium text-foreground">{product?.quantity} units</span>
          </div>
          <div className="space-y-2">
            <Label>Select Lorry</Label>
            <Select value={lorryId} onValueChange={setLorryId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a lorry" />
              </SelectTrigger>
              <SelectContent>
                {lorries.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.code} - {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              max={product?.quantity}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleTransfer}>Transfer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
