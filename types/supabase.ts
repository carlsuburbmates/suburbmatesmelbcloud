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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          type: string
        }
        Insert: {
          id?: string
          name: string
          type: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      featured_queue: {
        Row: {
          ends_at: string | null
          id: number
          listing_id: string
          location: string
          requested_at: string
          started_at: string | null
          status: Database["public"]["Enums"]["featured_status"]
        }
        Insert: {
          ends_at?: string | null
          id?: number
          listing_id: string
          location: string
          requested_at?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["featured_status"]
        }
        Update: {
          ends_at?: string | null
          id?: number
          listing_id?: string
          location?: string
          requested_at?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["featured_status"]
        }
        Relationships: [
          {
            foreignKeyName: "featured_queue_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_tags: {
        Row: {
          listing_id: string
          tag_id: string
        }
        Insert: {
          listing_id: string
          tag_id: string
        }
        Update: {
          listing_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_tags_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          abn: string | null
          category_id: string
          contact_email: string | null
          created_at: string
          description: string | null
          featured_until: string | null
          id: string
          is_verified: boolean
          location: string
          name: string
          owner_id: string | null
          phone: string | null
          search_vector: string | null
          status: Database["public"]["Enums"]["listing_status"]
          tier: Database["public"]["Enums"]["listing_tier"]
          triage_reason: string | null
          triage_status: Database["public"]["Enums"]["triage_status"]
          updated_at: string
          website: string | null
          slug: string | null
          category_confirmed_at: string | null
          policy_accepted_at: string | null
        }
        Insert: {
          abn?: string | null
          category_id: string
          created_at?: string
          description?: string | null
          featured_until?: string | null
          id?: string
          is_verified?: boolean
          location: string
          name: string
          owner_id?: string | null
          search_vector?: never
          status?: Database["public"]["Enums"]["listing_status"]
          tier?: Database["public"]["Enums"]["listing_tier"]
          triage_reason?: string | null
          triage_status?: Database["public"]["Enums"]["triage_status"]
          updated_at?: string
          slug?: string | null
          category_confirmed_at?: string | null
          policy_accepted_at?: string | null
        }
        Update: {
          abn?: string | null
          category_id?: string
          created_at?: string
          description?: string | null
          featured_until?: string | null
          id?: string
          is_verified?: boolean
          location?: string
          name?: string
          owner_id?: string | null
          search_vector?: never
          status?: Database["public"]["Enums"]["listing_status"]
          tier?: Database["public"]["Enums"]["listing_tier"]
          triage_reason?: string | null
          triage_status?: Database["public"]["Enums"]["triage_status"]
          updated_at?: string
          slug?: string | null
          category_confirmed_at?: string | null
          policy_accepted_at?: string | null
          branding?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          product_id: string
          tag_id: string
        }
        Insert: {
          product_id: string
          tag_id: string
        }
        Update: {
          product_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          listing_id: string | null
          category_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          search_vector: string | null
          updated_at: string
        }
        Insert: {
          listing_id?: string | null
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          search_vector?: never
          updated_at?: string
        }
        Update: {
          listing_id?: string | null
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          search_vector?: never
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
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
      users_public: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          evicted_at: string | null
          full_name: string | null
          id: string
          is_delisted: boolean
          is_evicted: boolean
          is_suspended: boolean
          role: Database["public"]["Enums"]["app_role"]
          stripe_account_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_status: string | null
          suspended_until: string | null
          updated_at: string
          violation_log: Json
          warning_count: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          evicted_at?: string | null
          full_name?: string | null
          id: string
          is_delisted?: boolean
          is_evicted?: boolean
          is_suspended?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_status?: string | null
          suspended_until?: string | null
          updated_at?: string
          violation_log?: Json
          warning_count?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          evicted_at?: string | null
          full_name?: string | null
          id?: string
          is_delisted?: boolean
          is_evicted?: boolean
          is_suspended?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_status?: string | null
          suspended_until?: string | null
          updated_at?: string
          violation_log?: Json
          warning_count?: number
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      search_listings: {
        Args: {
          search_query: string | null
          category_filter?: string | null
          limit_val?: number
          offset_val?: number
        }
        Returns: {
          category_id: string
          created_at: string
          description: string | null
          featured_until: string | null
          id: string
          is_verified: boolean
          location: string
          name: string
          owner_id: string | null
          search_vector: string | null
          status: Database["public"]["Enums"]["listing_status"]
          tier: Database["public"]["Enums"]["listing_tier"]
          updated_at: string
          slug: string | null
          contact_email: string | null
          phone: string | null
        }[]
      }
      search_products: {
        Args: {
          search_query: string | null
          category_filter?: string | null
          min_price?: number | null
          max_price?: number | null
          limit_val?: number
          offset_val?: number
        }
        Returns: {
          id: string
          name: string
          description: string
          price: number
          category_id: string
          listing_id: string
          created_at: string
          updated_at: string
          search_vector: string
          listing_name: string
          listing_is_verified: boolean
          listing_slug: string
          category_name: string
        }[]
      }
      upsert_tag: {
        Args: {
          tag_name: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "visitor" | "creator" | "operator"
      featured_status: "pending" | "active" | "expired" | "rejected"
      listing_status: "unclaimed" | "claimed"
      listing_tier: "Basic" | "Pro"
      triage_status: "pending" | "safe" | "flagged"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
