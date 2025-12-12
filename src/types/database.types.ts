/**
 * Supabase 데이터베이스 타입 정의
 * npm run db:types 명령으로 자동 생성 후 이 파일에 복사
 * 현재는 기본 구조만 정의
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string | null
          name: string
          role: 'customer' | 'owner' | 'rider' | 'admin'
          avatar_url: string | null
          default_address_id: string | null
          point_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone?: string | null
          name: string
          role?: 'customer' | 'owner' | 'rider' | 'admin'
          avatar_url?: string | null
          default_address_id?: string | null
          point_balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          name?: string
          role?: 'customer' | 'owner' | 'rider' | 'admin'
          avatar_url?: string | null
          default_address_id?: string | null
          point_balance?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string | null
          address: string
          detail: string | null
          lat: number
          lng: number
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label?: string | null
          address: string
          detail?: string | null
          lat: number
          lng: number
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string | null
          address?: string
          detail?: string | null
          lat?: number
          lng?: number
          is_default?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'addresses_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          icon: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          icon?: string | null
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          icon?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          phone: string
          address: string
          lat: number
          lng: number
          category_id: string | null
          min_order_amount: number
          delivery_fee: number
          estimated_delivery_time: number
          business_hours: Json | null
          is_open: boolean
          rating: number
          review_count: number
          image_url: string | null
          is_advertised: boolean
          ad_priority: number
          ad_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          phone: string
          address: string
          lat: number
          lng: number
          category_id?: string | null
          min_order_amount?: number
          delivery_fee?: number
          estimated_delivery_time?: number
          business_hours?: Json | null
          is_open?: boolean
          rating?: number
          review_count?: number
          image_url?: string | null
          is_advertised?: boolean
          ad_priority?: number
          ad_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          phone?: string
          address?: string
          lat?: number
          lng?: number
          category_id?: string | null
          min_order_amount?: number
          delivery_fee?: number
          estimated_delivery_time?: number
          business_hours?: Json | null
          is_open?: boolean
          rating?: number
          review_count?: number
          image_url?: string | null
          is_advertised?: boolean
          ad_priority?: number
          ad_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'restaurants_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'restaurants_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          }
        ]
      }
      menus: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          is_available: boolean
          is_popular: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          is_available?: boolean
          is_popular?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          is_available?: boolean
          is_popular?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'menus_restaurant_id_fkey'
            columns: ['restaurant_id']
            isOneToOne: false
            referencedRelation: 'restaurants'
            referencedColumns: ['id']
          }
        ]
      }
      orders: {
        Row: {
          id: string
          user_id: string
          restaurant_id: string
          rider_id: string | null
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivering' | 'delivered' | 'cancelled'
          total_amount: number
          delivery_fee: number
          delivery_address: string
          delivery_detail: string | null
          delivery_lat: number
          delivery_lng: number
          special_instructions: string | null
          estimated_delivery_time: string | null
          actual_delivery_time: string | null
          cancelled_reason: string | null
          payment_method: 'card' | 'kakaopay' | 'naverpay' | 'tosspay' | 'samsungpay' | 'payco' | 'cash' | null
          payment_key: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_id: string
          rider_id?: string | null
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivering' | 'delivered' | 'cancelled'
          total_amount: number
          delivery_fee?: number
          delivery_address: string
          delivery_detail?: string | null
          delivery_lat: number
          delivery_lng: number
          special_instructions?: string | null
          estimated_delivery_time?: string | null
          actual_delivery_time?: string | null
          cancelled_reason?: string | null
          payment_method?: 'card' | 'kakaopay' | 'naverpay' | 'tosspay' | 'samsungpay' | 'payco' | 'cash' | null
          payment_key?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_id?: string
          rider_id?: string | null
          status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivering' | 'delivered' | 'cancelled'
          total_amount?: number
          delivery_fee?: number
          delivery_address?: string
          delivery_detail?: string | null
          delivery_lat?: number
          delivery_lng?: number
          special_instructions?: string | null
          estimated_delivery_time?: string | null
          actual_delivery_time?: string | null
          cancelled_reason?: string | null
          payment_method?: 'card' | 'kakaopay' | 'naverpay' | 'tosspay' | 'samsungpay' | 'payco' | 'cash' | null
          payment_key?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'orders_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orders_restaurant_id_fkey'
            columns: ['restaurant_id']
            isOneToOne: false
            referencedRelation: 'restaurants'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'orders_rider_id_fkey'
            columns: ['rider_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      order_cancellations: {
        Row: {
          id: string
          order_id: string
          requested_by: string
          requested_by_type: 'customer' | 'owner' | 'rider' | 'admin' | 'system'
          cancel_type: 'instant' | 'request'
          status: 'pending' | 'approved' | 'rejected' | 'completed'
          reason_category: string
          reason_detail: string | null
          refund_amount: number
          refund_rate: number
          can_refund_coupon: boolean
          can_refund_points: boolean
          coupon_refunded: boolean
          points_refunded: boolean
          rejected_reason: string | null
          processed_by: string | null
          processed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          requested_by: string
          requested_by_type: 'customer' | 'owner' | 'rider' | 'admin' | 'system'
          cancel_type: 'instant' | 'request'
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          reason_category: string
          reason_detail?: string | null
          refund_amount: number
          refund_rate: number
          can_refund_coupon?: boolean
          can_refund_points?: boolean
          coupon_refunded?: boolean
          points_refunded?: boolean
          rejected_reason?: string | null
          processed_by?: string | null
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          requested_by?: string
          requested_by_type?: 'customer' | 'owner' | 'rider' | 'admin' | 'system'
          cancel_type?: 'instant' | 'request'
          status?: 'pending' | 'approved' | 'rejected' | 'completed'
          reason_category?: string
          reason_detail?: string | null
          refund_amount?: number
          refund_rate?: number
          can_refund_coupon?: boolean
          can_refund_points?: boolean
          coupon_refunded?: boolean
          points_refunded?: boolean
          rejected_reason?: string | null
          processed_by?: string | null
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'order_cancellations_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_cancellations_requested_by_fkey'
            columns: ['requested_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_cancellations_processed_by_fkey'
            columns: ['processed_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      refunds: {
        Row: {
          id: string
          order_id: string
          cancellation_id: string | null
          amount: number
          payment_method: 'card' | 'kakaopay' | 'naverpay' | 'tosspay' | 'samsungpay' | 'payco' | 'cash'
          payment_key: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          pg_response: Json | null
          pg_transaction_id: string | null
          failed_reason: string | null
          retry_count: number
          last_retry_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          cancellation_id?: string | null
          amount: number
          payment_method: 'card' | 'kakaopay' | 'naverpay' | 'tosspay' | 'samsungpay' | 'payco' | 'cash'
          payment_key?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          pg_response?: Json | null
          pg_transaction_id?: string | null
          failed_reason?: string | null
          retry_count?: number
          last_retry_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          cancellation_id?: string | null
          amount?: number
          payment_method?: 'card' | 'kakaopay' | 'naverpay' | 'tosspay' | 'samsungpay' | 'payco' | 'cash'
          payment_key?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          pg_response?: Json | null
          pg_transaction_id?: string | null
          failed_reason?: string | null
          retry_count?: number
          last_retry_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'refunds_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'refunds_cancellation_id_fkey'
            columns: ['cancellation_id']
            isOneToOne: false
            referencedRelation: 'order_cancellations'
            referencedColumns: ['id']
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          restaurant_id: string
          order_id: string | null
          rating: number
          content: string | null
          images: string[] | null
          owner_reply: string | null
          owner_reply_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_id: string
          order_id?: string | null
          rating: number
          content?: string | null
          images?: string[] | null
          owner_reply?: string | null
          owner_reply_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_id?: string
          order_id?: string | null
          rating?: number
          content?: string | null
          images?: string[] | null
          owner_reply?: string | null
          owner_reply_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reviews_restaurant_id_fkey'
            columns: ['restaurant_id']
            isOneToOne: false
            referencedRelation: 'restaurants'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reviews_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          }
        ]
      }
      recent_views: {
        Row: {
          id: string
          user_id: string
          restaurant_id: string
          viewed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_id: string
          viewed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_id?: string
          viewed_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'recent_views_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'recent_views_restaurant_id_fkey'
            columns: ['restaurant_id']
            isOneToOne: false
            referencedRelation: 'restaurants'
            referencedColumns: ['id']
          }
        ]
      }
      payment_methods: {
        Row: {
          id: string
          user_id: string
          type: 'card' | 'kakaopay' | 'naverpay' | 'tosspay' | 'samsungpay' | 'payco'
          nickname: string | null
          is_default: boolean
          is_verified: boolean
          is_active: boolean
          card_company: string | null
          card_number_last4: string | null
          card_type: 'credit' | 'debit' | null
          easy_pay_account: string | null
          billing_key: string | null
          color: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'card' | 'kakaopay' | 'naverpay' | 'tosspay' | 'samsungpay' | 'payco'
          nickname?: string | null
          is_default?: boolean
          is_verified?: boolean
          is_active?: boolean
          card_company?: string | null
          card_number_last4?: string | null
          card_type?: 'credit' | 'debit' | null
          easy_pay_account?: string | null
          billing_key?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'card' | 'kakaopay' | 'naverpay' | 'tosspay' | 'samsungpay' | 'payco'
          nickname?: string | null
          is_default?: boolean
          is_verified?: boolean
          is_active?: boolean
          card_company?: string | null
          card_number_last4?: string | null
          card_type?: 'credit' | 'debit' | null
          easy_pay_account?: string | null
          billing_key?: string | null
          color?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payment_methods_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      faq_categories: {
        Row: {
          id: string
          name: string
          slug: string
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          id: string
          category_id: string | null
          question: string
          answer: string
          is_pinned: boolean
          is_active: boolean
          view_count: number
          helpful_count: number
          not_helpful_count: number
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          question: string
          answer: string
          is_pinned?: boolean
          is_active?: boolean
          view_count?: number
          helpful_count?: number
          not_helpful_count?: number
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string | null
          question?: string
          answer?: string
          is_pinned?: boolean
          is_active?: boolean
          view_count?: number
          helpful_count?: number
          not_helpful_count?: number
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'faqs_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'faq_categories'
            referencedColumns: ['id']
          }
        ]
      }
      inquiries: {
        Row: {
          id: string
          user_id: string
          order_id: string | null
          category: 'order' | 'delivery' | 'payment' | 'refund' | 'account' | 'app' | 'other'
          title: string
          content: string
          images: string[] | null
          status: 'pending' | 'in_progress' | 'answered' | 'closed'
          priority: 'low' | 'normal' | 'high' | 'urgent'
          admin_id: string | null
          answer: string | null
          answered_at: string | null
          satisfaction_rating: number | null
          satisfaction_comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_id?: string | null
          category: 'order' | 'delivery' | 'payment' | 'refund' | 'account' | 'app' | 'other'
          title: string
          content: string
          images?: string[] | null
          status?: 'pending' | 'in_progress' | 'answered' | 'closed'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          admin_id?: string | null
          answer?: string | null
          answered_at?: string | null
          satisfaction_rating?: number | null
          satisfaction_comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_id?: string | null
          category?: 'order' | 'delivery' | 'payment' | 'refund' | 'account' | 'app' | 'other'
          title?: string
          content?: string
          images?: string[] | null
          status?: 'pending' | 'in_progress' | 'answered' | 'closed'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          admin_id?: string | null
          answer?: string | null
          answered_at?: string | null
          satisfaction_rating?: number | null
          satisfaction_comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'inquiries_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'inquiries_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'inquiries_admin_id_fkey'
            columns: ['admin_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      point_transactions: {
        Row: {
          id: string
          user_id: string
          order_id: string | null
          type: 'earn' | 'use' | 'admin_add' | 'admin_deduct' | 'expire'
          amount: number
          balance_after: number
          description: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_id?: string | null
          type: 'earn' | 'use' | 'admin_add' | 'admin_deduct' | 'expire'
          amount: number
          balance_after: number
          description?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_id?: string | null
          type?: 'earn' | 'use' | 'admin_add' | 'admin_deduct' | 'expire'
          amount?: number
          balance_after?: number
          description?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'point_transactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'point_transactions_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          }
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
      [_ in never]: never
    }
  }
}

// 헬퍼 타입
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// 엔티티 타입 별칭
export type User = Tables<'users'>
export type Address = Tables<'addresses'>
export type Category = Tables<'categories'>
export type Restaurant = Tables<'restaurants'>
export type Menu = Tables<'menus'>
export type Order = Tables<'orders'>
export type Review = Tables<'reviews'>
export type OrderCancellation = Tables<'order_cancellations'>
export type Refund = Tables<'refunds'>
export type RecentView = Tables<'recent_views'>
export type PaymentMethod = Tables<'payment_methods'>
export type FAQCategory = Tables<'faq_categories'>
export type FAQ = Tables<'faqs'>
export type Inquiry = Tables<'inquiries'>
export type PointTransaction = Tables<'point_transactions'>

// 주문 상태 타입
export type OrderStatus = Order['status']

// 취소 관련 타입
export type CancelType = OrderCancellation['cancel_type']
export type CancelStatus = OrderCancellation['status']
export type RefundStatus = Refund['status']
export type OrderPaymentMethod = NonNullable<Order['payment_method']>
