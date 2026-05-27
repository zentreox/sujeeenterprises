import { supabase as typedClient } from "@/integrations/supabase/client";
export const supabase = typedClient as any;
export type Database = any;



// Type-safe database schema
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string | null;
          nic: string | null;
          address: string | null;
          photo_url: string | null;
          role: "admin" | "stock_manager" | "lorry_manager" | "sales_staff" | "collector";
          is_active: boolean;
          lorry_id: string | null;
          commission_rate: number;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          phone?: string | null;
          nic?: string | null;
          address?: string | null;
          photo_url?: string | null;
          role?: "admin" | "stock_manager" | "lorry_manager" | "sales_staff" | "collector";
          is_active?: boolean;
          lorry_id?: string | null;
          commission_rate?: number;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          phone?: string | null;
          nic?: string | null;
          address?: string | null;
          photo_url?: string | null;
          role?: "admin" | "stock_manager" | "lorry_manager" | "sales_staff" | "collector";
          is_active?: boolean;
          lorry_id?: string | null;
          commission_rate?: number;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      products: {
        Row: {
          id: string;
          code: string;
          barcode: string | null;
          name: string;
          description: string | null;
          category_id: string | null;
          brand_id: string | null;
          image_url: string | null;
          cost_price: number;
          cash_price: number;
          installment_price: number;
          warranty_months: number;
          weight_kg: number | null;
          is_active: boolean;
          low_stock_threshold: number;
          has_serial: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          barcode?: string | null;
          name: string;
          description?: string | null;
          category_id?: string | null;
          brand_id?: string | null;
          image_url?: string | null;
          cost_price?: number;
          cash_price: number;
          installment_price: number;
          warranty_months?: number;
          weight_kg?: number | null;
          is_active?: boolean;
          low_stock_threshold?: number;
          has_serial?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          barcode?: string | null;
          name?: string;
          description?: string | null;
          category_id?: string | null;
          brand_id?: string | null;
          image_url?: string | null;
          cost_price?: number;
          cash_price?: number;
          installment_price?: number;
          warranty_months?: number;
          weight_kg?: number | null;
          is_active?: boolean;
          low_stock_threshold?: number;
          has_serial?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          parent_id: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      brands: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          nic: string | null;
          phone: string;
          phone2: string | null;
          email: string | null;
          address: string;
          city: string | null;
          gps_location: string | null;
          guarantor_name: string | null;
          guarantor_phone: string | null;
          guarantor_nic: string | null;
          photo_url: string | null;
          nic_image_url: string | null;
          signature_url: string | null;
          credit_score: number;
          status: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          nic?: string | null;
          phone: string;
          phone2?: string | null;
          email?: string | null;
          address: string;
          city?: string | null;
          gps_location?: string | null;
          guarantor_name?: string | null;
          guarantor_phone?: string | null;
          guarantor_nic?: string | null;
          photo_url?: string | null;
          nic_image_url?: string | null;
          signature_url?: string | null;
          credit_score?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          nic?: string | null;
          phone?: string;
          phone2?: string | null;
          email?: string | null;
          address?: string;
          city?: string | null;
          gps_location?: string | null;
          guarantor_name?: string | null;
          guarantor_phone?: string | null;
          guarantor_nic?: string | null;
          photo_url?: string | null;
          nic_image_url?: string | null;
          signature_url?: string | null;
          credit_score?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      installment_plans: {
        Row: {
          id: string;
          plan_number: string;
          customer_id: string;
          total_amount: number;
          down_payment: number;
          financed_amount: number;
          interest_rate: number;
          interest_amount: number;
          total_payable: number;
          monthly_payment: number;
          period_months: number;
          start_date: string;
          end_date: string | null;
          status: string;
          staff_id: string | null;
          lorry_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plan_number: string;
          customer_id: string;
          total_amount: number;
          down_payment?: number;
          financed_amount: number;
          interest_rate?: number;
          interest_amount?: number;
          total_payable: number;
          monthly_payment: number;
          period_months: number;
          start_date: string;
          end_date?: string | null;
          status?: string;
          staff_id?: string | null;
          lorry_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plan_number?: string;
          customer_id?: string;
          total_amount?: number;
          down_payment?: number;
          financed_amount?: number;
          interest_rate?: number;
          interest_amount?: number;
          total_payable?: number;
          monthly_payment?: number;
          period_months?: number;
          start_date?: string;
          end_date?: string | null;
          status?: string;
          staff_id?: string | null;
          lorry_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      installment_schedule: {
        Row: {
          id: string;
          plan_id: string;
          installment_number: number;
          due_date: string;
          amount_due: number;
          amount_paid: number;
          payment_date: string | null;
          status: string;
          penalty_amount: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          installment_number: number;
          due_date: string;
          amount_due: number;
          amount_paid?: number;
          payment_date?: string | null;
          status?: string;
          penalty_amount?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          installment_number?: number;
          due_date?: string;
          amount_due?: number;
          amount_paid?: number;
          payment_date?: string | null;
          status?: string;
          penalty_amount?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
      installment_payments: {
        Row: {
          id: string;
          plan_id: string;
          schedule_id: string | null;
          amount: number;
          payment_method: string;
          receipt_number: string | null;
          collected_by: string | null;
          payment_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          schedule_id?: string | null;
          amount: number;
          payment_method?: string;
          receipt_number?: string | null;
          collected_by?: string | null;
          payment_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          schedule_id?: string | null;
          amount?: number;
          payment_method?: string;
          receipt_number?: string | null;
          collected_by?: string | null;
          payment_date?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      warehouses: {
        Row: {
          id: string;
          name: string;
          code: string;
          address: string | null;
          phone: string | null;
          manager_id: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          address?: string | null;
          phone?: string | null;
          manager_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          address?: string | null;
          phone?: string | null;
          manager_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      inventory_warehouse: {
        Row: {
          id: string;
          warehouse_id: string;
          product_id: string;
          quantity: number;
          reserved_quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          warehouse_id: string;
          product_id: string;
          quantity?: number;
          reserved_quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          warehouse_id?: string;
          product_id?: string;
          quantity?: number;
          reserved_quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      lorries: {
        Row: {
          id: string;
          code: string;
          plate_number: string;
          name: string;
          driver_name: string | null;
          driver_phone: string | null;
          current_location: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          plate_number: string;
          name: string;
          driver_name?: string | null;
          driver_phone?: string | null;
          current_location?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          plate_number?: string;
          name?: string;
          driver_name?: string | null;
          driver_phone?: string | null;
          current_location?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      lorry_staff: {
        Row: {
          id: string;
          lorry_id: string;
          user_id: string;
          assigned_date: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          lorry_id: string;
          user_id: string;
          assigned_date?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          lorry_id?: string;
          user_id?: string;
          assigned_date?: string;
          is_active?: boolean;
        };
      };
      inventory_lorry: {
        Row: {
          id: string;
          lorry_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lorry_id: string;
          product_id: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lorry_id?: string;
          product_id?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      lorry_routes: {
        Row: {
          id: string;
          lorry_id: string;
          route_date: string;
          route_name: string | null;
          start_location: string | null;
          end_location: string | null;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lorry_id: string;
          route_date: string;
          route_name?: string | null;
          start_location?: string | null;
          end_location?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lorry_id?: string;
          route_date?: string;
          route_name?: string | null;
          start_location?: string | null;
          end_location?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      lorry_expenses: {
        Row: {
          id: string;
          lorry_id: string;
          expense_type: string;
          amount: number;
          description: string | null;
          expense_date: string;
          recorded_by: string | null;
          receipt_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lorry_id: string;
          expense_type: string;
          amount: number;
          description?: string | null;
          expense_date?: string;
          recorded_by?: string | null;
          receipt_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lorry_id?: string;
          expense_type?: string;
          amount?: number;
          description?: string | null;
          expense_date?: string;
          recorded_by?: string | null;
          receipt_url?: string | null;
          created_at?: string;
        };
      };
      sales: {
        Row: {
          id: string;
          invoice_number: string;
          sale_type: "cash" | "installment";
          customer_id: string | null;
          lorry_id: string | null;
          warehouse_id: string | null;
          staff_id: string | null;
          subtotal: number;
          discount: number;
          total: number;
          payment_method: string | null;
          installment_plan_id: string | null;
          status: string;
          notes: string | null;
          sale_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          sale_type: "cash" | "installment";
          customer_id?: string | null;
          lorry_id?: string | null;
          warehouse_id?: string | null;
          staff_id?: string | null;
          subtotal: number;
          discount?: number;
          total: number;
          payment_method?: string | null;
          installment_plan_id?: string | null;
          status?: string;
          notes?: string | null;
          sale_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          sale_type?: "cash" | "installment";
          customer_id?: string | null;
          lorry_id?: string | null;
          warehouse_id?: string | null;
          staff_id?: string | null;
          subtotal?: number;
          discount?: number;
          total?: number;
          payment_method?: string | null;
          installment_plan_id?: string | null;
          status?: string;
          notes?: string | null;
          sale_date?: string;
          created_at?: string;
        };
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          product_id: string;
          serial_id: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
          product_id: string;
          serial_id?: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          sale_id?: string;
          product_id?: string;
          serial_id?: string | null;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      collection_routes: {
        Row: {
          id: string;
          collector_id: string;
          route_date: string;
          route_name: string | null;
          target_area: string | null;
          status: string;
          total_planned: number;
          total_collected: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          collector_id: string;
          route_date?: string;
          route_name?: string | null;
          target_area?: string | null;
          status?: string;
          total_planned?: number;
          total_collected?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          collector_id?: string;
          route_date?: string;
          route_name?: string | null;
          target_area?: string | null;
          status?: string;
          total_planned?: number;
          total_collected?: number;
          created_at?: string;
        };
      };
      collection_visits: {
        Row: {
          id: string;
          route_id: string;
          installment_plan_id: string;
          customer_id: string;
          amount_due: number;
          amount_collected: number;
          status: string;
          visit_time: string | null;
          gps_location: string | null;
          notes: string | null;
          receipt_number: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          route_id: string;
          installment_plan_id: string;
          customer_id: string;
          amount_due: number;
          amount_collected?: number;
          status?: string;
          visit_time?: string | null;
          gps_location?: string | null;
          notes?: string | null;
          receipt_number?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          route_id?: string;
          installment_plan_id?: string;
          customer_id?: string;
          amount_due?: number;
          amount_collected?: number;
          status?: string;
          visit_time?: string | null;
          gps_location?: string | null;
          notes?: string | null;
          receipt_number?: string | null;
          created_at?: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          name: string;
          code: string | null;
          contact_person: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code?: string | null;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string | null;
          contact_person?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      purchase_orders: {
        Row: {
          id: string;
          po_number: string;
          supplier_id: string;
          warehouse_id: string;
          order_date: string;
          expected_date: string | null;
          status: string;
          subtotal: number;
          tax_amount: number;
          total: number;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          po_number: string;
          supplier_id: string;
          warehouse_id: string;
          order_date?: string;
          expected_date?: string | null;
          status?: string;
          subtotal?: number;
          tax_amount?: number;
          total?: number;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          po_number?: string;
          supplier_id?: string;
          warehouse_id?: string;
          order_date?: string;
          expected_date?: string | null;
          status?: string;
          subtotal?: number;
          tax_amount?: number;
          total?: number;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      purchase_order_items: {
        Row: {
          id: string;
          po_id: string;
          product_id: string;
          quantity: number;
          unit_cost: number;
          total_cost: number;
          received_quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          po_id: string;
          product_id: string;
          quantity: number;
          unit_cost: number;
          total_cost: number;
          received_quantity?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          po_id?: string;
          product_id?: string;
          quantity?: number;
          unit_cost?: number;
          total_cost?: number;
          received_quantity?: number;
          created_at?: string;
        };
      };
      inventory_transactions: {
        Row: {
          id: string;
          product_id: string;
          warehouse_id: string | null;
          lorry_id: string | null;
          txn_type: string;
          reference_type: string | null;
          reference_id: string | null;
          quantity: number;
          previous_quantity: number;
          new_quantity: number;
          unit_cost: number | null;
          total_cost: number | null;
          performed_by: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          warehouse_id?: string | null;
          lorry_id?: string | null;
          txn_type: string;
          reference_type?: string | null;
          reference_id?: string | null;
          quantity: number;
          previous_quantity: number;
          new_quantity: number;
          unit_cost?: number | null;
          total_cost?: number | null;
          performed_by?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          warehouse_id?: string | null;
          lorry_id?: string | null;
          txn_type?: string;
          reference_type?: string | null;
          reference_id?: string | null;
          quantity?: number;
          previous_quantity?: number;
          new_quantity?: number;
          unit_cost?: number | null;
          total_cost?: number | null;
          performed_by?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          expense_type: string;
          category: string | null;
          amount: number;
          description: string | null;
          expense_date: string;
          recorded_by: string | null;
          receipt_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          expense_type: string;
          category?: string | null;
          amount: number;
          description?: string | null;
          expense_date?: string;
          recorded_by?: string | null;
          receipt_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          expense_type?: string;
          category?: string | null;
          amount?: number;
          description?: string | null;
          expense_date?: string;
          recorded_by?: string | null;
          receipt_url?: string | null;
          created_at?: string;
        };
      };
      commissions: {
        Row: {
          id: string;
          staff_id: string;
          sale_id: string | null;
          commission_amount: number;
          commission_rate: number;
          sale_amount: number;
          status: string;
          paid_date: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          staff_id: string;
          sale_id?: string | null;
          commission_amount: number;
          commission_rate: number;
          sale_amount: number;
          status?: string;
          paid_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          staff_id?: string;
          sale_id?: string | null;
          commission_amount?: number;
          commission_rate?: number;
          sale_amount?: number;
          status?: string;
          paid_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value?: Json;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data: Json | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data?: Json | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          data?: Json | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      product_serials: {
        Row: {
          id: string;
          product_id: string;
          serial_number: string;
          sale_id: string | null;
          status: string;
          warranty_end_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          serial_number: string;
          sale_id?: string | null;
          status?: string;
          warranty_end_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          serial_number?: string;
          sale_id?: string | null;
          status?: string;
          warranty_end_date?: string | null;
          created_at?: string;
        };
      };
      roles: {
        Row: {
          id: string;
          name: string;
          label: string;
          description: string | null;
          permissions: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          label: string;
          description?: string | null;
          permissions?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          label?: string;
          description?: string | null;
          permissions?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "admin" | "stock_manager" | "lorry_manager" | "sales_staff" | "collector";
      sale_type: "cash" | "installment";
      payment_status: "pending" | "paid" | "overdue" | "defaulted" | "settled";
      inventory_txn_type:
        | "purchase_in"
        | "sale_out"
        | "transfer_in"
        | "transfer_out"
        | "adjustment_add"
        | "adjustment_subtract"
        | "damaged"
        | "returned";
      collection_status: "pending" | "collected" | "missed" | "partial";
    };
    CompositeTypes: Record<string, never>;
  };
};

type Tables = Database["public"]["Tables"];
type TablesInsert = { [K in keyof Tables]: Tables[K]["Insert"] };
type TablesUpdate = { [K in keyof Tables]: Tables[K]["Update"] };
type TablesRow = { [K in keyof Tables]: Tables[K]["Row"] };

export type TablesRowProducts = TablesRow["products"];
export type TablesRowUsers = TablesRow["users"];
export type TablesRowCustomers = TablesRow["customers"];
export type TablesRowSales = TablesRow["sales"];
export type TablesRowInstallmentPlans = TablesRow["installment_plans"];
export type TablesRowLorries = TablesRow["lorries"];
export type TablesRowWarehouses = TablesRow["warehouses"];
export type TablesRowSuppliers = TablesRow["suppliers"];
export type TablesRowCategories = TablesRow["categories"];
export type TablesRowBrands = TablesRow["brands"];
