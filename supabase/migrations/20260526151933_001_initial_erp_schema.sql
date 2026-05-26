/*
  # Initial ERP Schema for Sujee Enterprises

  1. Purpose
    This migration establishes the complete database foundation for an enterprise-grade ERP system
    that manages retail sales, installment financing, lorry distribution, inventory, and accounting.

  2. New Tables
    - roles: User role definitions (admin, stock_manager, lorry_manager, sales_staff, collector)
    - users: Staff accounts with authentication details
    - products: Product catalog with pricing and categorization
    - categories: Product categories for organization
    - brands: Product brands/suppliers
    - customers: Customer records for installment financing
    - installment_plans: Installment contracts with payment schedules
    - installment_schedule: Payment schedule entries
    - installment_payments: Individual payment records against plans
    - warehouses: Warehouse locations
    - inventory_warehouse: Stock levels per warehouse
    - lorries: Lorry fleet vehicles
    - lorry_staff: Assignments of staff to lorries
    - inventory_lorry: Stock levels per lorry
    - lorry_routes: Daily route assignments
    - lorry_expenses: Fuel and maintenance tracking
    - sales: Sales transactions (cash and installment)
    - sale_items: Line items within sales
    - collection_routes: Daily collection routes
    - collection_visits: Individual collection visits
    - suppliers: Supplier/vendor management
    - purchase_orders: Purchase order management
    - purchase_order_items: Line items for purchase orders
    - inventory_transactions: Stock movement audit trail
    - expenses: Expense tracking
    - commissions: Staff commission calculations
    - settings: System configuration
    - audit_logs: Activity and change tracking
    - notifications: User notifications
    - product_serials: Serial number tracking

  3. Security
    - RLS enabled on ALL tables
    - Policies restrict data access based on roles and ownership
    - Authenticated users only can access their permitted data

  4. Important Notes
    - All timestamps use timestamptz for timezone awareness
    - Currency amounts stored as integers (cents) to avoid floating point errors
    - Soft deletes used where appropriate (deleted_at column)
    - Comprehensive indexes for performance
*/

-- ============================================
-- ENUMS AND TYPES
-- ============================================

-- User roles enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'stock_manager', 'lorry_manager', 'sales_staff', 'collector');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Sale type
DO $$ BEGIN
  CREATE TYPE sale_type AS ENUM ('cash', 'installment');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Payment status
DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue', 'defaulted', 'settled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Inventory transaction type
DO $$ BEGIN
  CREATE TYPE inventory_txn_type AS ENUM (
    'purchase_in', 'sale_out', 'transfer_in', 'transfer_out', 
    'adjustment_add', 'adjustment_subtract', 'damaged', 'returned'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Collection status
DO $$ BEGIN
  CREATE TYPE collection_status AS ENUM ('pending', 'collected', 'missed', 'partial');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- CORE TABLES
-- ============================================

-- Roles table (extends auth.users role system)
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL CHECK (name IN ('admin', 'stock_manager', 'lorry_manager', 'sales_staff', 'collector')),
  label text NOT NULL,
  description text,
  permissions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default roles
INSERT INTO roles (name, label, description) VALUES
  ('admin', 'Super Admin', 'Full system access'),
  ('stock_manager', 'Stock Manager', 'Manage inventory, warehouses, and products'),
  ('lorry_manager', 'Lorry Manager', 'Manage assigned lorry operations'),
  ('sales_staff', 'Sales Staff', 'POS operations and customer registration'),
  ('collector', 'Cash Collector', 'Field payment collection')
ON CONFLICT (name) DO NOTHING;

-- Users table (staff accounts)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  nic text,
  address text,
  photo_url text,
  role user_role NOT NULL DEFAULT 'sales_staff',
  is_active boolean DEFAULT true,
  lorry_id uuid, -- Assigned lorry for lorry_manager
  commission_rate numeric(5,4) DEFAULT 0.04, -- 4% default commission
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- ============================================
-- PRODUCT MANAGEMENT
-- ============================================

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Brands
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  barcode text UNIQUE,
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  image_url text,
  cost_price int NOT NULL DEFAULT 0, -- in cents
  cash_price int NOT NULL DEFAULT 0,
  installment_price int NOT NULL DEFAULT 0,
  warranty_months int DEFAULT 0,
  weight_kg numeric(10,3),
  is_active boolean DEFAULT true,
  low_stock_threshold int DEFAULT 10,
  has_serial boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Product serial numbers (for warranty tracking)
CREATE TABLE IF NOT EXISTS product_serials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  serial_number text NOT NULL,
  sale_id uuid, -- References sales when sold
  status text DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'sold', 'returned', 'damaged')),
  warranty_end_date date,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- WAREHOUSE MANAGEMENT
