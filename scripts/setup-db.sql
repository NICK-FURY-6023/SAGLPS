-- ============================================
-- Shree Ganpati Agency — Label Print System
-- Database Setup Script
-- ============================================
-- Run this SQL in Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard/project/sxgrmjpkhyiacxnxijzm/sql/new
-- ============================================

-- 1. Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  label_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create drafts table (single-row: stores current working state)
CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY DEFAULT 'default',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create history table (print/save operation log)
CREATE TABLE IF NOT EXISTS history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  template_name TEXT,
  auto_name TEXT,
  filled_count INT DEFAULT 0,
  copies INT DEFAULT 1,
  page_count INT DEFAULT 1,
  labels_per_page INT DEFAULT 12,
  pages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON history (created_at DESC);

-- 5. Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_drafts_updated_at ON drafts;
CREATE TRIGGER update_drafts_updated_at
  BEFORE UPDATE ON drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Grant access to Supabase roles (required for REST API)
GRANT ALL ON templates TO anon;
GRANT ALL ON templates TO authenticated;
GRANT ALL ON templates TO service_role;

GRANT ALL ON drafts TO anon;
GRANT ALL ON drafts TO authenticated;
GRANT ALL ON drafts TO service_role;

GRANT ALL ON history TO anon;
GRANT ALL ON history TO authenticated;
GRANT ALL ON history TO service_role;

-- 7. Disable RLS (auth is handled at API layer via JWT)
ALTER TABLE templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE drafts DISABLE ROW LEVEL SECURITY;
ALTER TABLE history DISABLE ROW LEVEL SECURITY;

-- ============================================
-- Verification: Run this to confirm setup
-- SELECT count(*) FROM templates;
-- SELECT count(*) FROM drafts;
-- SELECT count(*) FROM history;
-- Expected: 0 for all (empty tables, ready to use)
-- ============================================
