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
