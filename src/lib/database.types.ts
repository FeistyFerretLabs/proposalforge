export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" };
  public: {
    Tables: {
      pf_proposals: {
        Row: {
          ai_brief: string | null;
          client_company: string | null;
          client_email: string | null;
          client_name: string;
          created_at: string;
          currency: string;
          id: string;
          project_description: string | null;
          project_name: string;
          sections: Json;
          sent_at: string | null;
          signed_at: string | null;
          signer_ip: string | null;
          signer_name: string | null;
          status: string;
          subtotal: number;
          tax_rate: number;
          title: string;
          total: number;
          updated_at: string;
          user_id: string;
          view_token: string;
        };
        Insert: {
          client_name: string;
          project_name: string;
          title: string;
          user_id: string;
          ai_brief?: string | null;
          client_company?: string | null;
          client_email?: string | null;
          currency?: string;
          id?: string;
          project_description?: string | null;
          sections?: Json;
          status?: string;
          subtotal?: number;
          tax_rate?: number;
          total?: number;
          view_token?: string;
        };
        Update: {
          ai_brief?: string | null;
          client_company?: string | null;
          client_email?: string | null;
          client_name?: string;
          currency?: string;
          project_description?: string | null;
          project_name?: string;
          sections?: Json;
          sent_at?: string | null;
          signed_at?: string | null;
          signer_ip?: string | null;
          signer_name?: string | null;
          status?: string;
          subtotal?: number;
          tax_rate?: number;
          title?: string;
          total?: number;
          updated_at?: string;
          view_token?: string;
        };
        Relationships: [];
      };
      pf_pricing_items: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_optional: boolean;
          is_selected: boolean;
          name: string;
          proposal_id: string;
          quantity: number;
          sort_order: number;
          unit_price: number;
        };
        Insert: {
          name: string;
          proposal_id: string;
          description?: string | null;
          id?: string;
          is_optional?: boolean;
          is_selected?: boolean;
          quantity?: number;
          sort_order?: number;
          unit_price?: number;
        };
        Update: {
          name?: string;
          proposal_id?: string;
          description?: string | null;
          id?: string;
          is_optional?: boolean;
          is_selected?: boolean;
          quantity?: number;
          sort_order?: number;
          unit_price?: number;
        };
        Relationships: [];
      };
      pf_view_events: {
        Row: {
          created_at: string;
          event_type: string;
          id: string;
          metadata: Json | null;
          proposal_id: string;
          section_id: string | null;
          viewer_ip: string | null;
        };
        Insert: {
          event_type: string;
          proposal_id: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          section_id?: string | null;
          viewer_ip?: string | null;
        };
        Update: {
          event_type?: string;
          proposal_id?: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          section_id?: string | null;
          viewer_ip?: string | null;
        };
        Relationships: [];
      };
      pf_templates: {
        Row: {
          brand_config: Json;
          created_at: string;
          default_terms: string | null;
          id: string;
          name: string;
          template_type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          name: string;
          user_id: string;
          brand_config?: Json;
          created_at?: string;
          default_terms?: string | null;
          id?: string;
          template_type?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          user_id?: string;
          brand_config?: Json;
          created_at?: string;
          default_terms?: string | null;
          id?: string;
          template_type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type T = Database["public"]["Tables"];
export type Proposal = T["pf_proposals"]["Row"];
export type PricingItem = T["pf_pricing_items"]["Row"];

export type ProposalStatus = "draft" | "sent" | "viewed" | "signed" | "expired";

// The AI-generated proposal body shape (stored in pf_proposals.sections JSONB).
export interface ProposalSection {
  id: string;
  heading: string;
  body: string;
}
