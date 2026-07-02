export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type RoleEnum = "PARENT" | "MEDIC" | "POSYANDU" | "ADMIN";
export type GenderEnum = "MALE" | "FEMALE";
export type StuntEnum = "NORMAL" | "AT_RISK" | "STUNTED" | "SEVERELY_STUNTED";
export type PredStatusEnum = "PENDING" | "COMPLETED" | "FAILED";
export type AnchorEnum = "PENDING" | "CONFIRMED" | "FAILED";
export type VcTypeEnum = "IMMUNIZATION_COMPLETE" | "NUTRITION_STATUS" | "GROWTH_MILESTONE";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          role: RoleEnum;
          wallet_address: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          role?: RoleEnum;
          wallet_address?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          role?: RoleEnum;
          wallet_address?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "auth.users";
            referencedColumns: ["id"];
          },
        ];
      };
      children: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          birth_date: string;
          gender: GenderEnum;
          anon_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          birth_date: string;
          gender: GenderEnum;
          anon_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          birth_date?: string;
          gender?: GenderEnum;
          anon_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "children_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      assessments: {
        Row: {
          id: string;
          child_id: string;
          weight: number;
          height: number;
          head_circumference: number | null;
          bf_exclusive: boolean;
          mpasi_age: number | null;
          meal_freq: number | null;
          illness_history: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          weight: number;
          height: number;
          head_circumference?: number | null;
          bf_exclusive?: boolean;
          mpasi_age?: number | null;
          meal_freq?: number | null;
          illness_history?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          child_id?: string;
          weight?: number;
          height?: number;
          head_circumference?: number | null;
          bf_exclusive?: boolean;
          mpasi_age?: number | null;
          meal_freq?: number | null;
          illness_history?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assessments_child_id_fkey";
            columns: ["child_id"];
            isOneToOne: false;
            referencedRelation: "children";
            referencedColumns: ["id"];
          },
        ];
      };
      predictions: {
        Row: {
          id: string;
          assessment_id: string;
          stunt_status: StuntEnum;
          prediction_status: PredStatusEnum;
          zscore_wa: number | null;
          zscore_ha: number | null;
          zscore_wh: number | null;
          risk_level: number | null;
          summary: string | null;
          recommendations: Json | null;
          next_assessment_date: string | null;
          disclaimer: string;
          gemini_raw: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          stunt_status?: StuntEnum;
          prediction_status?: PredStatusEnum;
          zscore_wa?: number | null;
          zscore_ha?: number | null;
          zscore_wh?: number | null;
          risk_level?: number | null;
          summary?: string | null;
          recommendations?: Json | null;
          next_assessment_date?: string | null;
          disclaimer?: string;
          gemini_raw?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          stunt_status?: StuntEnum;
          prediction_status?: PredStatusEnum;
          zscore_wa?: number | null;
          zscore_ha?: number | null;
          zscore_wh?: number | null;
          risk_level?: number | null;
          summary?: string | null;
          recommendations?: Json | null;
          next_assessment_date?: string | null;
          disclaimer?: string;
          gemini_raw?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "predictions_assessment_id_fkey";
            columns: ["assessment_id"];
            isOneToOne: true;
            referencedRelation: "assessments";
            referencedColumns: ["id"];
          },
        ];
      };
      nutrition_logs: {
        Row: {
          id: string;
          child_id: string;
          photo_url: string | null;
          food_detected: string[] | null;
          portion_estimate: string | null;
          calories: number | null;
          protein: number | null;
          carbs: number | null;
          fat: number | null;
          fiber: number | null;
          adequacy_note: string | null;
          mpasi_recommendation: string | null;
          gemini_raw: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          photo_url?: string | null;
          food_detected?: string[] | null;
          portion_estimate?: string | null;
          calories?: number | null;
          protein?: number | null;
          carbs?: number | null;
          fat?: number | null;
          fiber?: number | null;
          adequacy_note?: string | null;
          mpasi_recommendation?: string | null;
          gemini_raw?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          child_id?: string;
          photo_url?: string | null;
          food_detected?: string[] | null;
          portion_estimate?: string | null;
          calories?: number | null;
          protein?: number | null;
          carbs?: number | null;
          fat?: number | null;
          fiber?: number | null;
          adequacy_note?: string | null;
          mpasi_recommendation?: string | null;
          gemini_raw?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "nutrition_logs_child_id_fkey";
            columns: ["child_id"];
            isOneToOne: false;
            referencedRelation: "children";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_sessions: {
        Row: {
          id: string;
          prediction_id: string;
          messages: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          prediction_id: string;
          messages?: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          prediction_id?: string;
          messages?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_sessions_prediction_id_fkey";
            columns: ["prediction_id"];
            isOneToOne: false;
            referencedRelation: "predictions";
            referencedColumns: ["id"];
          },
        ];
      };
      blockchain_anchors: {
        Row: {
          id: string;
          assessment_id: string;
          record_hash: string;
          tx_hash: string | null;
          block_number: number | null;
          contract_address: string | null;
          anchor_status: AnchorEnum;
          anchored_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          record_hash: string;
          tx_hash?: string | null;
          block_number?: number | null;
          contract_address?: string | null;
          anchor_status?: AnchorEnum;
          anchored_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          record_hash?: string;
          tx_hash?: string | null;
          block_number?: number | null;
          contract_address?: string | null;
          anchor_status?: AnchorEnum;
          anchored_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blockchain_anchors_assessment_id_fkey";
            columns: ["assessment_id"];
            isOneToOne: true;
            referencedRelation: "assessments";
            referencedColumns: ["id"];
          },
        ];
      };
      verifiable_credentials: {
        Row: {
          id: string;
          child_id: string;
          issuer_id: string;
          vc_type: VcTypeEnum;
          ipfs_cid: string;
          tx_hash: string | null;
          is_revoked: boolean;
          revoke_tx_hash: string | null;
          expires_at: string | null;
          wallet_address: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          issuer_id: string;
          vc_type: VcTypeEnum;
          ipfs_cid: string;
          tx_hash?: string | null;
          is_revoked?: boolean;
          revoke_tx_hash?: string | null;
          expires_at?: string | null;
          wallet_address: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          child_id?: string;
          issuer_id?: string;
          vc_type?: VcTypeEnum;
          ipfs_cid?: string;
          tx_hash?: string | null;
          is_revoked?: boolean;
          revoke_tx_hash?: string | null;
          expires_at?: string | null;
          wallet_address?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vc_child_id_fkey";
            columns: ["child_id"];
            isOneToOne: false;
            referencedRelation: "children";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "vc_issuer_id_fkey";
            columns: ["issuer_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      role_enum: RoleEnum;
      gender_enum: GenderEnum;
      stunt_enum: StuntEnum;
      pred_status_enum: PredStatusEnum;
      anchor_enum: AnchorEnum;
      vc_type_enum: VcTypeEnum;
    };
  };
}
