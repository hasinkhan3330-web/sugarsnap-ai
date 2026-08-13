/*
# SugarSnap AI - Core Schema

## Summary
Creates the full data model for SugarSnap AI, an India-first sugar nutrition tracker.
This migration sets up five user-owned tables with Row Level Security, auto-updating
timestamps, a safe profile-creation trigger, and a private storage bucket for food images.

## New Tables

1. `profiles`
   - Stores per-user onboarding and goal data.
   - `id` (uuid, PK) references `auth.users(id)` ON DELETE CASCADE — one row per auth user.
   - `full_name` (text), `age_range` (text), `height_cm` (numeric), `weight_kg` (numeric),
     `activity_level` (text), `goal` (text), `calorie_goal` (int), `sugar_goal_g` (int),
     `onboarding_completed` (bool, default false), `created_at`, `updated_at`.

2. `food_logs`
   - One row per meal log entry (e.g. "breakfast on 2026-08-11").
   - `id` (uuid, PK), `user_id` (uuid, DEFAULT auth.uid(), FK to auth.users ON DELETE CASCADE),
     `logged_at` (timestamptz), `meal_type` (text: breakfast/lunch/dinner/snacks),
     `image_path` (text, nullable), `source` (text: scan/manual/custom),
     `total_calories`, `total_protein_g`, `total_carbs_g`, `total_fat_g`, `total_fiber_g`,
     `total_sugar_g`, `total_added_sugar_g` (all numeric), `ai_confidence` (numeric, nullable),
     `created_at`, `updated_at`.

3. `food_log_items`
   - Individual food items within a food log (e.g. "Masala chai", "Marie biscuits").
   - `id` (uuid, PK), `food_log_id` (uuid, FK to food_logs ON DELETE CASCADE),
     `user_id` (uuid, DEFAULT auth.uid(), FK to auth.users ON DELETE CASCADE),
     `name`, `serving_label`, `quantity` (numeric), `calories`, `protein_g`, `carbs_g`,
     `fat_g`, `fiber_g`, `sugar_g`, `added_sugar_g` (all numeric),
     `confidence` (numeric, nullable), `created_at`.

4. `custom_foods`
   - User-created reusable food entries.
   - `id` (uuid, PK), `user_id` (uuid, DEFAULT auth.uid(), FK to auth.users ON DELETE CASCADE),
     `name`, `serving_label`, `calories`, `protein_g`, `carbs_g`, `fat_g`, `fiber_g`,
     `sugar_g`, `added_sugar_g` (all numeric), `created_at`.

5. `scan_feedback`
   - User feedback on AI scan results for future model improvement.
   - `id` (uuid, PK), `user_id` (uuid, DEFAULT auth.uid(), FK to auth.users ON DELETE CASCADE),
     `food_log_id` (uuid, nullable, FK to food_logs ON DELETE SET NULL),
     `original_ai_response` (jsonb), `corrected_items` (jsonb),
     `helpful` (boolean, nullable), `created_at`.

## Security

- RLS enabled on ALL five tables.
- `profiles`: only the owner (id = auth.uid()) can SELECT and UPDATE. No INSERT or DELETE
  (rows are created by the `handle_new_user` trigger).
- `food_logs`, `food_log_items`, `custom_foods`, `scan_feedback`: full owner-scoped CRUD
  (SELECT, INSERT, UPDATE, DELETE) where `user_id = auth.uid()`. Each verb has its own policy.
- No public read access on any table.
- `food_log_items` ownership is verified via `user_id` column directly (not through parent).

## Triggers

- `handle_new_user`: AFTER INSERT on auth.users → creates a profiles row so every new auth
  user has a profile immediately.
- `set_updated_at` on profiles and food_logs: auto-updates `updated_at` on row change.

## Storage

- Creates a private bucket `food-images` (no public access).
- Storage policies: authenticated users can INSERT, SELECT, UPDATE, DELETE only objects
  under the path `{user_id}/...`.

## Notes

1. `user_id` columns default to `auth.uid()` so frontend inserts that omit `user_id`
   still satisfy the INSERT policy's `WITH CHECK (auth.uid() = user_id)`.
2. All numeric nutrition columns use `numeric(10,2)` for precision.
3. Policies are dropped before recreate to stay idempotent on re-run.
*/