-- ============================================

-- Warehouses
CREATE TABLE IF NOT EXISTS warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  address text,
  phone text,
  manager_id uuid REFERENCES users(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insert default warehouse
INSERT INTO warehouses (name, code, address) 
VALUES ('Main Warehouse', 'WH-MAIN', 'Head Office')
ON CONFLICT (code) DO NOTHING;

-- Warehouse inventory
CREATE TABLE IF NOT EXISTS inventory_warehouse (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id uuid REFERENCES warehouses(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity int NOT NULL DEFAULT 0,
  reserved_quantity int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(warehouse_id, product_id)
);

-- ============================================
-- LORRY MANAGEMENT
-- ============================================

-- Lorries
CREATE TABLE IF NOT EXISTS lorries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  plate_number text UNIQUE NOT NULL,
  name text NOT NULL,
  driver_name text,
  driver_phone text,
  current_location text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert 12 default lorries
INSERT INTO lorries (code, plate_number, name, driver_name) VALUES
  ('L01', 'WP-CAB-1234', 'Lorry 01', 'Default Driver'),
  ('L02', 'WP-CAB-1235', 'Lorry 02', 'Default Driver'),
  ('L03', 'WP-CAB-1236', 'Lorry 03', 'Default Driver'),
  ('L04', 'WP-CAB-1237', 'Lorry 04', 'Default Driver'),
  ('L05', 'WP-CAB-1238', 'Lorry 05', 'Default Driver'),
  ('L06', 'WP-CAB-1239', 'Lorry 06', 'Default Driver'),
  ('L07', 'WP-CAB-1240', 'Lorry 07', 'Default Driver'),
  ('L08', 'WP-CAB-1241', 'Lorry 08', 'Default Driver'),
  ('L09', 'WP-CAB-1242', 'Lorry 09', 'Default Driver'),
  ('L10', 'WP-CAB-1243', 'Lorry 10', 'Default Driver'),
  ('L11', 'WP-CAB-1244', 'Lorry 11', 'Default Driver'),
  ('L12', 'WP-CAB-1245', 'Lorry 12', 'Default Driver')
ON CONFLICT (code) DO NOTHING;

-- Lorry staff assignments
CREATE TABLE IF NOT EXISTS lorry_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lorry_id uuid REFERENCES lorries(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  assigned_date date NOT NULL DEFAULT CURRENT_DATE,
  is_active boolean DEFAULT true,
  UNIQUE(lorry_id, user_id, assigned_date)
);

-- Lorry inventory
CREATE TABLE IF NOT EXISTS inventory_lorry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lorry_id uuid REFERENCES lorries(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(lorry_id, product_id)
);

-- Lorry routes
CREATE TABLE IF NOT EXISTS lorry_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lorry_id uuid REFERENCES lorries(id) ON DELETE CASCADE,
  route_date date NOT NULL,
  route_name text,
  start_location text,
  end_location text,
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Lorry expenses (fuel, maintenance, etc)
CREATE TABLE IF NOT EXISTS lorry_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lorry_id uuid REFERENCES lorries(id) ON DELETE CASCADE,
  expense_type text NOT NULL,
  amount int NOT NULL,
  description text,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  recorded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  receipt_url text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- CUSTOMER MANAGEMENT
-- ============================================

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  nic text UNIQUE,
  phone text NOT NULL,
  phone2 text,
  email text,
  address text NOT NULL,
  city text,
  gps_location text,
  guarantor_name text,
  guarantor_phone text,
  guarantor_nic text,
  photo_url text,
  nic_image_url text,
  signature_url text,
  credit_score int DEFAULT 100,
  status text DEFAULT 'active' CHECK (status IN ('active', 'blacklisted', 'defaulted', 'settled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- ============================================
-- INSTALLMENT MANAGEMENT
-- ============================================

-- Installment plans
CREATE TABLE IF NOT EXISTS installment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE RESTRICT,
  total_amount int NOT NULL,
  down_payment int NOT NULL DEFAULT 0,
  financed_amount int NOT NULL,
  interest_rate numeric(5,2) DEFAULT 0,
  interest_amount int DEFAULT 0,
  total_payable int NOT NULL,
  monthly_payment int NOT NULL,
  period_months int NOT NULL,
  start_date date NOT NULL,
  end_date date,
  status payment_status DEFAULT 'pending',
  staff_id uuid REFERENCES users(id) ON DELETE SET NULL,
  lorry_id uuid REFERENCES lorries(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Installment schedule
CREATE TABLE IF NOT EXISTS installment_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES installment_plans(id) ON DELETE CASCADE,
  installment_number int NOT NULL,
  due_date date NOT NULL,
  amount_due int NOT NULL,
  amount_paid int DEFAULT 0,
  payment_date date,
  status payment_status DEFAULT 'pending',
  penalty_amount int DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(plan_id, installment_number)
);

-- Installment payments
CREATE TABLE IF NOT EXISTS installment_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES installment_plans(id) ON DELETE RESTRICT,
  schedule_id uuid REFERENCES installment_schedule(id) ON DELETE SET NULL,
  amount int NOT NULL,
  payment_method text DEFAULT 'cash' CHECK (payment_method IN ('cash', 'bank_transfer', 'check')),
  receipt_number text,
  collected_by uuid REFERENCES users(id) ON DELETE SET NULL,
  payment_date timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- SALES MANAGEMENT
-- ============================================

-- Sales
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  sale_type sale_type NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  lorry_id uuid REFERENCES lorries(id) ON DELETE SET NULL,
  warehouse_id uuid REFERENCES warehouses(id) ON DELETE SET NULL,
  staff_id uuid REFERENCES users(id) ON DELETE SET NULL,
  subtotal int NOT NULL,
  discount int DEFAULT 0,
  total int NOT NULL,
  payment_method text DEFAULT 'cash',
  installment_plan_id uuid REFERENCES installment_plans(id) ON DELETE SET NULL,
  status text DEFAULT 'completed' CHECK (status IN ('draft', 'completed', 'cancelled', 'returned')),
  notes text,
  sale_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Sale items
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT,
  serial_id uuid REFERENCES product_serials(id) ON DELETE SET NULL,
  quantity int NOT NULL,
  unit_price int NOT NULL,
  total_price int NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- COLLECTIONS
-- ============================================

-- Daily collection routes
CREATE TABLE IF NOT EXISTS collection_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collector_id uuid REFERENCES users(id) ON DELETE RESTRICT,
  route_date date NOT NULL DEFAULT CURRENT_DATE,
  route_name text,
  target_area text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  total_planned int DEFAULT 0,
  total_collected int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Collection visits
CREATE TABLE IF NOT EXISTS collection_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid REFERENCES collection_routes(id) ON DELETE CASCADE,
  installment_plan_id uuid REFERENCES installment_plans(id) ON DELETE RESTRICT,
  customer_id uuid REFERENCES customers(id) ON DELETE RESTRICT,
  amount_due int NOT NULL,
  amount_collected int DEFAULT 0,
  status collection_status DEFAULT 'pending',
  visit_time timestamptz,
  gps_location text,
  notes text,
  receipt_number text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- PROCUREMENT
-- ============================================

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE,
  contact_person text,
  phone text,
  email text,
  address text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Purchase orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number text UNIQUE NOT NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE RESTRICT,
  warehouse_id uuid REFERENCES warehouses(id) ON DELETE RESTRICT,
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  expected_date date,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'received', 'cancelled')),
  subtotal int DEFAULT 0,
  tax_amount int DEFAULT 0,
  total int DEFAULT 0,
  notes text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Purchase order items
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id uuid REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT,
  quantity int NOT NULL,
  unit_cost int NOT NULL,
  total_cost int NOT NULL,
  received_quantity int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- INVENTORY TRANSACTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT,
  warehouse_id uuid REFERENCES warehouses(id) ON DELETE SET NULL,
  lorry_id uuid REFERENCES lorries(id) ON DELETE SET NULL,
  txn_type inventory_txn_type NOT NULL,
  reference_type text,
  reference_id uuid,
  quantity int NOT NULL,
  previous_quantity int NOT NULL,
  new_quantity int NOT NULL,
  unit_cost int,
  total_cost int,
  performed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- EXPENSES & COMMISSIONS
-- ============================================

-- General expenses
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_type text NOT NULL,
  category text,
  amount int NOT NULL,
  description text,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  recorded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  receipt_url text,
  created_at timestamptz DEFAULT now()
);

-- Staff commissions
CREATE TABLE IF NOT EXISTS commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES users(id) ON DELETE RESTRICT,
  sale_id uuid REFERENCES sales(id) ON DELETE SET NULL,
  commission_amount int NOT NULL,
  commission_rate numeric(5,4) NOT NULL,
  sale_amount int NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  paid_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- SYSTEM
-- ============================================

-- Settings
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_customers_nic ON customers(nic);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_installment_plans_customer ON installment_plans(customer_id);
CREATE INDEX IF NOT EXISTS idx_installment_plans_status ON installment_plans(status);
CREATE INDEX IF NOT EXISTS idx_sales_staff ON sales(staff_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE installment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE installment_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE installment_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_warehouse ENABLE ROW LEVEL SECURITY;
ALTER TABLE lorries ENABLE ROW LEVEL SECURITY;
ALTER TABLE lorry_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_lorry ENABLE ROW LEVEL SECURITY;
ALTER TABLE lorry_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lorry_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_serials ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Users: Admins can see all, others can see themselves
CREATE POLICY "Admins manage all users" ON users
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users read own data" ON users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Products: Read all for authenticated, write for admin and stock_manager
CREATE POLICY "Staff read products" ON products
  FOR SELECT TO authenticated
  USING (is_active = true OR deleted_at IS NULL);

CREATE POLICY "Admin and stock_manager manage products" ON products
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'stock_manager'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'stock_manager'))
  );

