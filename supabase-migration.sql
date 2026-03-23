-- ============================================================
-- FitTrack – Supabase Migration
-- Exécuter dans Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 TEXT NOT NULL,
  gender               TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  age                  INTEGER NOT NULL CHECK (age > 0 AND age < 150),
  weight               NUMERIC(5, 1) NOT NULL CHECK (weight > 0),
  height               NUMERIC(5, 1) NOT NULL CHECK (height > 0),
  activity_level       TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'intense')),
  goal                 TEXT NOT NULL CHECK (goal IN ('maintain', 'cut', 'bulk')),
  calorie_adjustment   INTEGER NOT NULL DEFAULT 0,
  workout_mode         TEXT NOT NULL DEFAULT 'category' CHECK (workout_mode IN ('category', 'exercises')),
  streak_target        INTEGER NOT NULL DEFAULT 3 CHECK (streak_target > 0),
  exercise_list        JSONB NOT NULL DEFAULT '[]',
  workout_cal_per_hour INTEGER NOT NULL DEFAULT 300 CHECK (workout_cal_per_hour > 0),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: workout_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS workout_logs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date             DATE NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  category         TEXT CHECK (category IN ('Push', 'Pull', 'Legs', 'Cardio', 'Full Body', 'Autre')),
  exercises_done   JSONB,
  note             TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS workout_logs_profile_date_idx ON workout_logs(profile_id, date DESC);

-- ============================================================
-- TABLE: nutrition_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS nutrition_logs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date           DATE NOT NULL,
  meal_name      TEXT NOT NULL,
  calories       NUMERIC(7, 1) NOT NULL DEFAULT 0,
  protein        NUMERIC(6, 1) NOT NULL DEFAULT 0,
  carbs          NUMERIC(6, 1) NOT NULL DEFAULT 0,
  fat            NUMERIC(6, 1) NOT NULL DEFAULT 0,
  quantity_g     NUMERIC(7, 1),
  source         TEXT NOT NULL DEFAULT 'natural' CHECK (source IN ('barcode', 'natural', 'saved')),
  is_approximate BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS nutrition_logs_profile_date_idx ON nutrition_logs(profile_id, date DESC);

-- ============================================================
-- TABLE: saved_meals
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_meals (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  calories   NUMERIC(7, 1) NOT NULL DEFAULT 0,
  protein    NUMERIC(6, 1) NOT NULL DEFAULT 0,
  carbs      NUMERIC(6, 1) NOT NULL DEFAULT 0,
  fat        NUMERIC(6, 1) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS saved_meals_profile_idx ON saved_meals(profile_id);

-- ============================================================
-- Row Level Security (RLS)
-- Using service role key server-side bypasses RLS automatically.
-- Enable RLS but allow service role full access.
-- ============================================================

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_meals    ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything (used by our API routes)
CREATE POLICY "service_role_profiles"       ON profiles       FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_workout_logs"   ON workout_logs   FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_nutrition_logs" ON nutrition_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_saved_meals"    ON saved_meals    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
