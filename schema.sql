CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_url TEXT,
  source_platform TEXT,
  original_name TEXT NOT NULL,
  translated_name TEXT,
  source_cost NUMERIC,
  options_json TEXT,
  image_urls_json TEXT,
  estimated_weight TEXT,
  estimated_volume TEXT,
  sourcing_memo TEXT,
  current_status TEXT NOT NULL DEFAULT 'candidate'
    CHECK (current_status IN (
      'candidate',
      'selection_proceed',
      'selection_hold',
      'selection_exclude',
      'risk_reviewed',
      'margin_reviewed',
      'listing_drafted',
      'approved',
      'rejected',
      'registered'
    )),
  collected_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE selection_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  selection_status TEXT NOT NULL
    CHECK (selection_status IN ('proceed', 'hold', 'exclude')),
  demand_signal TEXT NOT NULL
    CHECK (demand_signal IN ('high', 'medium', 'low', 'uncertain')),
  competition_level TEXT NOT NULL
    CHECK (competition_level IN ('low', 'medium', 'high')),
  price_attractiveness TEXT NOT NULL
    CHECK (price_attractiveness IN ('good', 'uncertain', 'poor')),
  sourcing_difficulty TEXT NOT NULL
    CHECK (sourcing_difficulty IN ('easy', 'medium', 'hard')),
  selection_score INTEGER NOT NULL CHECK (selection_score BETWEEN 0 AND 100),
  reason_codes_json TEXT NOT NULL DEFAULT '[]',
  reviewer_note TEXT,
  reviewed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE risk_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  recommendation TEXT NOT NULL
    CHECK (recommendation IN ('recommend', 'hold', 'not_recommended')),
  required_notices_json TEXT NOT NULL DEFAULT '[]',
  manual_review_items_json TEXT NOT NULL DEFAULT '[]',
  reason_codes_json TEXT NOT NULL DEFAULT '[]',
  reviewed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE margin_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  source_cost NUMERIC NOT NULL,
  overseas_shipping_fee NUMERIC DEFAULT 0,
  exchange_rate NUMERIC NOT NULL,
  exchange_rate_buffer NUMERIC DEFAULT 0,
  payment_fee NUMERIC DEFAULT 0,
  forwarding_fee NUMERIC DEFAULT 0,
  domestic_shipping_fee NUMERIC DEFAULT 0,
  marketplace_fee_rate NUMERIC DEFAULT 0,
  ad_cost_assumption NUMERIC DEFAULT 0,
  cs_return_buffer NUMERIC DEFAULT 0,
  recommended_price NUMERIC NOT NULL,
  estimated_net_profit NUMERIC NOT NULL,
  net_margin_rate NUMERIC NOT NULL,
  break_even_price NUMERIC NOT NULL,
  registration_available INTEGER NOT NULL CHECK (registration_available IN (0, 1)),
  reviewed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE listing_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  version_label TEXT NOT NULL,
  ai_draft_json TEXT NOT NULL,
  human_edited_json TEXT,
  final_listing_json TEXT,
  prompt_version TEXT,
  template_version TEXT,
  input_snapshot_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE review_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  listing_version_id INTEGER REFERENCES listing_versions(id),
  action TEXT NOT NULL
    CHECK (action IN ('approve', 'hold', 'reject', 'edit', 'regenerate_requested', 'registered')),
  reason_codes_json TEXT NOT NULL DEFAULT '[]',
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_current_status ON products(current_status);
CREATE INDEX idx_selection_reviews_product_id ON selection_reviews(product_id);
CREATE INDEX idx_selection_reviews_status ON selection_reviews(selection_status);
CREATE INDEX idx_risk_reviews_product_id ON risk_reviews(product_id);
CREATE INDEX idx_margin_reviews_product_id ON margin_reviews(product_id);
CREATE INDEX idx_listing_versions_product_id ON listing_versions(product_id);
CREATE INDEX idx_review_actions_product_id ON review_actions(product_id);

CREATE TRIGGER validate_selection_review_insert
BEFORE INSERT ON selection_reviews
BEGIN
  SELECT CASE
    WHEN NEW.selection_status = 'exclude' AND NEW.reason_codes_json = '[]'
    THEN RAISE(ABORT, 'exclude selection requires at least one reason code')
  END;

  SELECT CASE
    WHEN NEW.selection_status = 'hold'
      AND NEW.reason_codes_json = '[]'
      AND (NEW.reviewer_note IS NULL OR trim(NEW.reviewer_note) = '')
    THEN RAISE(ABORT, 'hold selection requires a reason code or reviewer note')
  END;
END;

CREATE TRIGGER validate_selection_review_update
BEFORE UPDATE ON selection_reviews
BEGIN
  SELECT CASE
    WHEN NEW.selection_status = 'exclude' AND NEW.reason_codes_json = '[]'
    THEN RAISE(ABORT, 'exclude selection requires at least one reason code')
  END;

  SELECT CASE
    WHEN NEW.selection_status = 'hold'
      AND NEW.reason_codes_json = '[]'
      AND (NEW.reviewer_note IS NULL OR trim(NEW.reviewer_note) = '')
    THEN RAISE(ABORT, 'hold selection requires a reason code or reviewer note')
  END;
END;

CREATE TRIGGER prevent_risk_review_for_excluded_product
BEFORE INSERT ON risk_reviews
WHEN (
  SELECT sr.selection_status
  FROM selection_reviews sr
  WHERE sr.product_id = NEW.product_id
  ORDER BY sr.reviewed_at DESC, sr.id DESC
  LIMIT 1
) = 'exclude'
BEGIN
  SELECT RAISE(ABORT, 'excluded products cannot continue to risk screening');
END;

CREATE TRIGGER prevent_margin_review_for_excluded_product
BEFORE INSERT ON margin_reviews
WHEN (
  SELECT sr.selection_status
  FROM selection_reviews sr
  WHERE sr.product_id = NEW.product_id
  ORDER BY sr.reviewed_at DESC, sr.id DESC
  LIMIT 1
) = 'exclude'
BEGIN
  SELECT RAISE(ABORT, 'excluded products cannot continue to margin review');
END;
