-- MediSense AI — Database Schema
-- Supabase PostgreSQL Migration
-- WARNING: This is a demo schema using synthetic data
-- Not approved for clinical production use

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('kader', 'bidan', 'puskesmas');
CREATE TYPE triage_level AS ENUM ('hijau', 'kuning', 'merah');
CREATE TYPE sync_status AS ENUM ('pending', 'synced', 'conflict', 'archived');

-- ============================================
-- TABLES
-- ============================================

-- Puskesmas (health centers)
CREATE TABLE puskesmas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  address     TEXT,
  region      TEXT NOT NULL,               -- kabupaten/kota
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Villages under puskesmas coverage
CREATE TABLE villages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  puskesmas_id UUID NOT NULL REFERENCES puskesmas(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  sub_region   TEXT,                        -- kecamatan
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User profiles (linked to Supabase Auth)
CREATE TABLE user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  phone         TEXT UNIQUE,
  role          user_role NOT NULL DEFAULT 'kader',
  puskesmas_id  UUID REFERENCES puskesmas(id),
  region        TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Kader assignment to villages (many-to-many)
CREATE TABLE kader_villages (
  kader_id    UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  village_id  UUID NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
  is_primary  BOOLEAN NOT NULL DEFAULT false,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (kader_id, village_id)
);

-- Device registrations
CREATE TABLE devices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kader_id      UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  device_name   TEXT,
  device_os     TEXT,                       -- 'android' | 'ios' | 'web'
  push_token    TEXT,                       -- for future push notifications
  last_sync_at  TIMESTAMPTZ,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Triage sessions synced from devices
-- NOTE: No PII stored here. patient_hash is SHA-256 of patient ID.
CREATE TABLE triage_sessions (
  id              UUID PRIMARY KEY,         -- UUID generated on-device
  device_id       UUID NOT NULL REFERENCES devices(id),
  kader_id        UUID NOT NULL REFERENCES user_profiles(id),
  village_id      UUID REFERENCES villages(id),
  patient_hash    TEXT NOT NULL,            -- SHA-256 (anonim)
  patient_age     INT,                      -- age in years (optional, for aggregation)
  patient_gender  INT,                      -- 0=F, 1=M (optional)

  -- Triage results
  triage_level    triage_level NOT NULL,
  conditions      JSONB NOT NULL DEFAULT '[]',  -- [{condition, confidence, triage_level}]

  -- Timing
  triage_started_at  TIMESTAMPTZ NOT NULL,
  triage_completed_at TIMESTAMPTZ NOT NULL,
  synced_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Sync tracking
  sync_status       sync_status NOT NULL DEFAULT 'synced',
  model_version     TEXT,                    -- version of model used
  app_version       TEXT,                    -- version of PWA app

  -- Metadata
  audit_trail       JSONB,                   -- log of decision steps
  voice_text        TEXT,                    -- transcribed voice input (optional)

  CONSTRAINT valid_time CHECK (triage_completed_at >= triage_started_at)
);

-- Indexes for dashboard queries
CREATE INDEX idx_triage_sessions_synced_at ON triage_sessions(synced_at);
CREATE INDEX idx_triage_sessions_kader ON triage_sessions(kader_id);
CREATE INDEX idx_triage_sessions_village ON triage_sessions(village_id);
CREATE INDEX idx_triage_sessions_triage_level ON triage_sessions(triage_level);
CREATE INDEX idx_triage_sessions_conditions ON triage_sessions USING GIN (conditions);
CREATE INDEX idx_triage_sessions_patient_hash ON triage_sessions(patient_hash);

-- Sync queue for pending updates to devices
CREATE TABLE sync_queue (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id     UUID NOT NULL REFERENCES devices(id),
  payload       JSONB NOT NULL,
  status        sync_status NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at  TIMESTAMPTZ
);

CREATE INDEX idx_sync_queue_device ON sync_queue(device_id, status);

-- Model version tracking
CREATE TABLE model_versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version       TEXT NOT NULL UNIQUE,
  url           TEXT NOT NULL,
  sha256        TEXT NOT NULL,
  size_bytes    INT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT false,
  release_notes TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE puskesmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kader_villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_versions ENABLE ROW LEVEL SECURITY;

-- Kader can only read their own triage sessions
CREATE POLICY "kader_read_own_triages" ON triage_sessions
  FOR SELECT
  USING (auth.uid() = kader_id);

-- Kader can insert their own triage sessions
CREATE POLICY "kader_insert_own_triages" ON triage_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = kader_id);

