-- Coupons table
CREATE TABLE IF NOT EXISTS bahja_coupons (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'percentage' CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC(10,2) NOT NULL,
  min_cart NUMERIC(10,2) DEFAULT 0,
  max_uses INTEGER DEFAULT 0,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Settings table
CREATE TABLE IF NOT EXISTS bahja_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Default admin password (CHANGE AFTER FIRST LOGIN via Admin Settings page)
-- The password 'Bahja2025' will be hashed by the server on first login
INSERT INTO bahja_settings (key, value) VALUES ('admin_password', 'Bahja2025')
ON CONFLICT (key) DO NOTHING;

-- Default shipping threshold
INSERT INTO bahja_settings (key, value) VALUES ('shipping_threshold', '400')
ON CONFLICT (key) DO NOTHING;

-- Add tracking and notes to orders
ALTER TABLE bahja_orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE bahja_orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- User profiles table (phone, addresses, etc.)
CREATE TABLE IF NOT EXISTS bahja_user_profiles (
  uid TEXT PRIMARY KEY,
  phone TEXT,
  display_name TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inventory table — tracks stock per product variant
CREATE TABLE IF NOT EXISTS bahja_inventory (
  id BIGSERIAL PRIMARY KEY,
  product_id TEXT NOT NULL,
  variant_key TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, variant_key)
);

-- Seed inventory with default stock (100 each variant for existing products)
-- Run after products are inserted
-- INSERT INTO bahja_inventory (product_id, variant_key, stock)
-- SELECT p.id, v.key, 100
-- FROM bahja_products p, jsonb_each_text(p.variants) AS v(key, val)
-- ON CONFLICT (product_id, variant_key) DO NOTHING;

-- Helper function to safely decrement inventory
-- If no inventory record exists, treat as unlimited stock (silently succeed)
CREATE OR REPLACE FUNCTION decrement_inventory(
  p_product_id TEXT,
  p_variant_key TEXT,
  p_qty INTEGER
) RETURNS void AS $$
BEGIN
  UPDATE bahja_inventory
  SET stock = stock - p_qty, updated_at = now()
  WHERE product_id = p_product_id AND variant_key = p_variant_key AND stock >= p_qty;
  IF NOT FOUND THEN
    -- No matching record, or insufficient stock
    -- Check if a record exists at all
    PERFORM 1 FROM bahja_inventory
    WHERE product_id = p_product_id AND variant_key = p_variant_key;
    IF FOUND THEN
      -- Record exists but insufficient stock
      RAISE EXCEPTION 'Insufficient stock for % / % (requested %)', p_product_id, p_variant_key, p_qty;
    END IF;
    -- No record = product not tracked in inventory = unlimited stock
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Notification log table — audit trail for admin order alerts
CREATE TABLE IF NOT EXISTS bahja_notification_log (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES bahja_orders(order_id),
  channel TEXT NOT NULL,
  status TEXT NOT NULL,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_log_order_id ON bahja_notification_log(order_id);
