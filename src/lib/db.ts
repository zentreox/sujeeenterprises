import { supabase } from "./supabase";
import type { Database } from "./supabase";
import { toast } from "sonner";

type TablesRow = Database["public"]["Tables"];
type SaleRow = TablesRow["sales"]["Row"];
type SaleItemRow = TablesRow["sale_items"]["Row"];
type ProductRow = TablesRow["products"]["Row"];
type CustomerRow = TablesRow["customers"]["Row"];
type InstallmentPlanRow = TablesRow["installment_plans"]["Row"];
type InventoryWarehouseRow = TablesRow["inventory_warehouse"]["Row"];
type InventoryLorryRow = TablesRow["inventory_lorry"]["Row"];

// Currency conversion helpers
export const rupeesToCents = (rupees: number): number => Math.round(rupees * 100);
export const centsToRupees = (cents: number): number => cents / 100;
export const formatCurrency = (cents: number): string => {
  return "Rs " + centsToRupees(cents).toLocaleString("en-LK");
};

// ============================================
// PRODUCTS
// ============================================

export async function getProducts(options?: {
  category?: string;
  search?: string;
  includeInactive?: boolean;
}) {
  let query = supabase
    .from("products")
    .select("*, categories(name), brands(name)")
    .order("name", { ascending: true });

  if (!options?.includeInactive) {
    query = query.eq("is_active", true);
  }

  if (options?.category) {
    query = query.eq("category_id", options.category);
  }

  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,code.ilike.%${options.search}%,barcode.eq.${options.search}`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching products:", error);
    toast.error("Failed to load products");
    return [];
  }
  return data;
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name), brands(name)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }
  return data;
}

export async function getProductByBarcode(barcode: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name), brands(name)")
    .eq("barcode", barcode)
    .maybeSingle();

  if (error) {
    console.error("Error fetching product by barcode:", error);
    return null;
  }
  return data;
}

export async function createProduct(product: TablesRow["products"]["Insert"]) {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();

  if (error) {
    console.error("Error creating product:", error);
    toast.error("Failed to create product");
    throw error;
  }
  toast.success("Product created successfully");
  return data;
}

export async function updateProduct(id: string, updates: TablesRow["products"]["Update"]) {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating product:", error);
    toast.error("Failed to update product");
    throw error;
  }
  toast.success("Product updated successfully");
  return data;
}

// ============================================
// CATEGORIES
// ============================================

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  return data;
}

export async function createCategory(category: TablesRow["categories"]["Insert"]) {
  const { data, error } = await supabase
    .from("categories")
    .insert(category)
    .select()
    .single();

  if (error) {
    console.error("Error creating category:", error);
    toast.error("Failed to create category");
    throw error;
  }
  toast.success("Category created");
  return data;
}

// ============================================
// BRANDS
// ============================================

export async function getBrands() {
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
  return data;
}

export async function createBrand(brand: TablesRow["brands"]["Insert"]) {
  const { data, error } = await supabase
    .from("brands")
    .insert(brand)
    .select()
    .single();

  if (error) {
    console.error("Error creating brand:", error);
    toast.error("Failed to create brand");
    throw error;
  }
  toast.success("Brand created");
  return data;
}

// ============================================
// WAREHOUSE INVENTORY
// ============================================

export async function getWarehouseInventory(warehouseId?: string) {
  let query = supabase
    .from("inventory_warehouse")
    .select(`
      *,
      products(id, name, code, barcode, cost_price, cash_price, installment_price),
      warehouses(id, name, code)
    `);

  if (warehouseId) {
    query = query.eq("warehouse_id", warehouseId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching warehouse inventory:", error);
    toast.error("Failed to load inventory");
    return [];
  }
  return data;
}

export async function updateWarehouseInventory(
  productId: string,
  warehouseId: string,
  quantityChange: number,
  txnType: TablesRow["inventory_transactions"]["Row"]["txn_type"],
  referenceId?: string,
  notes?: string
) {
  // Get current quantity
  const { data: current, error: getError } = await supabase
    .from("inventory_warehouse")
    .select("quantity")
    .eq("product_id", productId)
    .eq("warehouse_id", warehouseId)
    .maybeSingle();

  if (getError) throw getError;

  const previousQty = current?.quantity || 0;
  const newQty = Math.max(0, previousQty + quantityChange);

  // Upsert inventory
  const { error: upsertError } = await supabase
    .from("inventory_warehouse")
    .upsert(
      {
        product_id: productId,
        warehouse_id: warehouseId,
        quantity: newQty,
      },
      { onConflict: "warehouse_id,product_id" }
    );

  if (upsertError) throw upsertError;

  // Create transaction record
  const { error: txnError } = await supabase
    .from("inventory_transactions")
    .insert({
      product_id: productId,
      warehouse_id: warehouseId,
      txn_type: txnType,
      quantity: quantityChange,
      previous_quantity: previousQty,
      new_quantity: newQty,
      reference_id: referenceId,
      notes,
    });

  if (txnError) throw txnError;

  return newQty;
}

// ============================================
// LORRIES
// ============================================

export async function getLorries() {
  const { data, error } = await supabase
    .from("lorries")
    .select("*")
    .order("code", { ascending: true });

  if (error) {
    console.error("Error fetching lorries:", error);
    return [];
  }
  return data;
}

export async function getLorryById(id: string) {
  const { data, error } = await supabase
    .from("lorries")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching lorry:", error);
    return null;
  }
  return data;
}

export async function getLorryInventory(lorryId: string) {
  const { data, error } = await supabase
    .from("inventory_lorry")
    .select(`
      *,
      products(id, name, code, barcode, cost_price, cash_price, installment_price)
    `)
    .eq("lorry_id", lorryId);

  if (error) {
    console.error("Error fetching lorry inventory:", error);
    return [];
  }
  return data;
}

export async function updateLorryInventory(
  productId: string,
  lorryId: string,
  quantityChange: number,
  txnType: TablesRow["inventory_transactions"]["Row"]["txn_type"],
  referenceId?: string,
  notes?: string
) {
  // Get current quantity
  const { data: current, error: getError } = await supabase
    .from("inventory_lorry")
    .select("quantity")
    .eq("product_id", productId)
    .eq("lorry_id", lorryId)
    .maybeSingle();

  if (getError) throw getError;

  const previousQty = current?.quantity || 0;
  const newQty = Math.max(0, previousQty + quantityChange);

  // Upsert inventory
  const { error: upsertError } = await supabase
    .from("inventory_lorry")
    .upsert(
      {
        product_id: productId,
        lorry_id: lorryId,
        quantity: newQty,
      },
      { onConflict: "lorry_id,product_id" }
    );

  if (upsertError) throw upsertError;

  // Create transaction record
  const { error: txnError } = await supabase
    .from("inventory_transactions")
    .insert({
      product_id: productId,
      lorry_id: lorryId,
      txn_type: txnType,
      quantity: quantityChange,
      previous_quantity: previousQty,
      new_quantity: newQty,
      reference_id: referenceId,
      notes,
    });

  if (txnError) throw txnError;

  return newQty;
}

// ============================================
// CUSTOMERS
// ============================================

export async function getCustomers(options?: { search?: string }) {
  let query = supabase
    .from("customers")
    .select("*")
    .order("name", { ascending: true });

  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,nic.ilike.%${options.search}%,phone.ilike.%${options.search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching customers:", error);
    toast.error("Failed to load customers");
    return [];
  }
  return data;
}

export async function getCustomerById(id: string) {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching customer:", error);
    return null;
  }
  return data;
}

export async function createCustomer(customer: TablesRow["customers"]["Insert"]) {
  const { data, error } = await supabase
    .from("customers")
    .insert(customer)
    .select()
    .single();

  if (error) {
    console.error("Error creating customer:", error);
    toast.error("Failed to create customer");
    throw error;
  }
  toast.success("Customer created");
  return data;
}

export async function updateCustomer(id: string, updates: TablesRow["customers"]["Update"]) {
  const { data, error } = await supabase
    .from("customers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating customer:", error);
    toast.error("Failed to update customer");
    throw error;
  }
  toast.success("Customer updated");
  return data;
}

// ============================================
// INSTALLMENTS
// ============================================

export async function getInstallmentPlans(options?: { customerId?: string; status?: string }) {
  let query = supabase
    .from("installment_plans")
    .select(`
      *,
      customers(id, name, nic, phone, address),
      users(id, name),
      lorries(id, code, name)
    `)
    .order("created_at", { ascending: false });

  if (options?.customerId) {
    query = query.eq("customer_id", options.customerId);
  }
  if (options?.status) {
    query = query.eq("status", options.status);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching installment plans:", error);
    toast.error("Failed to load installment plans");
    return [];
  }
  return data;
}

export async function getInstallmentPlanById(id: string) {
  const { data, error } = await supabase
    .from("installment_plans")
    .select(`
      *,
      customers(*),
      users(id, name),
      lorries(id, code, name),
      installment_schedule(*)
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching installment plan:", error);
    return null;
  }
  return data;
}

