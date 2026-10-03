export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AuditType = "map" | "floorplan" | "room";
export type AuditStatus = "free" | "paid";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          stripe_customer_id: string | null;
          subscription_status: string;
          dob: string | null;
          kua_number: number | null;
        };
        Insert: {
          id: string;
          email: string;
          stripe_customer_id?: string | null;
          subscription_status?: string;
          dob?: string | null;
          kua_number?: number | null;
        };
        Update: {
          email?: string;
          stripe_customer_id?: string | null;
          subscription_status?: string;
          dob?: string | null;
          kua_number?: number | null;
        };
        Relationships: [];
      };
      audits: {
        Row: {
          id: string;
          user_id: string;
          audit_type: AuditType;
          image_url: string | null;
          facing_degree: number | null;
          year_built: number | null;
          status: AuditStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          audit_type: AuditType;
          image_url?: string | null;
          facing_degree?: number | null;
          year_built?: number | null;
          status?: AuditStatus;
          created_at?: string;
        };
        Update: {
          audit_type?: AuditType;
          image_url?: string | null;
          facing_degree?: number | null;
          year_built?: number | null;
          status?: AuditStatus;
        };
        Relationships: [
          {
            foreignKeyName: "audits_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: {
          id: string;
          audit_id: string;
          form_school_json: Json | null;
          compass_school_json: Json | null;
          remedy_text: string | null;
          is_unlocked: boolean;
        };
        Insert: {
          id?: string;
          audit_id: string;
          form_school_json?: Json | null;
          compass_school_json?: Json | null;
          remedy_text?: string | null;
          is_unlocked?: boolean;
        };
        Update: {
          form_school_json?: Json | null;
          compass_school_json?: Json | null;
          remedy_text?: string | null;
          is_unlocked?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "reports_audit_id_fkey";
            columns: ["audit_id"];
            isOneToOne: false;
            referencedRelation: "audits";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      audit_type: AuditType;
      audit_status: AuditStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
