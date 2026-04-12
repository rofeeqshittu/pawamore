-- Add unique index on products.source_url to prevent duplicate imports
-- IMPORTANT: Ensure there are no duplicate non-null source_url values before applying this migration.
-- If duplicates exist, resolve them manually (merge/delete) then run this migration.

-- Create a partial unique index to ignore NULL source_url values
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_source_url_unique ON products (source_url) WHERE source_url IS NOT NULL;