export async function createInstallmentPlan(plan: TablesRow["installment_plans"]["Insert"]) {
  const { data, error } = await supabase
    .from("installment_plans")
    .insert(plan)
    .select()
    .single();

  if (error) {
    console.error("Error creating installment plan:", error);
    toast.error("Failed to create installment plan");
    throw error;
  }
  return data;
}

export async function createInstallmentSchedule(
  planId: string,
  startDate: string,
  monthlyPayment: number,
  periodMonths: number
) {
  const schedule = Array.from({ length: periodMonths }, (_, i) => {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i + 1);
    return {
      plan_id: planId,
      installment_number: i + 1,
      due_date: dueDate.toISOString().split("T")[0],
      amount_due: monthlyPayment,
      status: "pending" as const,
    };
  });

  const { error } = await supabase
    .from("installment_schedule")
    .insert(schedule);

  if (error) {
    console.error("Error creating installment schedule:", error);
    throw error;
  }
}

// ============================================
// SALES
// ============================================

export async function getSales(options?: {
  lorryId?: string;
  staffId?: string;
  saleType?: "cash" | "installment";
  startDate?: string;
  endDate?: string;
}) {
  let query = supabase
    .from("sales")
    .select(`
      *,
      customers(id, name, nic, phone),
      users(id, name),
      lorries(id, code, name),
      sale_items(quantity, unit_price, total_price, products(id, name, code)),
      installment_plans(id, plan_number, monthly_payment, period_months)
    `)
    .order("sale_date", { ascending: false });

  if (options?.lorryId) query = query.eq("lorry_id", options.lorryId);
  if (options?.staffId) query = query.eq("staff_id", options.staffId);
  if (options?.saleType) query = query.eq("sale_type", options.saleType);
  if (options?.startDate) query = query.gte("sale_date", options.startDate);
  if (options?.endDate) query = query.lte("sale_date", options.endDate);

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching sales:", error);
    toast.error("Failed to load sales");
    return [];
  }
  return data;
}