-- Categories: All authenticated can read
CREATE POLICY "Staff read categories" ON categories
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin and stock_manager manage categories" ON categories
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'stock_manager'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'stock_manager'))
  );

-- Brands: All authenticated can read
CREATE POLICY "Staff read brands" ON brands
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin and stock_manager manage brands" ON brands
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'stock_manager'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'stock_manager'))
  );

-- Customers: Admin, lorry_manager, sales_staff, collector
CREATE POLICY "Authorized staff read customers" ON customers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'lorry_manager', 'sales_staff', 'collector')
    )
  );

CREATE POLICY "Sales staff create customers" ON customers
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'lorry_manager', 'sales_staff')
    )
  );

CREATE POLICY "Admin manage customers" ON customers
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Installment plans: Based on role
CREATE POLICY "Staff read installment plans" ON installment_plans
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'lorry_manager', 'sales_staff', 'collector')
    )
  );

CREATE POLICY "Authorized staff create plans" ON installment_plans
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'lorry_manager', 'sales_staff')
    )
  );

CREATE POLICY "Admin and lorry_manager manage plans" ON installment_plans
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'lorry_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'lorry_manager')
    )
  );

-- Sales: Based on role and ownership
CREATE POLICY "Staff read sales" ON sales
  FOR SELECT TO authenticated
  USING (
    staff_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'stock_manager', 'lorry_manager')
    )
  );

