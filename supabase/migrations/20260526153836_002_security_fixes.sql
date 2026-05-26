/*
  # Security Fixes - RLS Policies and Function Security

  1. RLS Fixes
    - Enable RLS on `roles` table
    - Add RLS policies to tables with RLS enabled but no policies

  2. Functions Security
    - Set immutable search_path on `update_updated_at_column`
    - Set immutable search_path on `audit_log_trigger`

  3. Tables with new RLS policies
    - roles: all authenticated can view, admins can manage
    - collection_visits: collectors can manage via route assignment, admins can manage all
    - expenses: staff can read own lorry expenses, managers can manage
    - installment_payments: collectors can insert, finance staff can manage
    - installment_schedule: staff can view, managers can manage
    - inventory_transactions: stock managers can manage, staff can view
    - lorry_expenses: lorry managers can manage, staff can view own lorry
    - lorry_routes: lorry managers can manage, staff can view own routes
    - lorry_staff: lorry managers can manage assignments
    - product_serials: stock managers can manage, staff can view
    - purchase_order_items: stock managers can manage
    - sale_items: sales staff can insert, managers can view all
    - warehouses: all authenticated users can view, admins can manage

  4. Security Notes
    - All policies use auth.uid() for user identification
    - Policies enforce data ownership and role-based access
    - Functions use secure search_path to prevent injection
*/

-- Fix 1: Enable RLS on roles table
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Fix 2: Set immutable search_path on functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.audit_log_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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
$$;

-- Fix 3: RLS Policies for roles table
CREATE POLICY "Users can view roles"
  ON public.roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage roles"
  ON public.roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for collection_visits
CREATE POLICY "Collectors can manage own route visits"
  ON public.collection_visits
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collection_routes
      WHERE collection_routes.id = collection_visits.route_id
      AND collection_routes.collector_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'lorry_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collection_routes
      WHERE collection_routes.id = collection_visits.route_id
      AND collection_routes.collector_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'lorry_manager')
    )
  );

-- RLS Policies for expenses
CREATE POLICY "Staff can view lorry expenses"
  ON public.expenses
  FOR SELECT
  TO authenticated
  USING (
    recorded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'lorry_manager', 'stock_manager')
    )
  );

CREATE POLICY "Staff can create expenses"
  ON public.expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'lorry_manager', 'stock_manager', 'sales_staff')
    )
  );

CREATE POLICY "Managers can update expenses"
  ON public.expenses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'lorry_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'lorry_manager')
    )
  );

-- RLS Policies for installment_payments
CREATE POLICY "Staff can view installment payments"
  ON public.installment_payments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Collectors can record payments"
  ON public.installment_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'collector', 'sales_staff', 'lorry_manager', 'stock_manager')
    )
  );

CREATE POLICY "Managers can manage payments"
  ON public.installment_payments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'lorry_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'lorry_manager')
    )
  );

-- RLS Policies for installment_schedule
CREATE POLICY "Staff can view installment schedule"
  ON public.installment_schedule
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers can manage schedule"
  ON public.installment_schedule
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'lorry_manager', 'stock_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'lorry_manager', 'stock_manager')
    )
  );

-- RLS Policies for inventory_transactions
CREATE POLICY "Staff can view inventory transactions"
  ON public.inventory_transactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Stock managers can manage transactions"
  ON public.inventory_transactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'stock_manager', 'lorry_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'stock_manager', 'lorry_manager')
    )
  );

-- RLS Policies for lorry_expenses
CREATE POLICY "Staff can view own lorry expenses"
  ON public.lorry_expenses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lorry_staff
      WHERE lorry_staff.user_id = auth.uid()
      AND lorry_staff.lorry_id = lorry_expenses.lorry_id
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'lorry_manager')
    )
  );

CREATE POLICY "Lorry staff can insert expenses"
  ON public.lorry_expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lorry_staff
      WHERE lorry_staff.user_id = auth.uid()
      AND lorry_staff.lorry_id = lorry_expenses.lorry_id
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'lorry_manager')
    )
  );

CREATE POLICY "Managers can update lorry expenses"
  ON public.lorry_expenses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'lorry_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'lorry_manager')
    )
  );

-- RLS Policies for lorry_routes
CREATE POLICY "Staff can view own routes"
  ON public.lorry_routes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lorry_staff
      WHERE lorry_staff.user_id = auth.uid()
      AND lorry_staff.lorry_id = lorry_routes.lorry_id
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'lorry_manager')
    )
  );

CREATE POLICY "Managers can manage routes"
  ON public.lorry_routes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'lorry_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'lorry_manager')
    )
  );

-- RLS Policies for lorry_staff
CREATE POLICY "Users can view lorry staff assignments"
  ON public.lorry_staff
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers can manage lorry staff"
  ON public.lorry_staff
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'lorry_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'lorry_manager')
    )
  );

-- RLS Policies for product_serials
CREATE POLICY "Staff can view product serials"
  ON public.product_serials
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Stock managers can manage serials"
  ON public.product_serials
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'stock_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'stock_manager')
    )
  );

-- RLS Policies for purchase_order_items
CREATE POLICY "Staff can view purchase order items"
  ON public.purchase_order_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Stock managers can manage purchase items"
  ON public.purchase_order_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'stock_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'stock_manager')
    )
  );

-- RLS Policies for sale_items
CREATE POLICY "Staff can view sale items"
  ON public.sale_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sales staff can create sale items"
  ON public.sale_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'sales_staff', 'lorry_manager', 'stock_manager')
    )
  );

CREATE POLICY "Managers can update sale items"
  ON public.sale_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'stock_manager', 'lorry_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'stock_manager', 'lorry_manager')
    )
  );

-- RLS Policies for warehouses
CREATE POLICY "Users can view warehouses"
  ON public.warehouses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage warehouses"
  ON public.warehouses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
