-- Add deleted_at column to products for soft-delete support
BEGIN;
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;
COMMIT;