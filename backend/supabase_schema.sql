-- UNVEILED — Supabase Database Schema
-- Run this in your Supabase SQL Editor (supabase.com → your project → SQL Editor)
-- NO PERSONAL DATA IS STORED — only domains, scores, and anonymous session IDs

-- ── Scans ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scans (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    url_domain          TEXT NOT NULL,          -- domain only, never full URL
    reality_score       INTEGER CHECK (reality_score BETWEEN 0 AND 100),
    ai_probability      FLOAT CHECK (ai_probability BETWEEN 0 AND 1),
    manipulation_score  INTEGER CHECK (manipulation_score BETWEEN 0 AND 100),
    source_credibility  INTEGER CHECK (source_credibility BETWEEN 0 AND 100),
    country_code        TEXT DEFAULT 'US',
    anonymous_session_id UUID
);

-- ── Bubble Audits ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bubble_audits (
    id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    bubble_score         INTEGER CHECK (bubble_score BETWEEN 0 AND 100),
    dominant_category    TEXT,
    missing_perspectives TEXT[],
    anonymous_session_id UUID
);

-- ── Opportunity Gaps ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS opportunity_gaps (
    id                          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at                  TIMESTAMPTZ DEFAULT NOW(),
    skills_category             TEXT,
    opportunities_found         INTEGER,
    opportunities_shown_estimate INTEGER,
    gap_size                    INTEGER,
    country_code                TEXT DEFAULT 'US'
);

-- ── Indexes for aggregate queries ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_scans_domain     ON scans (url_domain);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bubble_created   ON bubble_audits (created_at DESC);

-- ── Row Level Security — public read for aggregates, public insert ─────────────
ALTER TABLE scans            ENABLE ROW LEVEL SECURITY;
ALTER TABLE bubble_audits    ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_gaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous insert" ON scans
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous insert" ON bubble_audits
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous insert" ON opportunity_gaps
    FOR INSERT WITH CHECK (true);

-- Aggregates are readable (no personal data stored)
CREATE POLICY "Allow public read" ON scans
    FOR SELECT USING (true);

CREATE POLICY "Allow public read" ON bubble_audits
    FOR SELECT USING (true);

CREATE POLICY "Allow public read" ON opportunity_gaps
    FOR SELECT USING (true);