export async function createSale(sale: TablesRow["sales"]["Insert"], items: TablesRow["sale_items"]["Insert"][]) {
  // Generate invoice number
  const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString().slice(-6)}`;

  const { data: saleData, error: saleError } = await supabase
    .from("sales")
    .insert({ ...sale, invoice_number: invoiceNumber })
    .select()
    .single();

  if (saleError) {
    console.error("Error creating sale:", saleError);
    toast.error("Failed to create sale");
    throw saleError;
  }

  // Insert sale items
  const saleItems = items.map((item) => ({
    ...item,
    sale_id: saleData.id,
  }));

  const { error: itemsError } = await supabase
    .from("sale_items")
    .insert(saleItems);

  if (itemsError) {
    console.error("Error creating sale items:", itemsError);
    throw itemsError;
  }

  // Update inventory
  for (const item of items) {
    if (sale.lorry_id) {
      await updateLorryInventory(
        item.product_id,
        sale.lorry_id,
        -item.quantity,
        "sale_out",
        saleData.id
      );
    } else if (sale.warehouse_id) {
      await updateWarehouseInventory(
        item.product_id,
        sale.warehouse_id,
        -item.quantity,
        "sale_out",
        saleData.id
      );
    }
  }

  toast.success(`Sale ${invoiceNumber} completed`);
  return saleData;
}

// ============================================
// SUPPLIERS
// ============================================

export async function getSuppliers() {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }
  return data;
}

export async function createSupplier(supplier: TablesRow["suppliers"]["Insert"]) {
  const { data, error } = await supabase
    .from("suppliers")
    .insert(supplier)
    .select()
    .single();

  if (error) {
    console.error("Error creating supplier:", error);
    toast.error("Failed to create supplier");
    throw error;
  }
  toast.success("Supplier created");
  return data;
}

// ============================================
// REPORTS
// ============================================

export async function getDashboardStats() {
  const today = new Date().toISOString().split("T")[0];
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  // Today's sales
  const { data: todaySales } = await supabase
    .from("sales")
    .select("total, sale_type")
    .gte("sale_date", `${today}T00:00:00`)
    .lte("sale_date", `${today}T23:59:59`);

  // Monthly sales
  const { data: monthSales } = await supabase
    .from("sales")
    .select("total, sale_type, sale_date")
    .gte("sale_date", startOfMonth);

  // Outstanding installments
  const { data: outstanding } = await supabase
    .from("installment_plans")
    .select("financed_amount, total_payable")
    .in("status", ["pending", "overdue"]);

  // Low stock products
  const { data: warehouseInventory } = await supabase
    .from("inventory_warehouse")
    .select(`
      quantity,
      products!inner(id, name, low_stock_threshold)
    `);

  const todayTotal = (todaySales || []).reduce((sum: number, s: any) => sum + s.total, 0);
  const todayCash = (todaySales || [])
    .filter((s: any) => s.sale_type === "cash")
    .reduce((sum: number, s: any) => sum + s.total, 0);
  const todayInstallment = (todaySales || [])
    .filter((s: any) => s.sale_type === "installment")
    .reduce((sum: number, s: any) => sum + s.total, 0);
  const monthTotal = (monthSales || []).reduce((sum: number, s: any) => sum + s.total, 0);
  const outstandingTotal = (outstanding || []).reduce((sum: number, o: any) => sum + o.financed_amount, 0);
  const lowStockCount = (warehouseInventory || []).filter(
    (i: any) => i.quantity <= (i.products as any).low_stock_threshold
  ).length;

  return {
    todayTotal,
    todayCash,
    todayInstallment,
    monthTotal,
    outstandingTotal,
    lowStockCount,
  };
}

export async function getSalesTrend(days: number = 14) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from("sales")
    .select("total, sale_type, sale_date")
    .gte("sale_date", startDate.toISOString())
    .order("sale_date", { ascending: true });

  if (error) {
    console.error("Error fetching sales trend:", error);
    return [];
  }

  // Group by day
  const dayMap = new Map<string, { cash: number; installment: number }>();

  for (const sale of data || []) {
    const day = new Date(sale.sale_date).toLocaleDateString("en-LK", {
      weekday: "short",
      day: "numeric",
    });
    const existing = dayMap.get(day) || { cash: 0, installment: 0 };
    if (sale.sale_type === "cash") {
      existing.cash += sale.total;
    } else {
      existing.installment += sale.total;
    }
    dayMap.set(day, existing);
  }

  return Array.from(dayMap.entries()).map(([day, values]) => ({
    day,
    cash: values.cash,
    installment: values.installment,
  }));
}
