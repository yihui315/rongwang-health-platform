CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY,
  source VARCHAR(50) NOT NULL,
  source_url TEXT NOT NULL,
  external_id VARCHAR(255),
  title TEXT NOT NULL,
  subtitle TEXT,
  brand VARCHAR(255),
  origin_country VARCHAR(100),
  category VARCHAR(100),
  price_text VARCHAR(100),
  specs JSONB DEFAULT '{}'::jsonb,
  raw_payload JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  concern TEXT NOT NULL,
  scenario_slug VARCHAR(100),
  source VARCHAR(100) NOT NULL DEFAULT 'ai_consult',
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  stop_contact_requested BOOLEAN NOT NULL DEFAULT FALSE,
  retention_expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consent_records (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id),
  privacy_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  sensitive_health_data_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  marketing_contact_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  version VARCHAR(100) NOT NULL,
  page TEXT NOT NULL,
  accepted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMP,
  retention_expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS health_reports (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id),
  report_version VARCHAR(100) NOT NULL,
  scenario_slug VARCHAR(100) NOT NULL,
  scenario_label TEXT NOT NULL,
  risk_level VARCHAR(50) NOT NULL,
  overall_score INT NOT NULL,
  red_flags JSONB DEFAULT '[]'::jsonb,
  manual_review_required BOOLEAN NOT NULL DEFAULT TRUE,
  sections JSONB DEFAULT '[]'::jsonb,
  nutrition_directions JSONB DEFAULT '[]'::jsonb,
  next_actions JSONB DEFAULT '[]'::jsonb,
  disclaimers JSONB DEFAULT '[]'::jsonb,
  audit JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'pending_manual_review',
  review_notes TEXT,
  reviewer VARCHAR(255),
  reviewed_at TIMESTAMP,
  retention_expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketing_plans (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL REFERENCES health_reports(id),
  lead_id TEXT NOT NULL REFERENCES leads(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending_manual_review',
  automation_level VARCHAR(50) NOT NULL DEFAULT 'draft_only',
  audience JSONB DEFAULT '{}'::jsonb,
  steps JSONB DEFAULT '[]'::jsonb,
  compliance_checklist JSONB DEFAULT '[]'::jsonb,
  compliance_summary JSONB DEFAULT '{}'::jsonb,
  manual_follow_up JSONB DEFAULT '{}'::jsonb,
  guardrails JSONB DEFAULT '[]'::jsonb,
  workflow JSONB DEFAULT '{}'::jsonb,
  review_notes TEXT,
  reviewer VARCHAR(255),
  reviewed_at TIMESTAMP,
  review_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outbound_queue (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id),
  report_id TEXT REFERENCES health_reports(id),
  marketing_plan_id TEXT REFERENCES marketing_plans(id),
  channel VARCHAR(50) NOT NULL,
  message_intent VARCHAR(50) NOT NULL DEFAULT 'education',
  payload JSONB DEFAULT '{}'::jsonb,
  gate_snapshot JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'blocked',
  blocked_reasons JSONB DEFAULT '[]'::jsonb,
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,
  failure_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS send_events (
  id TEXT PRIMARY KEY,
  outbound_queue_id TEXT NOT NULL REFERENCES outbound_queue(id),
  event_type VARCHAR(100) NOT NULL,
  provider VARCHAR(100),
  provider_message_id VARCHAR(255),
  payload JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  actor VARCHAR(255) NOT NULL DEFAULT 'system',
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(100) NOT NULL,
  target_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_source_created_at ON leads(source, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_reports_lead_status ON health_reports(lead_id, status);
CREATE INDEX IF NOT EXISTS idx_marketing_plans_lead_status ON marketing_plans(lead_id, status);
CREATE INDEX IF NOT EXISTS idx_outbound_queue_status_channel ON outbound_queue(status, channel);

CREATE TABLE IF NOT EXISTS product_contents (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  short_title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT NOT NULL,
  seo_keywords JSONB DEFAULT '[]'::jsonb,
  faq_draft JSONB DEFAULT '[]'::jsonb,
  disclaimer TEXT,
  risk_flags JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'generated',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  type VARCHAR(20) NOT NULL,
  url TEXT NOT NULL,
  asset_id VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  content_id UUID REFERENCES product_contents(id),
  channel VARCHAR(50) NOT NULL,
  external_listing_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'queued',
  failure_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID PRIMARY KEY,
  task_type VARCHAR(100) NOT NULL,
  target_type VARCHAR(100) NOT NULL,
  target_id UUID,
  input_payload JSONB DEFAULT '{}'::jsonb,
  output_payload JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_by VARCHAR(255),
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_reviews (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  content_id UUID REFERENCES product_contents(id),
  review_status VARCHAR(50) NOT NULL DEFAULT 'pending_manual_review',
  risk_level VARCHAR(50) NOT NULL DEFAULT 'medium',
  risk_flags JSONB DEFAULT '[]'::jsonb,
  review_notes TEXT,
  reviewer VARCHAR(255),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  channel VARCHAR(50) NOT NULL,
  campaign_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaign_stats (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  stat_date DATE NOT NULL,
  impressions INT NOT NULL DEFAULT 0,
  clicks INT NOT NULL DEFAULT 0,
  conversions INT NOT NULL DEFAULT 0,
  cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
