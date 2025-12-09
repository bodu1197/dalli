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

// 주문 상태 타입
export type OrderStatus = Order['status']
