-- ProposalForge MVP schema. Run this in your Supabase SQL editor.
-- AI proposal generation + pricing + public token-gated view + simple e-sign.
-- 4 tables, row-level security on all. user_id-owned.
-- Roadmap (Stripe payments, PDF export, full template library, per-section
-- analytics, multi-signer) is intentionally omitted from the MVP.

-- 1. Proposals
CREATE TABLE IF NOT EXISTS pf_proposals (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','viewed','signed','expired')),
  client_name         TEXT NOT NULL,
  client_email        TEXT,
  client_company      TEXT,
  project_name        TEXT NOT NULL,
  project_description  TEXT,
  -- AI-generated body: array of { id, heading, body } sections.
  sections            JSONB NOT NULL DEFAULT '[]',
  currency            TEXT NOT NULL DEFAULT 'USD',
  tax_rate            NUMERIC(5,2) NOT NULL DEFAULT 0,
  subtotal            NUMERIC(12,2) NOT NULL DEFAULT 0,
  total               NUMERIC(12,2) NOT NULL DEFAULT 0,
  view_token          TEXT UNIQUE NOT NULL DEFAULT replace(gen_random_uuid()::text,'-',''),
  ai_brief            TEXT,
  sent_at             TIMESTAMPTZ,
  signed_at           TIMESTAMPTZ,
  signer_name         TEXT,
  signer_ip           TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pf_proposals_user ON pf_proposals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_pf_proposals_token ON pf_proposals(view_token);
ALTER TABLE pf_proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pf_proposals_owner" ON pf_proposals
  FOR ALL USING (auth.uid() = user_id);
-- The prospect viewing via the unguessable token. Drafts stay private.
CREATE POLICY "pf_proposals_public_read" ON pf_proposals
  FOR SELECT USING (status IN ('sent','viewed','signed','expired'));

-- 2. Pricing items
CREATE TABLE IF NOT EXISTS pf_pricing_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES pf_proposals(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  quantity    NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price  NUMERIC(12,2) NOT NULL DEFAULT 0,
  is_optional BOOLEAN NOT NULL DEFAULT false,
  is_selected BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pf_pricing_proposal ON pf_pricing_items(proposal_id, sort_order);
ALTER TABLE pf_pricing_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pf_pricing_owner" ON pf_pricing_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pf_proposals p WHERE p.id = pf_pricing_items.proposal_id AND p.user_id = auth.uid())
  );
CREATE POLICY "pf_pricing_public_read" ON pf_pricing_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pf_proposals p WHERE p.id = pf_pricing_items.proposal_id
            AND p.status IN ('sent','viewed','signed','expired'))
  );

-- 3. View events (engagement tracking)
CREATE TABLE IF NOT EXISTS pf_view_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES pf_proposals(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL,
  section_id  TEXT,
  metadata    JSONB,
  viewer_ip   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pf_view_events_proposal ON pf_view_events(proposal_id, created_at);
ALTER TABLE pf_view_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pf_view_events_owner_read" ON pf_view_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pf_proposals p WHERE p.id = pf_view_events.proposal_id AND p.user_id = auth.uid())
  );
-- Anyone viewing a proposal can log an event (like analytics beacons). Intentional.
CREATE POLICY "pf_view_events_public_insert" ON pf_view_events
  FOR INSERT WITH CHECK (true);

-- 4. Templates (saved brand/terms presets)
CREATE TABLE IF NOT EXISTS pf_templates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  template_type     TEXT NOT NULL DEFAULT 'custom',
  default_terms     TEXT,
  brand_config      JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pf_templates_user ON pf_templates(user_id);
ALTER TABLE pf_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pf_templates_owner" ON pf_templates
  FOR ALL USING (auth.uid() = user_id);
