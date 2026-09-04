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
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          banner_url: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      business_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "business_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      coupon_usage: {
        Row: {
          coupon_id: string
          created_at: string
          customer_id: string
          discount_amount: number
          id: string
          order_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string
          customer_id: string
          discount_amount: number
          id?: string
          order_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string
          customer_id?: string
          discount_amount?: number
          id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          category_ids: string[] | null
          code: string
          created_at: string
          current_uses: number
          description: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          max_uses_per_customer: number | null
          max_uses_total: number | null
          min_purchase: number | null
          name: string
          product_ids: string[] | null
          starts_at: string | null
          type: Database["public"]["Enums"]["coupon_type"]
          updated_at: string
          value: number
        }
        Insert: {
          category_ids?: string[] | null
          code: string
          created_at?: string
          current_uses?: number
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_uses_per_customer?: number | null
          max_uses_total?: number | null
          min_purchase?: number | null
          name: string
          product_ids?: string[] | null
          starts_at?: string | null
          type: Database["public"]["Enums"]["coupon_type"]
          updated_at?: string
          value: number
        }
        Update: {
          category_ids?: string[] | null
          code?: string
          created_at?: string
          current_uses?: number
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_uses_per_customer?: number | null
          max_uses_total?: number | null
          min_purchase?: number | null
          name?: string
          product_ids?: string[] | null
          starts_at?: string | null
          type?: Database["public"]["Enums"]["coupon_type"]
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          address_line: string
          city: string
          created_at: string
          customer_id: string
          full_name: string
          id: string
          is_default: boolean
          label: string | null
          reference: string | null
          state: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          address_line: string
          city: string
          created_at?: string
          customer_id: string
          full_name: string
          id?: string
          is_default?: boolean
          label?: string | null
          reference?: string | null
          state: string
          updated_at?: string
          whatsapp: string
        }
        Update: {
          address_line?: string
          city?: string
          created_at?: string
          customer_id?: string
          full_name?: string
          id?: string
          is_default?: boolean
          label?: string | null
          reference?: string | null
          state?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          id: string
          is_wholesale: boolean
          notes: string | null
          profile_id: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_wholesale?: boolean
          notes?: string | null
          profile_id: string
          updated_at?: string
          whatsapp: string
        }
        Update: {
          created_at?: string
          id?: string
          is_wholesale?: boolean
          notes?: string | null
          profile_id?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          previous_rate: number | null
          rate: number
          set_by: string | null
          source: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          previous_rate?: number | null
          rate: number
          set_by?: string | null
          source?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          previous_rate?: number | null
          rate?: number
          set_by?: string | null
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "exchange_rates_set_by_fkey"
            columns: ["set_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          id: string
          movement_type: Database["public"]["Enums"]["inventory_movement_type"]
          performed_by: string | null
          product_id: string
          quantity: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          movement_type: Database["public"]["Enums"]["inventory_movement_type"]
          performed_by?: string | null
          product_id: string
          quantity: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          movement_type?: Database["public"]["Enums"]["inventory_movement_type"]
          performed_by?: string | null
          product_id?: string
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_events: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"] | null
          created_at: string
          error: string | null
          event_type: string
          id: string
          reference_id: string | null
          reference_type: string | null
          success: boolean
          user_id: string | null
        }
        Insert: {
          channel?: Database["public"]["Enums"]["notification_channel"] | null
          created_at?: string
          error?: string | null
          event_type: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          success?: boolean
          user_id?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"] | null
          created_at?: string
          error?: string | null
          event_type?: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          success?: boolean
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          read_at: string | null
          sent_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          read_at?: string | null
          sent_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          read_at?: string | null
          sent_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          discount: number
          id: string
          order_id: string
          price: number
          product_id: string
          product_name: string
          product_sku: string
          quantity: number
          subtotal: number
          variant_id: string | null
          variant_name: string | null
        }
        Insert: {
          created_at?: string
          discount?: number
          id?: string
          order_id: string
          price: number
          product_id: string
          product_name: string
          product_sku: string
          quantity: number
          subtotal: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Update: {
          created_at?: string
          discount?: number
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          product_name?: string
          product_sku?: string
          quantity?: number
          subtotal?: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_payments: {
        Row: {
          amount: number
          amount_local: number | null
          created_at: string
          currency: string
          exchange_rate: number | null
          id: string
          notes: string | null
          order_id: string
          payment_method_id: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          amount_local?: number | null
          created_at?: string
          currency?: string
          exchange_rate?: number | null
          id?: string
          notes?: string | null
          order_id: string
          payment_method_id: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          amount_local?: number | null
          created_at?: string
          currency?: string
          exchange_rate?: number | null
          id?: string
          notes?: string | null
          order_id?: string
          payment_method_id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_payments_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_sequences: {
        Row: {
          last_number: number
          year: number
        }
        Insert: {
          last_number?: number
          year: number
        }
        Update: {
          last_number?: number
          year?: number
        }
        Relationships: []
      }
      order_shipping: {
        Row: {
          carrier_id: string | null
          cost: number
          created_at: string
          delivered_at: string | null
          estimated_date: string | null
          id: string
          notes: string | null
          order_id: string
          shipped_at: string | null
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
        }
        Insert: {
          carrier_id?: string | null
          cost?: number
          created_at?: string
          delivered_at?: string | null
          estimated_date?: string | null
          id?: string
          notes?: string | null
          order_id: string
          shipped_at?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
        }
        Update: {
          carrier_id?: string | null
          cost?: number
          created_at?: string
          delivered_at?: string | null
          estimated_date?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          shipped_at?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_shipping_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "shipping_carriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_shipping_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["order_status"]
          notes: string | null
          old_status: Database["public"]["Enums"]["order_status"] | null
          order_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["order_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["order_status"] | null
          order_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["order_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["order_status"] | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_id: string | null
          admin_notes: string | null
          cancelled_at: string | null
          coupon_id: string | null
          created_at: string
          currency: string
          customer_id: string
          customer_notes: string | null
          delivered_at: string | null
          delivery_method: Database["public"]["Enums"]["delivery_method"]
          discount_total: number
          exchange_rate: number | null
          id: string
          order_number: string
          paid_at: string | null
          payment_method_id: string | null
          pickup_confirmed: boolean
          pickup_date: string | null
          pickup_notes: string | null
          pickup_time: string | null
          promotion_id: string | null
          reservation_expires_at: string | null
          shipped_at: string | null
          shipping_cost: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          total_local: number | null
          updated_at: string
        }
        Insert: {
          address_id?: string | null
          admin_notes?: string | null
          cancelled_at?: string | null
          coupon_id?: string | null
          created_at?: string
          currency?: string
          customer_id: string
          customer_notes?: string | null
          delivered_at?: string | null
          delivery_method?: Database["public"]["Enums"]["delivery_method"]
          discount_total?: number
          exchange_rate?: number | null
          id?: string
          order_number: string
          paid_at?: string | null
          payment_method_id?: string | null
          pickup_confirmed?: boolean
          pickup_date?: string | null
          pickup_notes?: string | null
          pickup_time?: string | null
          promotion_id?: string | null
          reservation_expires_at?: string | null
          shipped_at?: string | null
          shipping_cost?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          total_local?: number | null
          updated_at?: string
        }
        Update: {
          address_id?: string | null
          admin_notes?: string | null
          cancelled_at?: string | null
          coupon_id?: string | null
          created_at?: string
          currency?: string
          customer_id?: string
          customer_notes?: string | null
          delivered_at?: string | null
          delivery_method?: Database["public"]["Enums"]["delivery_method"]
          discount_total?: number
          exchange_rate?: number | null
          id?: string
          order_number?: string
          paid_at?: string | null
          payment_method_id?: string | null
          pickup_confirmed?: boolean
          pickup_date?: string | null
          pickup_notes?: string | null
          pickup_time?: string | null
          promotion_id?: string | null
          reservation_expires_at?: string | null
          shipped_at?: string | null
          shipping_cost?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          total_local?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "customer_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          created_at: string
          currency: string
          id: string
          instructions: string | null
          is_active: boolean
          name: string
          payment_data: Json | null
          payment_link: string | null
          requires_receipt: boolean
          requires_verification: boolean
          sort_order: number
          type: Database["public"]["Enums"]["payment_method_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          instructions?: string | null
          is_active?: boolean
          name: string
          payment_data?: Json | null
          payment_link?: string | null
          requires_receipt?: boolean
          requires_verification?: boolean
          sort_order?: number
          type?: Database["public"]["Enums"]["payment_method_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          instructions?: string | null
          is_active?: boolean
          name?: string
          payment_data?: Json | null
          payment_link?: string | null
          requires_receipt?: boolean
          requires_verification?: boolean
          sort_order?: number
          type?: Database["public"]["Enums"]["payment_method_type"]
          updated_at?: string
        }
        Relationships: []
      }
      payment_receipts: {
        Row: {
          created_at: string
          file_name: string | null
          file_type: string | null
          file_url: string
          id: string
          payment_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          payment_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          payment_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_receipts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "order_payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_receipts_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          product_id: string
          sort_order: number
          url: string
          variant_id: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
          url: string
          variant_id?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
          url?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_questions: {
        Row: {
          answer: string | null
          answered_at: string | null
          answered_by: string | null
          created_at: string
          customer_id: string
          id: string
          is_visible: boolean
          product_id: string
          question: string
          updated_at: string
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          created_at?: string
          customer_id: string
          id?: string
          is_visible?: boolean
          product_id: string
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          is_visible?: boolean
          product_id?: string
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_questions_answered_by_fkey"
            columns: ["answered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_questions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_questions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          attributes: Json
          compare_at_price: number | null
          cost: number | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          max_per_order: number | null
          name: string
          price: number | null
          product_id: string
          sku: string
          sort_order: number
          stock: number
          stock_minimum: number
          stock_reserved: number
          updated_at: string
        }
        Insert: {
          attributes?: Json
          compare_at_price?: number | null
          cost?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_per_order?: number | null
          name: string
          price?: number | null
          product_id: string
          sku: string
          sort_order?: number
          stock?: number
          stock_minimum?: number
          stock_reserved?: number
          updated_at?: string
        }
        Update: {
          attributes?: Json
          compare_at_price?: number | null
          cost?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_per_order?: number | null
          name?: string
          price?: number | null
          product_id?: string
          sku?: string
          sort_order?: number
          stock?: number
          stock_minimum?: number
          stock_reserved?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand_id: string | null
          category_id: string | null
          compare_at_price: number | null
          cost: number | null
          created_at: string
          currency: string
          description: string | null
          id: string
          is_featured: boolean
          is_new: boolean
          max_per_order: number | null
          name: string
          price: number
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          sku: string
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          stock: number
          stock_minimum: number
          stock_reserved: number
          subcategory_id: string | null
          tags: string[] | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          brand_id?: string | null
          category_id?: string | null
          compare_at_price?: number | null
          cost?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          is_new?: boolean
          max_per_order?: number | null
          name: string
          price: number
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sku: string
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          stock?: number
          stock_minimum?: number
          stock_reserved?: number
          subcategory_id?: string | null
          tags?: string[] | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          brand_id?: string | null
          category_id?: string | null
          compare_at_price?: number | null
          cost?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          is_new?: boolean
          max_per_order?: number | null
          name?: string
          price?: number
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sku?: string
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          stock?: number
          stock_minimum?: number
          stock_reserved?: number
          subcategory_id?: string | null
          tags?: string[] | null
          updated_at?: string
          weight?: number | null
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
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          email_verified: boolean
          full_name: string
          id: string
          is_active: boolean
          last_login_at: string | null
          role: Database["public"]["Enums"]["user_role"]
          two_factor_enabled: boolean
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          email: string
          email_verified?: boolean
          full_name: string
          id: string
          is_active?: boolean
          last_login_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          two_factor_enabled?: boolean
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          email_verified?: boolean
          full_name?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          two_factor_enabled?: boolean
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      promotions: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          name: string
          product_id: string | null
          starts_at: string | null
          type: Database["public"]["Enums"]["promotion_type"]
          updated_at: string
          value: number
          variant_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          name: string
          product_id?: string | null
          starts_at?: string | null
          type: Database["public"]["Enums"]["promotion_type"]
          updated_at?: string
          value: number
          variant_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          product_id?: string | null
          starts_at?: string | null
          type?: Database["public"]["Enums"]["promotion_type"]
          updated_at?: string
          value?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      quantity_discounts: {
        Row: {
          created_at: string
          discount_type: Database["public"]["Enums"]["promotion_type"]
          discount_value: number
          id: string
          is_active: boolean
          min_quantity: number
          product_id: string | null
          updated_at: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          discount_type: Database["public"]["Enums"]["promotion_type"]
          discount_value: number
          id?: string
          is_active?: boolean
          min_quantity: number
          product_id?: string | null
          updated_at?: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          discount_type?: Database["public"]["Enums"]["promotion_type"]
          discount_value?: number
          id?: string
          is_active?: boolean
          min_quantity?: number
          product_id?: string | null
          updated_at?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quantity_discounts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quantity_discounts_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      review_photos: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          review_id: string
          sort_order: number
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          review_id: string
          sort_order?: number
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          review_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_photos_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          customer_id: string
          id: string
          moderated_at: string | null
          moderated_by: string | null
          order_id: string
          product_id: string
          rating: number
          status: Database["public"]["Enums"]["review_status"]
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          customer_id: string
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          order_id: string
          product_id: string
          rating: number
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          order_id?: string
          product_id?: string
          rating?: number
          status?: Database["public"]["Enums"]["review_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          action: string
          allowed: boolean
          created_at: string
          id: string
          module: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          action: string
          allowed?: boolean
          created_at?: string
          id?: string
          module: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          action?: string
          allowed?: boolean
          created_at?: string
          id?: string
          module?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      shipping_carriers: {
        Row: {
          cost: number
          created_at: string
          id: string
          is_active: boolean
          name: string
          notes: string | null
          slug: string
          sort_order: number
          tracking_url: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          cost?: number
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          slug: string
          sort_order?: number
          tracking_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          cost?: number
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          slug?: string
          sort_order?: number
          tracking_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      stock_reservations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          order_id: string | null
          product_id: string
          quantity: number
          released_at: string | null
          released_reason: string | null
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          order_id?: string | null
          product_id: string
          quantity: number
          released_at?: string | null
          released_reason?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          order_id?: string | null
          product_id?: string
          quantity?: number
          released_at?: string | null
          released_reason?: string | null
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_stock_reservations_order_id"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reservations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reservations_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          product_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_stock_reservation: {
        Args: {
          p_expires_at: string
          p_order_id: string
          p_product_id: string
          p_quantity: number
          p_variant_id: string
        }
        Returns: string
      }
      decrement_stock: {
        Args: {
          p_order_id: string
          p_performed_by?: string
          p_product_id: string
          p_quantity: number
          p_variant_id: string
        }
        Returns: boolean
      }
      expire_overdue_reservations: { Args: never; Returns: number }
      generate_order_number: { Args: never; Returns: string }
      get_available_stock: {
        Args: { p_product_id: string; p_variant_id?: string }
        Returns: number
      }
      get_customer_id: { Args: never; Returns: string }
      has_role: {
        Args: { required_role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      claim_resolution:
        | "same_product"
        | "equivalent_product"
        | "product_combination"
      claim_status: "pending" | "approved" | "rejected" | "resolved"
      coupon_type: "percentage" | "fixed_amount"
      delivery_method: "shipping" | "pickup"
      inventory_movement_type:
        | "entry"
        | "exit"
        | "adjustment"
        | "reservation"
        | "release"
        | "sale"
        | "return"
      notification_channel: "system" | "email" | "whatsapp"
      order_status:
        | "pending_payment"
        | "payment_verification"
        | "payment_approved"
        | "preparing"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "cancelled_expired"
        | "payment_rejected"
        | "returned"
      payment_method_type: "automatic" | "manual"
      payment_status:
        | "pending"
        | "verification"
        | "approved"
        | "rejected"
        | "refunded"
      product_status: "active" | "inactive" | "archived"
      promotion_type: "percentage" | "fixed_amount"
      reservation_status: "active" | "consumed" | "cancelled" | "expired"
      review_status: "pending" | "approved" | "rejected" | "hidden"
      user_role:
        | "customer"
        | "superadmin"
        | "admin"
        | "orders"
        | "inventory"
        | "products"
        | "customer_service"
        | "finance"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      claim_resolution: [
        "same_product",
        "equivalent_product",
        "product_combination",
      ],
      claim_status: ["pending", "approved", "rejected", "resolved"],
      coupon_type: ["percentage", "fixed_amount"],
      delivery_method: ["shipping", "pickup"],
      inventory_movement_type: [
        "entry",
        "exit",
        "adjustment",
        "reservation",
        "release",
        "sale",
        "return",
      ],
      notification_channel: ["system", "email", "whatsapp"],
      order_status: [
        "pending_payment",
        "payment_verification",
        "payment_approved",
        "preparing",
        "shipped",
        "delivered",
        "cancelled",
        "cancelled_expired",
        "payment_rejected",
        "returned",
      ],
      payment_method_type: ["automatic", "manual"],
      payment_status: [
        "pending",
        "verification",
        "approved",
        "rejected",
        "refunded",
      ],
      product_status: ["active", "inactive", "archived"],
      promotion_type: ["percentage", "fixed_amount"],
      reservation_status: ["active", "consumed", "cancelled", "expired"],
      review_status: ["pending", "approved", "rejected", "hidden"],
      user_role: [
        "customer",
        "superadmin",
        "admin",
        "orders",
        "inventory",
        "products",
        "customer_service",
        "finance",
      ],
    },
  },
} as const