-- ============================================================================
-- PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  age_range text,
  height_cm numeric(6,2),
  weight_kg numeric(6,2),
  activity_level text,
  goal text,
  calorie_goal integer,
  sugar_goal_g integer,
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================================
-- FOOD_LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS food_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at timestamptz NOT NULL DEFAULT now(),
  meal_type text NOT NULL,
  image_path text,
  source text NOT NULL DEFAULT 'manual',
  total_calories numeric(10,2) NOT NULL DEFAULT 0,
  total_protein_g numeric(10,2) NOT NULL DEFAULT 0,
  total_carbs_g numeric(10,2) NOT NULL DEFAULT 0,
  total_fat_g numeric(10,2) NOT NULL DEFAULT 0,
  total_fiber_g numeric(10,2) NOT NULL DEFAULT 0,
  total_sugar_g numeric(10,2) NOT NULL DEFAULT 0,
  total_added_sugar_g numeric(10,2) NOT NULL DEFAULT 0,
  ai_confidence numeric(5,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_food_logs_user_logged_at ON food_logs(user_id, logged_at DESC);

ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "food_logs_select_own" ON food_logs;
CREATE POLICY "food_logs_select_own" ON food_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "food_logs_insert_own" ON food_logs;
CREATE POLICY "food_logs_insert_own" ON food_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "food_logs_update_own" ON food_logs;
CREATE POLICY "food_logs_update_own" ON food_logs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "food_logs_delete_own" ON food_logs;
CREATE POLICY "food_logs_delete_own" ON food_logs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- FOOD_LOG_ITEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS food_log_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_log_id uuid NOT NULL REFERENCES food_logs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  serving_label text,
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  calories numeric(10,2) NOT NULL DEFAULT 0,
  protein_g numeric(10,2) NOT NULL DEFAULT 0,
  carbs_g numeric(10,2) NOT NULL DEFAULT 0,
  fat_g numeric(10,2) NOT NULL DEFAULT 0,
  fiber_g numeric(10,2) NOT NULL DEFAULT 0,
  sugar_g numeric(10,2) NOT NULL DEFAULT 0,
  added_sugar_g numeric(10,2) NOT NULL DEFAULT 0,
  confidence numeric(5,2),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_food_log_items_food_log_id ON food_log_items(food_log_id);
CREATE INDEX IF NOT EXISTS idx_food_log_items_user_id ON food_log_items(user_id);

ALTER TABLE food_log_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "food_log_items_select_own" ON food_log_items;
CREATE POLICY "food_log_items_select_own" ON food_log_items FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "food_log_items_insert_own" ON food_log_items;
CREATE POLICY "food_log_items_insert_own" ON food_log_items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "food_log_items_update_own" ON food_log_items;
CREATE POLICY "food_log_items_update_own" ON food_log_items FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "food_log_items_delete_own" ON food_log_items;
CREATE POLICY "food_log_items_delete_own" ON food_log_items FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- CUSTOM_FOODS
-- ============================================================================
CREATE TABLE IF NOT EXISTS custom_foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  serving_label text,
  calories numeric(10,2) NOT NULL DEFAULT 0,
  protein_g numeric(10,2) NOT NULL DEFAULT 0,
  carbs_g numeric(10,2) NOT NULL DEFAULT 0,
  fat_g numeric(10,2) NOT NULL DEFAULT 0,
  fiber_g numeric(10,2) NOT NULL DEFAULT 0,
  sugar_g numeric(10,2) NOT NULL DEFAULT 0,
  added_sugar_g numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_custom_foods_user_id ON custom_foods(user_id);

ALTER TABLE custom_foods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "custom_foods_select_own" ON custom_foods;
CREATE POLICY "custom_foods_select_own" ON custom_foods FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "custom_foods_insert_own" ON custom_foods;
CREATE POLICY "custom_foods_insert_own" ON custom_foods FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "custom_foods_update_own" ON custom_foods;
CREATE POLICY "custom_foods_update_own" ON custom_foods FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "custom_foods_delete_own" ON custom_foods;
CREATE POLICY "custom_foods_delete_own" ON custom_foods FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- SCAN_FEEDBACK
-- ============================================================================
CREATE TABLE IF NOT EXISTS scan_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  food_log_id uuid REFERENCES food_logs(id) ON DELETE SET NULL,
  original_ai_response jsonb,
  corrected_items jsonb,
  helpful boolean,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scan_feedback_user_id ON scan_feedback(user_id);

ALTER TABLE scan_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "scan_feedback_select_own" ON scan_feedback;
CREATE POLICY "scan_feedback_select_own" ON scan_feedback FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "scan_feedback_insert_own" ON scan_feedback;
CREATE POLICY "scan_feedback_insert_own" ON scan_feedback FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "scan_feedback_update_own" ON scan_feedback;
CREATE POLICY "scan_feedback_update_own" ON scan_feedback FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "scan_feedback_delete_own" ON scan_feedback;
CREATE POLICY "scan_feedback_delete_own" ON scan_feedback FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-create a profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at on profiles
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS food_logs_set_updated_at ON food_logs;
CREATE TRIGGER food_logs_set_updated_at
  BEFORE UPDATE ON food_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- STORAGE BUCKET
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('food-images', 'food-images', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: users can manage only their own folder {user_id}/...
DROP POLICY IF EXISTS "food_images_insert_own" ON storage.objects;
CREATE POLICY "food_images_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'food-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "food_images_select_own" ON storage.objects;
CREATE POLICY "food_images_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'food-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "food_images_update_own" ON storage.objects;
CREATE POLICY "food_images_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'food-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'food-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "food_images_delete_own" ON storage.objects;
CREATE POLICY "food_images_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'food-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );