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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          address: string
          created_at: string | null
          detail: string | null
          id: string
          is_default: boolean | null
          label: string | null
          lat: number
          lng: number
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string | null
          detail?: string | null
          id?: string
          is_default?: boolean | null
          label?: string | null
          lat: number
          lng: number
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string | null
          detail?: string | null
          id?: string
          is_default?: boolean | null
          label?: string | null
          lat?: number
          lng?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisements: {
        Row: {
          amount: number
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          payment_id: string | null
          payment_status: string
          plan_type: string
          restaurant_id: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          payment_id?: string | null
          payment_status: string
          plan_type: string
          restaurant_id: string
          start_date?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          payment_id?: string | null
          payment_status?: string
          plan_type?: string
          restaurant_id?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advertisements_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      cancellation_status_history: {
        Row: {
          cancellation_id: string
          change_reason: string | null
          changed_by: string | null
          created_at: string | null
          id: string
          is_auto_change: boolean | null
          new_owner_action: string | null
          new_status: string
          previous_owner_action: string | null
          previous_status: string | null
        }
        Insert: {
          cancellation_id: string
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          is_auto_change?: boolean | null
          new_owner_action?: string | null
          new_status: string
          previous_owner_action?: string | null
          previous_status?: string | null
        }
        Update: {
          cancellation_id?: string
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          id?: string
          is_auto_change?: boolean | null
          new_owner_action?: string | null
          new_status?: string
          previous_owner_action?: string | null
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cancellation_status_history_cancellation_id_fkey"
            columns: ["cancellation_id"]
            isOneToOne: false
            referencedRelation: "order_cancellations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cancellation_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          message_type: string | null
          room_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          message_type?: string | null
          room_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          message_type?: string | null
          room_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          created_at: string | null
          id: string
          last_read_at: string | null
          role: string
          room_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_read_at?: string | null
          role: string
          room_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_read_at?: string | null
          role?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          min_order_amount: number | null
          name: string
          restaurant_id: string | null
          start_date: string
          total_quantity: number | null
          used_quantity: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          name: string
          restaurant_id?: string | null
          start_date: string
          total_quantity?: number | null
          used_quantity?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          name?: string
          restaurant_id?: string | null
          start_date?: string
          total_quantity?: number | null
          used_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          restaurant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          restaurant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          restaurant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          restaurant_id: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          restaurant_id: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          restaurant_id?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_option_groups: {
        Row: {
          created_at: string | null
          id: string
          is_required: boolean | null
          max_selections: number | null
          menu_id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          max_selections?: number | null
          menu_id: string
          name: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          max_selections?: number | null
          menu_id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_option_groups_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_options: {
        Row: {
          created_at: string | null
          id: string
          is_available: boolean | null
          name: string
          option_group_id: string
          price: number | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          name: string
          option_group_id: string
          price?: number | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_available?: boolean | null
          name?: string
          option_group_id?: string
          price?: number | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_options_option_group_id_fkey"
            columns: ["option_group_id"]
            isOneToOne: false
            referencedRelation: "menu_option_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          category: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_popular: boolean | null
          name: string
          price: number
          restaurant_id: string
          sort_order: number | null
        }
        Insert: {
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_popular?: boolean | null
          name: string
          price: number
          restaurant_id: string
          sort_order?: number | null
        }
        Update: {
          category?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_popular?: boolean | null
          name?: string
          price?: number
          restaurant_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "menus_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menus_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          next_retry_at: string | null
          notification_id: string
          provider_response: Json | null
          retry_count: number
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_send_status"]
        }
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          next_retry_at?: string | null
          notification_id: string
          provider_response?: Json | null
          retry_count?: number
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_send_status"]
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          next_retry_at?: string | null
          notification_id?: string
          provider_response?: Json | null
          retry_count?: number
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_send_status"]
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          cancellation_updates: boolean
          created_at: string
          email_enabled: boolean
          id: string
          order_updates: boolean
          promotion_updates: boolean
          push_enabled: boolean
          quiet_hours_enabled: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          review_reminders: boolean
          sms_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          cancellation_updates?: boolean
          created_at?: string
          email_enabled?: boolean
          id?: string
          order_updates?: boolean
          promotion_updates?: boolean
          push_enabled?: boolean
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          review_reminders?: boolean
          sms_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          cancellation_updates?: boolean
          created_at?: string
          email_enabled?: boolean
          id?: string
          order_updates?: boolean
          promotion_updates?: boolean
          push_enabled?: boolean
          quiet_hours_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          review_reminders?: boolean
          sms_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          priority: Database["public"]["Enums"]["notification_priority"]
          read_at: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          read_at?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          read_at?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
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
      order_cancellations: {
        Row: {
          approval_deadline: string | null
          approved_at: string | null
          approved_by: string | null
          auto_approved: boolean | null
          can_refund_coupon: boolean | null
          can_refund_points: boolean | null
          cancel_type: string
          completed_at: string | null
          coupon_refunded: boolean | null
          created_at: string | null
          delivery_refund_amount: number
          id: string
          menu_refund_amount: number
          order_id: string
          owner_action: string | null
          owner_action_at: string | null
          owner_action_by: string | null
          owner_rejection_reason: string | null
          points_refunded: boolean | null
          reason: string
          reason_detail: string | null
          refund_amount: number
          refund_rate: number
          rejected_reason: string | null
          requested_by: string
          status: string
          updated_at: string | null
        }
        Insert: {
          approval_deadline?: string | null
          approved_at?: string | null
          approved_by?: string | null
          auto_approved?: boolean | null
          can_refund_coupon?: boolean | null
          can_refund_points?: boolean | null
          cancel_type: string
          completed_at?: string | null
          coupon_refunded?: boolean | null
          created_at?: string | null
          delivery_refund_amount?: number
          id?: string
          menu_refund_amount?: number
          order_id: string
          owner_action?: string | null
          owner_action_at?: string | null
          owner_action_by?: string | null
          owner_rejection_reason?: string | null
          points_refunded?: boolean | null
          reason: string
          reason_detail?: string | null
          refund_amount?: number
          refund_rate?: number
          rejected_reason?: string | null
          requested_by: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          approval_deadline?: string | null
          approved_at?: string | null
          approved_by?: string | null
          auto_approved?: boolean | null
          can_refund_coupon?: boolean | null
          can_refund_points?: boolean | null
          cancel_type?: string
          completed_at?: string | null
          coupon_refunded?: boolean | null
          created_at?: string | null
          delivery_refund_amount?: number
          id?: string
          menu_refund_amount?: number
          order_id?: string
          owner_action?: string | null
          owner_action_at?: string | null
          owner_action_by?: string | null
          owner_rejection_reason?: string | null
          points_refunded?: boolean | null
          reason?: string
          reason_detail?: string | null
          refund_amount?: number
          refund_rate?: number
          rejected_reason?: string | null
          requested_by?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_cancellations_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_cancellations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_cancellations_owner_action_by_fkey"
            columns: ["owner_action_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_cancellations_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_delivery_notifications: {
        Row: {
          created_at: string | null
          id: string
          notified_100m: boolean | null
          notified_100m_at: string | null
          notified_500m: boolean | null
          notified_500m_at: string | null
          order_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notified_100m?: boolean | null
          notified_100m_at?: string | null
          notified_500m?: boolean | null
          notified_500m_at?: string | null
          order_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notified_100m?: boolean | null
          notified_100m_at?: string | null
          notified_500m?: boolean | null
          notified_500m_at?: string | null
          order_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_delivery_notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          menu_id: string
          menu_image: string | null
          menu_name: string
          options: Json | null
          order_id: string
          price: number
          quantity: number
          restaurant_id: string | null
          special_instructions: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_id: string
          menu_image?: string | null
          menu_name: string
          options?: Json | null
          order_id: string
          price: number
          quantity: number
          restaurant_id?: string | null
          special_instructions?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_id?: string
          menu_image?: string | null
          menu_name?: string
          options?: Json | null
          order_id?: string
          price?: number
          quantity?: number
          restaurant_id?: string | null
          special_instructions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          changed_by_user_id: string | null
          created_at: string | null
          id: string
          new_status: string
          note: string | null
          order_id: string
          previous_status: string | null
          status: string | null
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          changed_by_user_id?: string | null
          created_at?: string | null
          id?: string
          new_status: string
          note?: string | null
          order_id: string
          previous_status?: string | null
          status?: string | null
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          changed_by_user_id?: string | null
          created_at?: string | null
          id?: string
          new_status?: string
          note?: string | null
          order_id?: string
          previous_status?: string | null
          status?: string | null
        }
        Relationships: [
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
          actual_delivery_time: string | null
          cancel_requested_at: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cancelled_reason: string | null
          confirmed_at: string | null
          coupon_id: string | null
          coupon_name: string | null
          created_at: string | null
          delivery_address: string
          delivery_detail: string | null
          delivery_fee: number | null
          delivery_instructions: string | null
          delivery_lat: number
          delivery_lng: number
          discount_amount: number | null
          disposable_items: boolean | null
          estimated_delivery_time: string | null
          estimated_prep_time: number | null
          id: string
          menu_amount: number | null
          order_number: string | null
          payment_key: string | null
          payment_method: string | null
          payment_status: string | null
          picked_up_at: string | null
          platform_fee: number | null
          points_used: number | null
          prepared_at: string | null
          refunded_amount: number | null
          rejection_detail: string | null
          rejection_reason: string | null
          restaurant_id: string
          restaurant_image: string | null
          restaurant_name: string | null
          restaurant_phone: string | null
          rider_assigned_at: string | null
          rider_id: string | null
          rider_name: string | null
          rider_phone: string | null
          special_instructions: string | null
          status: string
          total_amount: number
          updated_at: string | null
          used_points: number | null
          user_id: string
        }
        Insert: {
          actual_delivery_time?: string | null
          cancel_requested_at?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancelled_reason?: string | null
          confirmed_at?: string | null
          coupon_id?: string | null
          coupon_name?: string | null
          created_at?: string | null
          delivery_address: string
          delivery_detail?: string | null
          delivery_fee?: number | null
          delivery_instructions?: string | null
          delivery_lat: number
          delivery_lng: number
          discount_amount?: number | null
          disposable_items?: boolean | null
          estimated_delivery_time?: string | null
          estimated_prep_time?: number | null
          id?: string
          menu_amount?: number | null
          order_number?: string | null
          payment_key?: string | null
          payment_method?: string | null
          payment_status?: string | null
          picked_up_at?: string | null
          platform_fee?: number | null
          points_used?: number | null
          prepared_at?: string | null
          refunded_amount?: number | null
          rejection_detail?: string | null
          rejection_reason?: string | null
          restaurant_id: string
          restaurant_image?: string | null
          restaurant_name?: string | null
          restaurant_phone?: string | null
          rider_assigned_at?: string | null
          rider_id?: string | null
          rider_name?: string | null
          rider_phone?: string | null
          special_instructions?: string | null
          status?: string
          total_amount: number
          updated_at?: string | null
          used_points?: number | null
          user_id: string
        }
        Update: {
          actual_delivery_time?: string | null
          cancel_requested_at?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cancelled_reason?: string | null
          confirmed_at?: string | null
          coupon_id?: string | null
          coupon_name?: string | null
          created_at?: string | null
          delivery_address?: string
          delivery_detail?: string | null
          delivery_fee?: number | null
          delivery_instructions?: string | null
          delivery_lat?: number
          delivery_lng?: number
          discount_amount?: number | null
          disposable_items?: boolean | null
          estimated_delivery_time?: string | null
          estimated_prep_time?: number | null
          id?: string
          menu_amount?: number | null
          order_number?: string | null
          payment_key?: string | null
          payment_method?: string | null
          payment_status?: string | null
          picked_up_at?: string | null
          platform_fee?: number | null
          points_used?: number | null
          prepared_at?: string | null
          refunded_amount?: number | null
          rejection_detail?: string | null
          rejection_reason?: string | null
          restaurant_id?: string
          restaurant_image?: string | null
          restaurant_name?: string | null
          restaurant_phone?: string | null
          rider_assigned_at?: string | null
          rider_id?: string | null
          rider_name?: string | null
          rider_phone?: string | null
          special_instructions?: string | null
          status?: string
          total_amount?: number
          updated_at?: string | null
          used_points?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "riders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      point_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string | null
          description: string | null
          expires_at: string | null
          id: string
          order_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          order_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          order_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          created_at: string
          device_id: string | null
          device_name: string | null
          id: string
          is_active: boolean
          last_used_at: string
          platform: Database["public"]["Enums"]["device_platform"]
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          device_name?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string
          platform: Database["public"]["Enums"]["device_platform"]
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_id?: string | null
          device_name?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string
          platform?: Database["public"]["Enums"]["device_platform"]
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      refunds: {
        Row: {
          amount: number
          cancellation_id: string | null
          completed_at: string | null
          created_at: string | null
          error_code: string | null
          error_message: string | null
          id: string
          max_retry_count: number | null
          next_retry_at: string | null
          order_id: string
          original_amount: number
          payment_key: string | null
          payment_method: string
          pg_response: Json | null
          pg_tid: string | null
          refund_rate: number
          refund_status: string
          retry_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          cancellation_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          max_retry_count?: number | null
          next_retry_at?: string | null
          order_id: string
          original_amount: number
          payment_key?: string | null
          payment_method: string
          pg_response?: Json | null
          pg_tid?: string | null
          refund_rate?: number
          refund_status?: string
          retry_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          cancellation_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          error_code?: string | null
          error_message?: string | null
          id?: string
          max_retry_count?: number | null
          next_retry_at?: string | null
          order_id?: string
          original_amount?: number
          payment_key?: string | null
          payment_method?: string
          pg_response?: Json | null
          pg_tid?: string | null
          refund_rate?: number
          refund_status?: string
          retry_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_cancellation_id_fkey"
            columns: ["cancellation_id"]
            isOneToOne: false
            referencedRelation: "order_cancellations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          ad_expires_at: string | null
          ad_priority: number | null
          address: string
          business_hours: Json | null
          business_number: string | null
          category_id: string | null
          created_at: string | null
          delivery_fee: number | null
          description: string | null
          estimated_delivery_time: number | null
          id: string
          image_url: string | null
          is_advertised: boolean | null
          is_open: boolean | null
          lat: number
          lng: number
          min_order_amount: number | null
          name: string
          owner_id: string
          phone: string
          rating: number | null
          review_count: number | null
          updated_at: string | null
        }
        Insert: {
          ad_expires_at?: string | null
          ad_priority?: number | null
          address: string
          business_hours?: Json | null
          business_number?: string | null
          category_id?: string | null
          created_at?: string | null
          delivery_fee?: number | null
          description?: string | null
          estimated_delivery_time?: number | null
          id?: string
          image_url?: string | null
          is_advertised?: boolean | null
          is_open?: boolean | null
          lat: number
          lng: number
          min_order_amount?: number | null
          name: string
          owner_id: string
          phone: string
          rating?: number | null
          review_count?: number | null
          updated_at?: string | null
        }
        Update: {
          ad_expires_at?: string | null
          ad_priority?: number | null
          address?: string
          business_hours?: Json | null
          business_number?: string | null
          category_id?: string | null
          created_at?: string | null
          delivery_fee?: number | null
          description?: string | null
          estimated_delivery_time?: number | null
          id?: string
          image_url?: string | null
          is_advertised?: boolean | null
          is_open?: boolean | null
          lat?: number
          lng?: number
          min_order_amount?: number | null
          name?: string
          owner_id?: string
          phone?: string
          rating?: number | null
          review_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          images: string[] | null
          order_id: string | null
          owner_reply: string | null
          owner_reply_at: string | null
          rating: number
          restaurant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          images?: string[] | null
          order_id?: string | null
          owner_reply?: string | null
          owner_reply_at?: string | null
          rating: number
          restaurant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          images?: string[] | null
          order_id?: string | null
          owner_reply?: string | null
          owner_reply_at?: string | null
          rating?: number
          restaurant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rider_locations: {
        Row: {
          accuracy: number | null
          created_at: string | null
          heading: number | null
          id: string
          lat: number
          lng: number
          rider_id: string
          speed: number | null
          updated_at: string | null
        }
        Insert: {
          accuracy?: number | null
          created_at?: string | null
          heading?: number | null
          id?: string
          lat: number
          lng: number
          rider_id: string
          speed?: number | null
          updated_at?: string | null
        }
        Update: {
          accuracy?: number | null
          created_at?: string | null
          heading?: number | null
          id?: string
          lat?: number
          lng?: number
          rider_id?: string
          speed?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rider_locations_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      riders: {
        Row: {
          created_at: string | null
          current_lat: number | null
          current_lng: number | null
          id: string
          is_available: boolean | null
          license_number: string | null
          rating: number | null
          total_deliveries: number | null
          updated_at: string | null
          user_id: string
          vehicle_number: string | null
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          is_available?: boolean | null
          license_number?: string | null
          rating?: number | null
          total_deliveries?: number | null
          updated_at?: string | null
          user_id: string
          vehicle_number?: string | null
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          is_available?: boolean | null
          license_number?: string | null
          rating?: number | null
          total_deliveries?: number | null
          updated_at?: string | null
          user_id?: string
          vehicle_number?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "riders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      settlements: {
        Row: {
          account_holder: string | null
          account_number: string | null
          amount: number
          bank_name: string | null
          created_at: string | null
          fee: number | null
          id: string
          net_amount: number
          order_id: string | null
          restaurant_id: string | null
          rider_id: string | null
          settled_at: string | null
          settlement_type: string
          status: string | null
        }
        Insert: {
          account_holder?: string | null
          account_number?: string | null
          amount: number
          bank_name?: string | null
          created_at?: string | null
          fee?: number | null
          id?: string
          net_amount: number
          order_id?: string | null
          restaurant_id?: string | null
          rider_id?: string | null
          settled_at?: string | null
          settlement_type: string
          status?: string | null
        }
        Update: {
          account_holder?: string | null
          account_number?: string | null
          amount?: number
          bank_name?: string | null
          created_at?: string | null
          fee?: number | null
          id?: string
          net_amount?: number
          order_id?: string | null
          restaurant_id?: string | null
          rider_id?: string | null
          settled_at?: string | null
          settlement_type?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settlements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlements_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlements_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "riders"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_invoices: {
        Row: {
          buyer_address: string | null
          buyer_biz_number: string
          buyer_ceo_name: string | null
          buyer_email: string | null
          buyer_name: string
          created_at: string | null
          failed_reason: string | null
          id: string
          issue_id: string | null
          issue_type: string | null
          issued_at: string | null
          period_end: string | null
          period_start: string | null
          remark: string | null
          restaurant_id: string | null
          status: string
          supplier_address: string | null
          supplier_biz_number: string
          supplier_ceo_name: string
          supplier_name: string
          supply_cost: number
          tax: number
          total_amount: number
          updated_at: string | null
          write_date: string
        }
        Insert: {
          buyer_address?: string | null
          buyer_biz_number: string
          buyer_ceo_name?: string | null
          buyer_email?: string | null
          buyer_name: string
          created_at?: string | null
          failed_reason?: string | null
          id?: string
          issue_id?: string | null
          issue_type?: string | null
          issued_at?: string | null
          period_end?: string | null
          period_start?: string | null
          remark?: string | null
          restaurant_id?: string | null
          status?: string
          supplier_address?: string | null
          supplier_biz_number: string
          supplier_ceo_name: string
          supplier_name: string
          supply_cost?: number
          tax?: number
          total_amount?: number
          updated_at?: string | null
          write_date: string
        }
        Update: {
          buyer_address?: string | null
          buyer_biz_number?: string
          buyer_ceo_name?: string | null
          buyer_email?: string | null
          buyer_name?: string
          created_at?: string | null
          failed_reason?: string | null
          id?: string
          issue_id?: string | null
          issue_type?: string | null
          issued_at?: string | null
          period_end?: string | null
          period_start?: string | null
          remark?: string | null
          restaurant_id?: string | null
          status?: string
          supplier_address?: string | null
          supplier_biz_number?: string
          supplier_ceo_name?: string
          supplier_name?: string
          supply_cost?: number
          tax?: number
          total_amount?: number
          updated_at?: string | null
          write_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_invoices_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_coupons: {
        Row: {
          coupon_id: string
          created_at: string | null
          id: string
          is_used: boolean | null
          order_id: string | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string | null
          id?: string
          is_used?: boolean | null
          order_id?: string | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string | null
          id?: string
          is_used?: boolean | null
          order_id?: string | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_coupons_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_coupons_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_coupons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          default_address_id: string | null
          email: string
          id: string
          name: string
          phone: string | null
          point_balance: number | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          default_address_id?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          point_balance?: number | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          default_address_id?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          point_balance?: number | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_platform_fee: {
        Args: { order_amount: number }
        Returns: number
      }
      check_order_cancelability: { Args: { p_order_id: string }; Returns: Json }
      cleanup_expired_notifications: { Args: never; Returns: number }
      cleanup_old_notifications: { Args: never; Returns: number }
      create_notification: {
        Args: {
          p_body: string
          p_data?: Json
          p_expires_at?: string
          p_priority?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      earn_points: {
        Args: {
          p_amount: number
          p_description: string
          p_order_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      get_unread_notification_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      increment_coupon_usage: {
        Args: { coupon_id: string }
        Returns: undefined
      }
      increment_rider_deliveries: {
        Args: { p_rider_id: string }
        Returns: undefined
      }
      init_notification_settings: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      mark_all_notifications_read: {
        Args: { p_user_id: string }
        Returns: number
      }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: boolean
      }
      process_order_cancellation: {
        Args: {
          p_order_id: string
          p_reason: string
          p_reason_detail?: string
          p_user_id: string
        }
        Returns: Json
      }
      refund_user_points: {
        Args: {
          p_amount: number
          p_cancellation_id: string
          p_description: string
          p_order_id: string
          p_user_id: string
        }
        Returns: {
          new_balance: number
          transaction_id: string
        }[]
      }
      upsert_push_token: {
        Args: {
          p_device_id?: string
          p_device_name?: string
          p_platform: string
          p_token: string
          p_user_id: string
        }
        Returns: string
      }
      use_points: {
        Args: {
          p_amount: number
          p_description: string
          p_order_id: string
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      device_platform: "ios" | "android" | "web"
      notification_channel: "in_app" | "push" | "email" | "sms"
      notification_priority: "low" | "normal" | "high" | "urgent"
      notification_send_status:
        | "pending"
        | "sent"
        | "failed"
        | "delivered"
        | "read"
      notification_type:
        | "order_created"
        | "order_confirmed"
        | "order_preparing"
        | "order_ready"
        | "order_picked_up"
        | "order_delivered"
        | "order_cancelled"
        | "cancellation_requested_customer"
        | "cancellation_requested_owner"
        | "cancellation_instant_completed"
        | "cancellation_approved"
        | "cancellation_rejected"
        | "cancellation_auto_approved"
        | "cancellation_withdrawn"
        | "refund_processing"
        | "refund_completed"
        | "refund_failed"
        | "points_earned"
        | "points_refunded"
        | "coupon_restored"
        | "coupon_expiring"
        | "promotion_new"
        | "system_notice"
        | "review_reminder"
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
      device_platform: ["ios", "android", "web"],
      notification_channel: ["in_app", "push", "email", "sms"],
      notification_priority: ["low", "normal", "high", "urgent"],
      notification_send_status: [
        "pending",
        "sent",
        "failed",
        "delivered",
        "read",
      ],
      notification_type: [
        "order_created",
        "order_confirmed",
        "order_preparing",
        "order_ready",
        "order_picked_up",
        "order_delivered",
        "order_cancelled",
        "cancellation_requested_customer",
        "cancellation_requested_owner",
        "cancellation_instant_completed",
        "cancellation_approved",
        "cancellation_rejected",
        "cancellation_auto_approved",
        "cancellation_withdrawn",
        "refund_processing",
        "refund_completed",
        "refund_failed",
        "points_earned",
        "points_refunded",
        "coupon_restored",
        "coupon_expiring",
        "promotion_new",
        "system_notice",
        "review_reminder",
      ],
    },
  },
} as const
