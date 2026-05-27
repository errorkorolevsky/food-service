-- ─── PRODUCTS TABLE ──────────────────────────────────────────────────────────
--
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- or via supabase db push if you have the CLI set up.
--

CREATE TABLE IF NOT EXISTS products (
  id               text        PRIMARY KEY,
  emoji            text        NOT NULL,
  image            text,
  category         text        NOT NULL,
  title            text        NOT NULL,
  description      text        NOT NULL,
  price            text        NOT NULL,
  price_num        integer     NOT NULL,
  old_price_num    integer,
  discount_percent integer,
  unit             text,
  rating           text        NOT NULL DEFAULT '5.0',
  in_stock         boolean     NOT NULL DEFAULT true,
  is_popular       boolean     NOT NULL DEFAULT false,
  is_new           boolean     NOT NULL DEFAULT false,
  is_hit           boolean     NOT NULL DEFAULT false,
  tags             text[]      NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_products_category  ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock  ON products (in_stock);
CREATE INDEX IF NOT EXISTS idx_products_is_new    ON products (is_new);
CREATE INDEX IF NOT EXISTS idx_products_is_hit    ON products (is_hit);
CREATE INDEX IF NOT EXISTS idx_products_is_popular ON products (is_popular);
CREATE INDEX IF NOT EXISTS idx_products_price_num ON products (price_num);

-- Full-text search index (Russian + English)
CREATE INDEX IF NOT EXISTS idx_products_fts ON products
  USING gin(to_tsvector('russian', title || ' ' || description || ' ' || array_to_string(tags, ' ')));

-- ─── UPDATED_AT TRIGGER ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── ROW LEVEL SECURITY (products) ───────────────────────────────────────────

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone can read products (public catalog)
CREATE POLICY "Public read" ON products
  FOR SELECT USING (true);

-- Only authenticated admins can write
-- (admin check is done at API route level, not DB level for simplicity)
CREATE POLICY "Anon insert for seeding" ON products
  FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- ─── ORDERS TABLE ─────────────────────────────────────────────────────────────
-- =============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  -- Customer info
  phone         text        NOT NULL,
  address       text        NOT NULL,
  company       text,
  comment       text,
  user_email    text,

  -- Order details
  payment       text        NOT NULL CHECK (payment IN ('kaspi', 'freedom', 'cash')),
  items         jsonb       NOT NULL DEFAULT '[]',
  subtotal      integer     NOT NULL CHECK (subtotal >= 0),
  delivery      integer     NOT NULL CHECK (delivery >= 0),
  total         integer     NOT NULL CHECK (total > 0),

  -- Delivery schedule
  delivery_date text,
  delivery_time text,

  -- Status lifecycle
  status        text        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'processing', 'in_delivery', 'delivered', 'cancelled'))
);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_phone       ON orders (phone);
CREATE INDEX IF NOT EXISTS idx_orders_user_email  ON orders (user_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at  ON orders (created_at DESC);

-- ─── UPDATED_AT TRIGGER ───────────────────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── ROW LEVEL SECURITY (orders) ─────────────────────────────────────────────

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Anyone can place an order
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public insert' AND tablename = 'orders') THEN
    CREATE POLICY "Public insert" ON orders FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Anyone can read orders (auth enforced at API route level)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public select' AND tablename = 'orders') THEN
    CREATE POLICY "Public select" ON orders FOR SELECT USING (true);
  END IF;
END $$;

-- Anyone can update orders (auth enforced at API route level for admin PATCH)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public update' AND tablename = 'orders') THEN
    CREATE POLICY "Public update" ON orders FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END $$;

-- =============================================================================
-- ─── USER FAVORITES TABLE ─────────────────────────────────────────────────────
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_favorites (
  user_email   text        NOT NULL,
  product_id   text        NOT NULL,
  product_data jsonb       NOT NULL DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_email, product_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_email ON user_favorites (user_email);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Auth enforced at API route level (NextAuth session check)
CREATE POLICY "Service role full access" ON user_favorites
  USING (true) WITH CHECK (true);

-- =============================================================================
-- ─── REVIEWS TABLE ────────────────────────────────────────────────────────────
-- =============================================================================

CREATE TABLE IF NOT EXISTS reviews (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   text        NOT NULL,
  user_email   text        NOT NULL,
  user_name    text,
  rating       integer     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text         text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_email)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_email  ON reviews (user_email);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at  ON reviews (product_id, created_at DESC);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Service role full access reviews" ON reviews
  USING (true) WITH CHECK (true);

-- =============================================================================
-- ─── PROMO CODES TABLE ────────────────────────────────────────────────────────
-- =============================================================================

CREATE TABLE IF NOT EXISTS promo_codes (
  code           text PRIMARY KEY,
  discount_type  text        NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value integer     NOT NULL CHECK (discount_value > 0),
  min_order      integer     NOT NULL DEFAULT 0,
  max_uses       integer,
  uses           integer     NOT NULL DEFAULT 0,
  expires_at     timestamptz,
  is_active      boolean     NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access promos" ON promo_codes
  USING (true) WITH CHECK (true);

-- =============================================================================
-- ─── ORDERS — add promo_code column ──────────────────────────────────────────
-- =============================================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount   integer NOT NULL DEFAULT 0;

-- =============================================================================
-- ─── RESTOCK SUBSCRIPTIONS ────────────────────────────────────────────────────
-- =============================================================================

CREATE TABLE IF NOT EXISTS restock_subscriptions (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email    text        NOT NULL,
  product_id    text        NOT NULL,
  product_title text        NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_email, product_id)
);

CREATE INDEX IF NOT EXISTS restock_subscriptions_product_id_idx ON restock_subscriptions (product_id);

ALTER TABLE restock_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access restock" ON restock_subscriptions USING (true) WITH CHECK (true);

-- =============================================================================
-- ─── PUSH SUBSCRIPTIONS ───────────────────────────────────────────────────────
-- =============================================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email text        NOT NULL,
  endpoint   text        NOT NULL UNIQUE,
  keys       jsonb       NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_email_idx ON push_subscriptions (user_email);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access push_subscriptions" ON push_subscriptions
  USING (true) WITH CHECK (true);
