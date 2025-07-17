import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      category_customizations: {
        Row: {
          created_at: string | null
          customization_category_id: number | null
          id: number
          is_required: boolean | null
          max_selections: number | null
          menu_category: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customization_category_id?: number | null
          id?: number
          is_required?: boolean | null
          max_selections?: number | null
          menu_category: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customization_category_id?: number | null
          id?: number
          is_required?: boolean | null
          max_selections?: number | null
          menu_category?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "category_customizations_customization_category_id_fkey"
            columns: ["customization_category_id"]
            isOneToOne: false
            referencedRelation: "admin_customization_overview"
            referencedColumns: ["customization_category_id"]
          },
          {
            foreignKeyName: "category_customizations_customization_category_id_fkey"
            columns: ["customization_category_id"]
            isOneToOne: false
            referencedRelation: "customization_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      customization_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          id: number
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: number
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: number
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      customization_options: {
        Row: {
          category_id: number | null
          created_at: string | null
          display_name: string
          id: number
          is_active: boolean | null
          is_default: boolean | null
          name: string
          price_adjustment: number | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category_id?: number | null
          created_at?: string | null
          display_name: string
          id?: number
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          price_adjustment?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category_id?: number | null
          created_at?: string | null
          display_name?: string
          id?: number
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          price_adjustment?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customization_options_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "admin_customization_overview"
            referencedColumns: ["customization_category_id"]
          },
          {
            foreignKeyName: "customization_options_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "customization_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string | null
          display_order: number | null
          icon: string | null
          id: number
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          icon?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: number
          image: string | null
          is_active: boolean | null
          name: string
          popular: boolean | null
          price: number
          rating: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: number
          image?: string | null
          is_active?: boolean | null
          name: string
          popular?: boolean | null
          price: number
          rating?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: number
          image?: string | null
          is_active?: boolean | null
          name?: string
          popular?: boolean | null
          price?: number
          rating?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_menu_items_category"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["name"]
          },
        ]
      }
      users: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string
          email_verified: boolean | null
          first_name: string
          id: string
          is_active: boolean | null
          last_login: string | null
          last_name: string
          password_hash: string
          phone: string | null
          postal_code: string | null
          profile_image_url: string | null
          state: string | null
          updated_at: string | null
          user_type: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          email_verified?: boolean | null
          first_name: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          last_name: string
          password_hash: string
          phone?: string | null
          postal_code?: string | null
          profile_image_url?: string | null
          state?: string | null
          updated_at?: string | null
          user_type?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          email_verified?: boolean | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          last_name?: string
          password_hash?: string
          phone?: string | null
          postal_code?: string | null
          profile_image_url?: string | null
          state?: string | null
          updated_at?: string | null
          user_type?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: number;
          user_id: string | null;
          items: Json;
          bill_amount: number;
          address: string;
          zipcode: string;
          name: string;
          email: string;
          payment_method: string;
          status: string;
          placed_at: string | null;
        };
        Insert: {
          id?: number;
          user_id?: string | null;
          items: Json;
          bill_amount: number;
          address: string;
          zipcode: string;
          name: string;
          email: string;
          payment_method: string;
          status?: string;
          placed_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string | null;
          items?: Json;
          bill_amount?: number;
          address?: string;
          zipcode?: string;
          name?: string;
          email?: string;
          payment_method?: string;
          status?: string;
          placed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey",
            columns: ["user_id"],
            isOneToOne: false,
            referencedRelation: "users",
            referencedColumns: ["id"]
          }
        ];
      },
    }
    Views: {
      active_menu_items: {
        Row: {
          category: string | null
          category_icon: string | null
          created_at: string | null
          description: string | null
          id: number | null
          image: string | null
          name: string | null
          popular: boolean | null
          price: number | null
          rating: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_menu_items_category"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["name"]
          },
        ]
      }
      admin_customization_overview: {
        Row: {
          category_active: boolean | null
          category_customization_id: number | null
          category_sort_order: number | null
          customization_category_id: number | null
          customization_category_name: string | null
          customization_description: string | null
          customization_display_name: string | null
          default_options_count: number | null
          is_required: boolean | null
          max_selections: number | null
          menu_category: string | null
          option_count: number | null
        }
        Relationships: []
      }
      admin_options_overview: {
        Row: {
          category_active: boolean | null
          category_display_name: string | null
          category_id: number | null
          category_name: string | null
          display_name: string | null
          id: number | null
          is_active: boolean | null
          is_default: boolean | null
          name: string | null
          price_adjustment: number | null
          sort_order: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customization_options_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "admin_customization_overview"
            referencedColumns: ["customization_category_id"]
          },
          {
            foreignKeyName: "customization_options_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "customization_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string | null
          last_login: string | null
          last_name: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string | null
          last_login?: string | null
          last_name?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string | null
          last_login?: string | null
          last_name?: string | null
        }
        Relationships: []
      }
      customer_users: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string | null
          last_login: string | null
          last_name: string | null
          phone: string | null
          state: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string | null
          last_login?: string | null
          last_name?: string | null
          phone?: string | null
          state?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string | null
          last_login?: string | null
          last_name?: string | null
          phone?: string | null
          state?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_customization_option: {
        Args: {
          p_category_id: number
          p_name: string
          p_display_name: string
          p_price_adjustment?: number
          p_is_default?: boolean
          p_sort_order?: number
        }
        Returns: number
      }
      get_customizations_with_options: {
        Args: { p_menu_category: string }
        Returns: {
          category_customization_id: number
          menu_category: string
          is_required: boolean
          max_selections: number
          sort_order: number
          customization_category_id: number
          customization_category_name: string
          customization_display_name: string
          customization_description: string
          options: Json
        }[]
      }
      get_menu_items_by_category: {
        Args: { category_name: string }
        Returns: {
          id: number
          name: string
          description: string
          price: number
          image: string
          category: string
          rating: number
          popular: boolean
        }[]
      }
      get_popular_menu_items: {
        Args: { limit_count?: number }
        Returns: {
          id: number
          name: string
          description: string
          price: number
          image: string
          category: string
          rating: number
          popular: boolean
        }[]
      }
      get_user_by_email_and_type: {
        Args: { user_email: string; user_type_filter: string }
        Returns: {
          id: string
          email: string
          first_name: string
          last_name: string
          user_type: string
          is_active: boolean
          created_at: string
        }[]
      }
      register_user: {
        Args: {
          p_first_name: string
          p_last_name: string
          p_email: string
          p_password_hash: string
        }
        Returns: string
      }
      toggle_option_active: {
        Args: { p_option_id: number }
        Returns: boolean
      }
      update_customization_option: {
        Args: {
          p_option_id: number
          p_display_name: string
          p_price_adjustment: number
          p_is_default: boolean
          p_sort_order: number
        }
        Returns: boolean
      }
      update_last_login: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