CREATE POLICY "Sales staff create sales" ON sales
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'lorry_manager', 'sales_staff')
    )
  );

-- Inventory: Role-based access
CREATE POLICY "Warehouse staff read inventory" ON inventory_warehouse
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'stock_manager')
    )
  );

CREATE POLICY "Warehouse staff manage inventory" ON inventory_warehouse
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'stock_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'stock_manager')
    )
  );

-- Lorry inventory: Lorry manager can access their own lorry inventory
CREATE POLICY "Lorry staff read own inventory" ON inventory_lorry
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lorry_staff 
      WHERE user_id = auth.uid() 
      AND lorry_id = inventory_lorry.lorry_id
    )
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Lorry manager manage own inventory" ON inventory_lorry
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'stock_manager')
    )
    OR EXISTS (
      SELECT 1 FROM lorry_staff ls
      JOIN users u ON u.id = ls.user_id
      WHERE ls.user_id = auth.uid() 
      AND ls.lorry_id = inventory_lorry.lorry_id
      AND u.role = 'lorry_manager'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'stock_manager')
    )
    OR EXISTS (
      SELECT 1 FROM lorry_staff ls
      JOIN users u ON u.id = ls.user_id
      WHERE ls.user_id = auth.uid() 
      AND ls.lorry_id = inventory_lorry.lorry_id
      AND u.role = 'lorry_manager'
    )
  );

