Instructions for the Lovable AI to apply DB migrations and finalize Admin product management upgrades

Overview
This repo has added several DB migrations and code changes that need to be applied to the live Supabase instance and deployed. The "lovable AI" which has direct access to Supabase can run the following commands.

Migrations to apply (in order):
1. supabase/migrations/20260412193400_add_deleted_at_to_products.sql
   - Adds deleted_at timestamptz to products for soft-delete auditability.
2. supabase/migrations/20260412194000_set_deleted_at_trigger.sql
   - Creates a trigger function set_deleted_at() and attaches it to products to automatically set/clear deleted_at when status changes.
3. supabase/migrations/20260412230000_add_unique_source_url_to_products.sql
   - Adds a UNIQUE index on products.source_url to prevent duplicate imports. IMPORTANT: ensure duplicates are resolved before applying this migration.


Also review/consider applying RLS policies in supabase/README_RLS.md to prevent accidental hard deletes.

Steps (preferred: use Supabase CLI):
- Ensure the environment where this runs has access to the Supabase project (service role) and the supabase CLI is installed and authenticated.
- Run migrations with supabase CLI (example):

  supabase db push
  # or if you use the newer migrations runner:
  supabase migration run

- Alternatively, using psql and DATABASE_URL:

  psql "$DATABASE_URL" -f supabase/migrations/20260412193400_add_deleted_at_to_products.sql
  psql "$DATABASE_URL" -f supabase/migrations/20260412194000_set_deleted_at_trigger.sql

CI workflow (already added):
- A GitHub Actions workflow .github/workflows/ci_migrate_deploy.yml runs ci_apply_migrations_and_deploy.sh on pushes to feature/admin-product-management. Ensure repository secrets are configured:
  - DATABASE_URL
  - VERCEL_TOKEN (optional, for Vercel deploy)

Manual verification checklist after migrations:
1. Confirm products table has deleted_at column:
   psql "$DATABASE_URL" -c "\d+ public.products"
2. Create a test product; update status to 'deleted'; verify deleted_at is set and product excluded from default product queries.
3. Restore the product by setting status back (e.g., 'draft') and ensure deleted_at is cleared.
4. Test Trash tab in admin UI: the deleted product should show in Trash and restore/purge actions should behave as expected.
5. Test bulk actions (set featured, popular, move category, adjust price, export CSV) in Admin → Products.
6. Test review submission flow (with images) to confirm no upload errors and to confirm image URLs are created and displayed.

Optional: schedule an auto-purge job
- If desired, create a scheduled job to permanently purge products older than N days:

  -- Example: purge products deleted more than 30 days ago
  DELETE FROM product_images WHERE product_id IN (SELECT id FROM products WHERE status = 'deleted' AND deleted_at < now() - interval '30 days');
  DELETE FROM products WHERE status = 'deleted' AND deleted_at < now() - interval '30 days';

- Add this as a scheduled function in Supabase Edge or a cron job.

Contact
If any errors occur, collect the SQL errors and pipeline logs and attach them to the issue. For help, contact the repository owner @rofeeqshittu.
