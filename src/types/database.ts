/**
 * MediSense AI — Database type definitions.
 *
 * These types reflect the Supabase PostgreSQL schema defined in
 * supabase/migrations/00001_init.sql.
 *
 * @see docs/TECH-STACK.md §3 (API Contract)
 */

// ─── Enums ───

export type UserRole = 'kader' | 'bidan' | 'puskesmas';
export type TriageLevel = 'hijau' | 'kuning' | 'merah';
export type SyncStatus = 'pending' | 'synced' | 'conflict' | 'archived';

// ─── Core Tables ───

export interface Puskesmas {
  id: string;
  name: string;
  address: string | null;
  region: string;
  created_at: string;
}

export interface Village {
  id: string;
  puskesmas_id: string;
  name: string;
  sub_region: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  puskesmas_id: string | null;
  region: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  kader_id: string;
  device_name: string | null;
  device_os: string | null;
  push_token: string | null;
  last_sync_at: string | null;
  is_active: boolean;
  created_at: string;
}

// ─── Triage (synced from device) ───

export interface TriageCondition {
  condition: string;      // e.g. 'sepsis', 'pneumonia_balita'
  confidence: number;     // 0.0 – 1.0
  triage_level: TriageLevel;
}

export interface TriageSession {
  id: string;
  device_id: string;
  kader_id: string;
  village_id: string | null;
  patient_hash: string;
  patient_age: number | null;
  patient_gender: number | null;
  triage_level: TriageLevel;
  conditions: TriageCondition[];
  triage_started_at: string;
  triage_completed_at: string;
  synced_at: string;
  sync_status: SyncStatus;
  model_version: string | null;
  app_version: string | null;
  audit_trail: Record<string, unknown> | null;
  voice_text: string | null;
}

// ─── API Request/Response Types ───

export namespace API {
  // POST /api/sync/triage
  export interface SyncTriageRequest {
    triage_id: string;
    device_id: string;
    kader_id: string;
    village_id?: string;
    patient_hash: string;
    patient_age?: number;
    patient_gender?: number;
    triage_level: TriageLevel;
    conditions: TriageCondition[];
    triage_started_at: string;
    triage_completed_at: string;
    model_version?: string;
    app_version?: string;
    audit_trail?: Record<string, unknown>[];
    voice_text?: string;
  }

  export interface SyncTriageResponse {
    success: boolean;
    sync_timestamp: string;
    error?: string;
  }

  // GET /api/sync/pending
  export interface SyncPendingResponse {
    updates: unknown[];
    model_version: string;
  }

  // GET /api/dashboard/summary
  export interface DashboardSummaryRequest {
    puskesmas_id?: string;
    periode: '7d' | '30d' | '90d';
  }

  export interface DashboardSummaryResponse {
    total_triages: number;
    triage_by_level: {
      hijau: number;
      kuning: number;
      merah: number;
    };
    conditions_breakdown: Record<string, number>;
    daily_trend: Array<{ date: string; total: number; merah: number; kuning: number; hijau: number }>;
    active_kaders: number;
    unique_patients: number;
    early_warnings: EarlyWarning[];
  }

  export interface EarlyWarning {
    condition: string;
    current_count: number;
    avg_7day: number;
    z_score: number;
    severity: 'normal' | 'warning' | 'critical' | 'insufficient_data';
  }

  // GET /api/dashboard/kaders
  export interface KadersResponse {
    kaders: KaderSummary[];
  }

  export interface KaderSummary {
    id: string;
    full_name: string;
    total_triages: number;
    last_active: string | null;
    village_name: string;
  }

  // Auth
  export interface AuthRegisterRequest {
    full_name: string;
    phone: string;
    password: string;
    role: UserRole;
    puskesmas_id: string;
    region?: string;
  }

  export interface AuthLoginRequest {
    phone: string;
    password: string;
  }

  export interface AuthResponse {
    user: {
      id: string;
      full_name: string;
      role: UserRole;
      puskesmas_id: string | null;
      puskesmas_name?: string;
      phone?: string;
    };
    token: string;
  }
}

// ─── Database type helper for Supabase ───

export interface Database {
  public: {
    Tables: {
      puskesmas: { Row: Puskesmas; Insert: Omit<Puskesmas, 'id' | 'created_at'>; Update: Partial<Puskesmas> };
      villages: { Row: Village; Insert: Omit<Village, 'id' | 'created_at'>; Update: Partial<Village> };
      user_profiles: { Row: UserProfile; Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>; Update: Partial<UserProfile> };
      devices: { Row: Device; Insert: Omit<Device, 'id' | 'created_at'>; Update: Partial<Device> };
      triage_sessions: { Row: TriageSession; Insert: Omit<TriageSession, 'synced_at'>; Update: Partial<TriageSession> };
    };
    Views: {
      dashboard_summary: {
        Row: {
          date: string;
          total_triages: number;
          merah_count: number;
          kuning_count: number;
          hijau_count: number;
          active_kaders: number;
          unique_patients: number;
        };
      };
    };
    Functions: {
      get_early_warnings: {
        Args: { target_puskesmas_id?: string };
        Returns: API.EarlyWarning[];
      };
    };
  };
}