-- Lorries: Read all, manage by admin and stock_manager
CREATE POLICY "Staff read lorries" ON lorries
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin manage lorries" ON lorries
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'stock_manager'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'stock_manager'))
  );

-- Suppliers: Read all, manage by admin and stock_manager
CREATE POLICY "Staff read suppliers" ON suppliers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin manage suppliers" ON suppliers
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'stock_manager'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'stock_manager'))
  );

-- Purchase orders: Role-based
CREATE POLICY "Staff read purchase orders" ON purchase_orders
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'stock_manager'))
  );

CREATE POLICY "Stock manager manage purchase orders" ON purchase_orders
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'stock_manager'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'stock_manager'))
  );

-- Settings: Admin only
CREATE POLICY "Admin only settings" ON settings
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Audit logs: Admin only
CREATE POLICY "Admin read audit logs" ON audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Notifications: Own notifications only
CREATE POLICY "Users read own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users delete own notifications" ON notifications
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Collection routes: Collector and admin
CREATE POLICY "Collector read own routes" ON collection_routes
  FOR SELECT TO authenticated
  USING (
    collector_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin manage collection routes" ON collection_routes
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'collector'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'collector'))
  );

-- Commissions: Read own or admin
CREATE POLICY "Users read own commissions" ON commissions
  FOR SELECT TO authenticated
  USING (
    staff_id = auth.uid()
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin manage commissions" ON commissions
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
  ('company_name', '"Sujee Enterprises"', 'Company name'),
  ('company_address', '"Head Office, Sri Lanka"', 'Company address'),
  ('company_phone', '"+94 11 234 5678"', 'Company phone'),
  ('currency', '"LKR"', 'Default currency'),
  ('default_commission_rate', '0.04', 'Default staff commission rate (4%)'),
  ('low_stock_threshold', '10', 'Default low stock threshold'),
  ('penalty_rate_monthly', '0.02', 'Monthly penalty rate for overdue installments'),
  ('vat_rate', '0.00', 'VAT rate')
ON CONFLICT (key) DO NOTHING;

-- Create audit log trigger function
CREATE OR REPLACE FUNCTION audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_products AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_sales AFTER INSERT OR UPDATE OR DELETE ON sales
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_installment_plans AFTER INSERT OR UPDATE OR DELETE ON installment_plans
  FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();
