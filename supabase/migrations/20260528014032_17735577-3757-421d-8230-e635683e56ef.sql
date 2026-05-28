
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'audit_logs','brands','categories','collection_routes','collection_visits',
    'commissions','customers','expenses','installment_payments','installment_plans',
    'installment_schedule','inventory_lorry','inventory_transactions','inventory_warehouse',
    'lorries','lorry_expenses','lorry_routes','lorry_staff','notifications',
    'product_serials','products','purchase_order_items','purchase_orders','roles',
    'sale_items','sales','settings','suppliers','users','warehouses'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Authenticated full access" ON public.%I', t);
    EXECUTE format($p$CREATE POLICY "Authenticated full access" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)$p$, t);
  END LOOP;
END $$;