-- Bidan can read triages in their puskesmas region
CREATE POLICY "bidan_read_region_triages" ON triage_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
        AND up.role IN ('bidan', 'puskesmas')
        AND up.puskesmas_id = (
          SELECT puskesmas_id FROM user_profiles WHERE id = triage_sessions.kader_id
        )
    )
  );

-- Puskesmas head can read all
CREATE POLICY "puskesmas_read_all_triages" ON triage_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'puskesmas'
    )
  );

-- ============================================
-- FUNCTIONS & VIEWS
-- ============================================

-- Dashboard summary view
CREATE VIEW dashboard_summary AS
SELECT
  date_trunc('day', triage_completed_at) AS date,
  COUNT(*) AS total_triages,
  COUNT(*) FILTER (WHERE triage_level = 'merah') AS merah_count,
  COUNT(*) FILTER (WHERE triage_level = 'kuning') AS kuning_count,
  COUNT(*) FILTER (WHERE triage_level = 'hijau') AS hijau_count,
  COUNT(DISTINCT kader_id) AS active_kaders,
  COUNT(DISTINCT patient_hash) AS unique_patients
FROM triage_sessions
WHERE sync_status = 'synced'
GROUP BY date_trunc('day', triage_completed_at)
ORDER BY date DESC;

-- Early warning: conditions with >2 SD from 7-day average
CREATE OR REPLACE FUNCTION get_early_warnings(target_puskesmas_id UUID DEFAULT NULL)
RETURNS TABLE (
  condition       TEXT,
  current_count   BIGINT,
  avg_7day        NUMERIC,
  stddev_7day     NUMERIC,
  z_score         NUMERIC,
  severity        TEXT
) LANGUAGE SQL STABLE AS $$
  WITH daily_counts AS (
    SELECT
      date_trunc('day', ts.triage_completed_at) AS day,
      cond.value->>'condition' AS condition_name,
      COUNT(*)::BIGINT AS cnt
    FROM triage_sessions ts
    CROSS JOIN LATERAL jsonb_array_elements(ts.conditions) AS cond
    WHERE ts.sync_status = 'synced'
      AND (target_puskesmas_id IS NULL OR ts.kader_id IN (
        SELECT id FROM user_profiles WHERE puskesmas_id = target_puskesmas_id
      ))
    GROUP BY day, condition_name
  ),
  stats AS (
    SELECT
      condition_name,
      AVG(cnt)::NUMERIC AS avg_7day,
      stddev(cnt)::NUMERIC AS stddev_7day
    FROM daily_counts
    WHERE day >= CURRENT_DATE - INTERVAL '14 days'
      AND day < CURRENT_DATE
    GROUP BY condition_name
  ),
  today AS (
    SELECT
      condition_name,
      SUM(cnt)::BIGINT AS current_count
    FROM daily_counts
    WHERE day = CURRENT_DATE
    GROUP BY condition_name
  )
  SELECT
    t.condition_name,
    t.current_count,
    COALESCE(s.avg_7day, 0),
    COALESCE(s.stddev_7day, 1),
    CASE WHEN s.stddev_7day > 0
      THEN ((t.current_count - s.avg_7day) / s.stddev_7day)::NUMERIC
      ELSE 0
    END AS z_score,
    CASE
      WHEN COALESCE(s.stddev_7day, 0) = 0 THEN 'insufficient_data'
      WHEN ((t.current_count - s.avg_7day) / s.stddev_7day) > 3 THEN 'critical'
      WHEN ((t.current_count - s.avg_7day) / s.stddev_7day) > 2 THEN 'warning'
      ELSE 'normal'
    END AS severity
  FROM today t
  LEFT JOIN stats s ON t.condition_name = s.condition_name
  WHERE t.current_count > 0
  ORDER BY z_score DESC;
$$;
