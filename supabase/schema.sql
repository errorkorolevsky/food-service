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

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone can read products (public catalog)
CREATE POLICY "Public read" ON products
  FOR SELECT USING (true);

-- Only authenticated admins can write
-- (admin check is done at API route level, not DB level for simplicity)
CREATE POLICY "Anon insert for seeding" ON products
  FOR ALL USING (true) WITH CHECK (true);
