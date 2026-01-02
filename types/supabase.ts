export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      business_categories: {
        Row: {
          id: number
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
        }
      }
      product_categories: {
        Row: {
          id: number
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          owner_id: string | null
          name: string
          description: string | null
          location: string
          category_id: number
          is_verified: boolean
          tier: 'Basic' | 'Pro'
          featured_until: string | null
          status: 'unclaimed' | 'claimed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id?: string | null
          name: string
          description?: string | null
          location: string
          category_id: number
          is_verified?: boolean
          tier?: 'Basic' | 'Pro'
          featured_until?: string | null
          status?: 'unclaimed' | 'claimed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string | null
          name?: string
          description?: string | null
          location?: string
          category_id?: number
          is_verified?: boolean
          tier?: 'Basic' | 'Pro'
          featured_until?: string | null
          status?: 'unclaimed' | 'claimed'
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          listing_id: string
          name: string
          description: string | null
          price: number
          category_id: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          name: string
          description?: string | null
          price: number
          category_id: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          name?: string
          description?: string | null
          price?: number
          category_id?: number
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          role: 'visitor' | 'creator' | 'operator'
          email: string | null
          full_name: string | null
          avatar_url: string | null
          warning_count: number
          is_delisted: boolean
          is_suspended: boolean
          suspended_until: string | null
          is_evicted: boolean
          evicted_at: string | null
          violation_log: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'visitor' | 'creator' | 'operator'
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          warning_count?: number
          is_delisted?: boolean
          is_suspended?: boolean
          suspended_until?: string | null
          is_evicted?: boolean
          evicted_at?: string | null
          violation_log?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'visitor' | 'creator' | 'operator'
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          warning_count?: number
          is_delisted?: boolean
          is_suspended?: boolean
          suspended_until?: string | null
          is_evicted?: boolean
          evicted_at?: string | null
          violation_log?: Json
          created_at?: string
          updated_at?: string
        }
      }
      featured_queue: {
        Row: {
          id: number
          listing_id: string
          location: string
          status: 'pending' | 'active' | 'expired' | 'rejected'
          requested_at: string
          started_at: string | null
          ends_at: string | null
        }
        Insert: {
          id?: number
          listing_id: string
          location: string
          status?: 'pending' | 'active' | 'expired' | 'rejected'
          requested_at?: string
          started_at?: string | null
          ends_at?: string | null
        }
        Update: {
          id?: number
          listing_id?: string
          location?: string
          status?: 'pending' | 'active' | 'expired' | 'rejected'
          requested_at?: string
          started_at?: string | null
          ends_at?: string | null
        }
      }
    }
  }
}
