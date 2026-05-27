export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_routes: {
        Row: {
          collector_id: string | null
          created_at: string | null
          id: string
          route_date: string
          route_name: string | null
          status: string | null
          target_area: string | null
          total_collected: number | null
          total_planned: number | null
        }
        Insert: {
          collector_id?: string | null
          created_at?: string | null
          id?: string
          route_date?: string
          route_name?: string | null
          status?: string | null
          target_area?: string | null
          total_collected?: number | null
          total_planned?: number | null
        }
        Update: {
          collector_id?: string | null
          created_at?: string | null
          id?: string
          route_date?: string
          route_name?: string | null
          status?: string | null
          target_area?: string | null
          total_collected?: number | null
          total_planned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_routes_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_visits: {
        Row: {
          amount_collected: number | null
          amount_due: number
          created_at: string | null
          customer_id: string | null
          gps_location: string | null
          id: string
          installment_plan_id: string | null
          notes: string | null
          receipt_number: string | null
          route_id: string | null
          status: Database["public"]["Enums"]["collection_status"] | null
          visit_time: string | null
        }
        Insert: {
          amount_collected?: number | null
          amount_due: number
          created_at?: string | null
          customer_id?: string | null
          gps_location?: string | null
          id?: string
          installment_plan_id?: string | null
          notes?: string | null
          receipt_number?: string | null
          route_id?: string | null
          status?: Database["public"]["Enums"]["collection_status"] | null
          visit_time?: string | null
        }
        Update: {
          amount_collected?: number | null
          amount_due?: number
          created_at?: string | null
          customer_id?: string | null
          gps_location?: string | null
          id?: string
          installment_plan_id?: string | null
          notes?: string | null
          receipt_number?: string | null
          route_id?: string | null
          status?: Database["public"]["Enums"]["collection_status"] | null
          visit_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_visits_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_visits_installment_plan_id_fkey"
            columns: ["installment_plan_id"]
            isOneToOne: false
            referencedRelation: "installment_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_visits_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "collection_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          commission_amount: number
          commission_rate: number
          created_at: string | null
          id: string
          notes: string | null
          paid_date: string | null
          sale_amount: number
          sale_id: string | null
          staff_id: string | null
          status: string | null
        }
        Insert: {
          commission_amount: number
          commission_rate: number
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          sale_amount: number
          sale_id?: string | null
          staff_id?: string | null
          status?: string | null
        }
        Update: {
          commission_amount?: number
          commission_rate?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          sale_amount?: number
          sale_id?: string | null
          staff_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string
          city: string | null
          created_at: string | null
          credit_score: number | null
          deleted_at: string | null
          email: string | null
          gps_location: string | null
          guarantor_name: string | null
          guarantor_nic: string | null
          guarantor_phone: string | null
          id: string
          name: string
          nic: string | null
          nic_image_url: string | null
          phone: string
          phone2: string | null
          photo_url: string | null
          signature_url: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          city?: string | null
          created_at?: string | null
          credit_score?: number | null
          deleted_at?: string | null
          email?: string | null
          gps_location?: string | null
          guarantor_name?: string | null
          guarantor_nic?: string | null
          guarantor_phone?: string | null
          id?: string
          name: string
          nic?: string | null
          nic_image_url?: string | null
          phone: string
          phone2?: string | null
          photo_url?: string | null
          signature_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          city?: string | null
          created_at?: string | null
          credit_score?: number | null
          deleted_at?: string | null
          email?: string | null
          gps_location?: string | null
          guarantor_name?: string | null
          guarantor_nic?: string | null
          guarantor_phone?: string | null
          id?: string
          name?: string
          nic?: string | null
          nic_image_url?: string | null
          phone?: string
          phone2?: string | null
          photo_url?: string | null
          signature_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          description: string | null
          expense_date: string
          expense_type: string
          id: string
          receipt_url: string | null
          recorded_by: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          description?: string | null
          expense_date?: string
          expense_type: string
          id?: string
          receipt_url?: string | null
          recorded_by?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          description?: string | null
          expense_date?: string
          expense_type?: string
          id?: string
          receipt_url?: string | null
          recorded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      installment_payments: {
        Row: {
          amount: number
          collected_by: string | null
          created_at: string | null
          id: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          plan_id: string | null
          receipt_number: string | null
          schedule_id: string | null
        }
        Insert: {
          amount: number
          collected_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          plan_id?: string | null
          receipt_number?: string | null
          schedule_id?: string | null
        }
        Update: {
          amount?: number
          collected_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          plan_id?: string | null
          receipt_number?: string | null
          schedule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "installment_payments_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installment_payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "installment_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installment_payments_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "installment_schedule"
            referencedColumns: ["id"]
          },
        ]
      }
      installment_plans: {
        Row: {
          created_at: string | null
          customer_id: string | null
          down_payment: number
          end_date: string | null
          financed_amount: number
          id: string
          interest_amount: number | null
          interest_rate: number | null
          lorry_id: string | null
          monthly_payment: number
          notes: string | null
          period_months: number
          plan_number: string
          staff_id: string | null
          start_date: string
          status: Database["public"]["Enums"]["payment_status"] | null
          total_amount: number
          total_payable: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          down_payment?: number
          end_date?: string | null
          financed_amount: number
          id?: string
          interest_amount?: number | null
          interest_rate?: number | null
          lorry_id?: string | null
          monthly_payment: number
          notes?: string | null
          period_months: number
          plan_number: string
          staff_id?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          total_amount: number
          total_payable: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          down_payment?: number
          end_date?: string | null
          financed_amount?: number
          id?: string
          interest_amount?: number | null
          interest_rate?: number | null
          lorry_id?: string | null
          monthly_payment?: number
          notes?: string | null
          period_months?: number
          plan_number?: string
          staff_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          total_amount?: number
          total_payable?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "installment_plans_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installment_plans_lorry_id_fkey"
            columns: ["lorry_id"]
            isOneToOne: false
            referencedRelation: "lorries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installment_plans_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      installment_schedule: {
        Row: {
          amount_due: number
          amount_paid: number | null
          created_at: string | null
          due_date: string
          id: string
          installment_number: number
          notes: string | null
          payment_date: string | null
          penalty_amount: number | null
          plan_id: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
        }
        Insert: {
          amount_due: number
          amount_paid?: number | null
          created_at?: string | null
          due_date: string
          id?: string
          installment_number: number
          notes?: string | null
          payment_date?: string | null
          penalty_amount?: number | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Update: {
          amount_due?: number
          amount_paid?: number | null
          created_at?: string | null
          due_date?: string
          id?: string
          installment_number?: number
          notes?: string | null
          payment_date?: string | null
          penalty_amount?: number | null
          plan_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "installment_schedule_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "installment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_lorry: {
        Row: {
          created_at: string | null
          id: string
          lorry_id: string | null
          product_id: string | null
          quantity: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lorry_id?: string | null
          product_id?: string | null
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lorry_id?: string | null
          product_id?: string | null
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_lorry_lorry_id_fkey"
            columns: ["lorry_id"]
            isOneToOne: false
            referencedRelation: "lorries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_lorry_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          created_at: string | null
          id: string
          lorry_id: string | null
          new_quantity: number
          notes: string | null
          performed_by: string | null
          previous_quantity: number
          product_id: string | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
          total_cost: number | null
          txn_type: Database["public"]["Enums"]["inventory_txn_type"]
          unit_cost: number | null
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lorry_id?: string | null
          new_quantity: number
          notes?: string | null
          performed_by?: string | null
          previous_quantity: number
          product_id?: string | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          total_cost?: number | null
          txn_type: Database["public"]["Enums"]["inventory_txn_type"]
          unit_cost?: number | null
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lorry_id?: string | null
          new_quantity?: number
          notes?: string | null
          performed_by?: string | null
          previous_quantity?: number
          product_id?: string | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          total_cost?: number | null
          txn_type?: Database["public"]["Enums"]["inventory_txn_type"]
          unit_cost?: number | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_lorry_id_fkey"
            columns: ["lorry_id"]
            isOneToOne: false
            referencedRelation: "lorries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_warehouse: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          reserved_quantity: number | null
          updated_at: string | null
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          reserved_quantity?: number | null
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          reserved_quantity?: number | null
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_warehouse_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_warehouse_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      lorries: {
        Row: {
          code: string
          created_at: string | null
          current_location: string | null
          driver_name: string | null
          driver_phone: string | null
          id: string
          name: string
          plate_number: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_location?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          name: string
          plate_number: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_location?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          name?: string
          plate_number?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      lorry_expenses: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          expense_date: string
          expense_type: string
          id: string
          lorry_id: string | null
          receipt_url: string | null
          recorded_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          expense_date?: string
          expense_type: string
          id?: string
          lorry_id?: string | null
          receipt_url?: string | null
          recorded_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          expense_date?: string
          expense_type?: string
          id?: string
          lorry_id?: string | null
          receipt_url?: string | null
          recorded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lorry_expenses_lorry_id_fkey"
            columns: ["lorry_id"]
            isOneToOne: false
            referencedRelation: "lorries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lorry_expenses_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lorry_routes: {
        Row: {
          created_at: string | null
          end_location: string | null
          id: string
          lorry_id: string | null
          notes: string | null
          route_date: string
          route_name: string | null
          start_location: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          end_location?: string | null
          id?: string
          lorry_id?: string | null
          notes?: string | null
          route_date: string
          route_name?: string | null
          start_location?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          end_location?: string | null
          id?: string
          lorry_id?: string | null
          notes?: string | null
          route_date?: string
          route_name?: string | null
          start_location?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lorry_routes_lorry_id_fkey"
            columns: ["lorry_id"]
            isOneToOne: false
            referencedRelation: "lorries"
            referencedColumns: ["id"]
          },
        ]
      }
      lorry_staff: {
        Row: {
          assigned_date: string
          id: string
          is_active: boolean | null
          lorry_id: string | null
          user_id: string | null
        }
        Insert: {
          assigned_date?: string
          id?: string
          is_active?: boolean | null
          lorry_id?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_date?: string
          id?: string
          is_active?: boolean | null
          lorry_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lorry_staff_lorry_id_fkey"
            columns: ["lorry_id"]
            isOneToOne: false
            referencedRelation: "lorries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lorry_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_serials: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          sale_id: string | null
          serial_number: string
          status: string | null
          warranty_end_date: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          sale_id?: string | null
          serial_number: string
          status?: string | null
          warranty_end_date?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          sale_id?: string | null
          serial_number?: string
          status?: string | null
          warranty_end_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_serials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          brand_id: string | null
          cash_price: number
          category_id: string | null
          code: string
          cost_price: number
          created_at: string | null
          deleted_at: string | null
          description: string | null
          has_serial: boolean | null
          id: string
          image_url: string | null
          installment_price: number
          is_active: boolean | null
          low_stock_threshold: number | null
          name: string
          updated_at: string | null
          warranty_months: number | null
          weight_kg: number | null
        }
        Insert: {
          barcode?: string | null
          brand_id?: string | null
          cash_price?: number
          category_id?: string | null
          code: string
          cost_price?: number
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          has_serial?: boolean | null
          id?: string
          image_url?: string | null
          installment_price?: number
          is_active?: boolean | null
          low_stock_threshold?: number | null
          name: string
          updated_at?: string | null
          warranty_months?: number | null
          weight_kg?: number | null
        }
        Update: {
          barcode?: string | null
          brand_id?: string | null
          cash_price?: number
          category_id?: string | null
          code?: string
          cost_price?: number
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          has_serial?: boolean | null
          id?: string
          image_url?: string | null
          installment_price?: number
          is_active?: boolean | null
          low_stock_threshold?: number | null
          name?: string
          updated_at?: string | null
          warranty_months?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          created_at: string | null
          id: string
          po_id: string | null
          product_id: string | null
          quantity: number
          received_quantity: number | null
          total_cost: number
          unit_cost: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          po_id?: string | null
          product_id?: string | null
          quantity: number
          received_quantity?: number | null
          total_cost: number
          unit_cost: number
        }
        Update: {
          created_at?: string | null
          id?: string
          po_id?: string | null
          product_id?: string | null
          quantity?: number
          received_quantity?: number | null
          total_cost?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string | null
          created_by: string | null
          expected_date: string | null
          id: string
          notes: string | null
          order_date: string
          po_number: string
          status: string | null
          subtotal: number | null
          supplier_id: string | null
          tax_amount: number | null
          total: number | null
          updated_at: string | null
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number: string
          status?: string | null
          subtotal?: number | null
          supplier_id?: string | null
          tax_amount?: number | null
          total?: number | null
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expected_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          po_number?: string
          status?: string | null
          subtotal?: number | null
          supplier_id?: string | null
          tax_amount?: number | null
          total?: number | null
          updated_at?: string | null
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          label: string
          name: string
          permissions: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          label: string
          name: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          label?: string
          name?: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          sale_id: string | null
          serial_id: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity: number
          sale_id?: string | null
          serial_id?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          sale_id?: string | null
          serial_id?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_serial_id_fkey"
            columns: ["serial_id"]
            isOneToOne: false
            referencedRelation: "product_serials"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string | null
          customer_id: string | null
          discount: number | null
          id: string
          installment_plan_id: string | null
          invoice_number: string
          lorry_id: string | null
          notes: string | null
          payment_method: string | null
          sale_date: string | null
          sale_type: Database["public"]["Enums"]["sale_type"]
          staff_id: string | null
          status: string | null
          subtotal: number
          total: number
          warehouse_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          discount?: number | null
          id?: string
          installment_plan_id?: string | null
          invoice_number: string
          lorry_id?: string | null
          notes?: string | null
          payment_method?: string | null
          sale_date?: string | null
          sale_type: Database["public"]["Enums"]["sale_type"]
          staff_id?: string | null
          status?: string | null
          subtotal: number
          total: number
          warehouse_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          discount?: number | null
          id?: string
          installment_plan_id?: string | null
          invoice_number?: string
          lorry_id?: string | null
          notes?: string | null
          payment_method?: string | null
          sale_date?: string | null
          sale_type?: Database["public"]["Enums"]["sale_type"]
          staff_id?: string | null
          status?: string | null
          subtotal?: number
          total?: number
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_installment_plan_id_fkey"
            columns: ["installment_plan_id"]
            isOneToOne: false
            referencedRelation: "installment_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_lorry_id_fkey"
            columns: ["lorry_id"]
            isOneToOne: false
            referencedRelation: "lorries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          code: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          code?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          code?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string | null
          commission_rate: number | null
          created_at: string | null
          deleted_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          lorry_id: string | null
          name: string
          nic: string | null
          phone: string | null
          photo_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          commission_rate?: number | null
          created_at?: string | null
          deleted_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          lorry_id?: string | null
          name: string
          nic?: string | null
          phone?: string | null
          photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          commission_rate?: number | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          lorry_id?: string | null
          name?: string
          nic?: string | null
          phone?: string | null
          photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          address: string | null
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          manager_id: string | null
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      collection_status: "pending" | "collected" | "missed" | "partial"
      inventory_txn_type:
        | "purchase_in"
        | "sale_out"
        | "transfer_in"
        | "transfer_out"
        | "adjustment_add"
        | "adjustment_subtract"
        | "damaged"
        | "returned"
      payment_status: "pending" | "paid" | "overdue" | "defaulted" | "settled"
      sale_type: "cash" | "installment"
      user_role:
        | "admin"
        | "stock_manager"
        | "lorry_manager"
        | "sales_staff"
        | "collector"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      collection_status: ["pending", "collected", "missed", "partial"],
      inventory_txn_type: [
        "purchase_in",
        "sale_out",
        "transfer_in",
        "transfer_out",
        "adjustment_add",
        "adjustment_subtract",
        "damaged",
        "returned",
      ],
      payment_status: ["pending", "paid", "overdue", "defaulted", "settled"],
      sale_type: ["cash", "installment"],
      user_role: [
        "admin",
        "stock_manager",
        "lorry_manager",
        "sales_staff",
        "collector",
      ],
    },
  },
} as const
