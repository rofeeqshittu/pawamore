# AI Product Scraper — Plan & Architecture

## Overview

The AI Product Scraper automatically imports solar/energy products into the PawaMore
database by fetching a product URL, sending the HTML to an AI model, and persisting the
structured result to Supabase. Admins trigger scrapes from the Admin Dashboard; results
are tracked in the `scraper_runs` table so every import is auditable.

---

## Architecture

```
Admin Dashboard (ScraperManager UI)
        │  POST { url }
        ▼
Supabase Edge Function  ─ scrape-product
        │
        ├─ 1. Insert scraper_runs row (status = 'running')
        │
        ├─ 2. fetch(url) → raw HTML
        │
        ├─ 3. POST HTML to Lovable AI Gateway (Gemini Flash)
        │      with structured extraction prompt
        │
        ├─ 4. Parse JSON response → validate fields
        │
        ├─ 5a. Upsert products row (slug-based deduplication)
        ├─ 5b. Upsert product_images rows
        │
        └─ 6. Update scraper_runs (status = 'success' | 'error', product_id)

Frontend polls / re-fetches scraper_runs for display.
```

---

## Database

### `scraper_runs` table

| Column           | Type        | Notes                                        |
|------------------|-------------|----------------------------------------------|
| `id`             | UUID PK     | auto-generated                               |
| `url`            | TEXT        | source product URL                           |
| `status`         | TEXT        | `pending` \| `running` \| `success` \| `error` |
| `product_id`     | UUID FK     | references `products.id` (nullable)          |
| `error_message`  | TEXT        | populated on failure                         |
| `extracted_data` | JSONB       | raw AI extraction result (debug/audit)       |
| `created_at`     | TIMESTAMPTZ | auto                                         |
| `updated_at`     | TIMESTAMPTZ | auto (trigger)                               |

RLS: admins manage all rows; public has no access.

---

## Supabase Edge Function — `scrape-product`

**Route:** `POST /functions/v1/scrape-product`

**Auth:** Requires admin JWT (`Authorization: Bearer <token>`).

**Request body:**
```json
{ "url": "https://itelsolar.com/product/some-product/" }
```

**Response (success):**
```json
{
  "run_id": "<uuid>",
  "product_id": "<uuid>",
  "product_name": "iTel 500W Solar Generator …",
  "status": "success"
}
```

**Response (error):**
```json
{
  "run_id": "<uuid>",
  "status": "error",
  "error": "Failed to fetch URL: 404"
}
```

### AI Extraction Prompt

The function sends a compact version of the page HTML together with a structured prompt
asking Gemini Flash to extract:

```
name, slug, short_description, description (HTML), price (number, NGN),
discount_price (number|null), specs (object), powers (string),
ideal_for (string), is_featured (bool), is_popular (bool),
promo_label (string|null), stock_quantity (number),
status ('active'|'draft'|'out_of_stock'),
images: [{ url, alt_text }]
```

---

## Frontend — `ScraperManager` Admin Component

Located at: `src/components/admin/ScraperManager.tsx`

Features:
- URL input + "Scrape Product" button
- Live status (pending → running → success/error) with auto-refresh every 3 s
- Table of recent scraper runs (last 20) with link to product and error details
- "View Product" link opens `AdminProductForm` for immediate editing

Integrated as a new **"Scraper"** tab inside `AdminDashboard`.

---

## Environment Variables

| Variable                  | Where used              |
|---------------------------|-------------------------|
| `LOVABLE_API_KEY`         | Edge Function (AI call) |
| `SUPABASE_URL`            | Edge Function           |
| `SUPABASE_ANON_KEY`       | Edge Function (auth)    |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Function (DB writes) |

All already present in the Supabase project secrets.

---

## Running the Scraper Locally

```bash
# 1. Start Supabase locally
supabase start

# 2. Apply migrations (creates scraper_runs table)
supabase db push

# 3. Serve Edge Functions
supabase functions serve scrape-product --env-file .env.local

# 4. Test with curl
curl -X POST http://localhost:54321/functions/v1/scrape-product \
  -H "Authorization: Bearer <admin-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://itelsolar.com/product/itel-500w-solar-generator-1000wh-lithium-battery-iess-05k10p/"}'
```

---

## Running Scraper in CI

Add a workflow step after migrations:

```yaml
- name: Smoke-test scraper function
  run: |
    curl -sf -X POST $SUPABASE_FUNCTIONS_URL/scrape-product \
      -H "Authorization: Bearer $ADMIN_JWT" \
      -H "Content-Type: application/json" \
      -d '{"url":"$TEST_PRODUCT_URL"}' | jq .status
```

---

## Gap Analysis (Plan vs. Implementation at Time of Writing)

| Feature                          | Status before this PR     |
|----------------------------------|---------------------------|
| `AI_PRODUCT_SCRAPER_PLAN.md`     | ❌ Missing                |
| `scraper_runs` DB table          | ❌ Missing                |
| `scrape-product` Edge Function   | ❌ Missing                |
| `ScraperManager` admin UI        | ❌ Missing                |
| Scraper tab in AdminDashboard    | ❌ Missing                |
| Supabase types for scraper_runs  | ❌ Missing                |
| Scraper utility types/helpers    | ❌ Missing                |
| Tests for scraper utilities      | ❌ Missing                |
| iTel product seed SQL            | ✅ Present (manual import)|
| `prefer-const` lint error        | ✅ Fixed in this PR       |

All items are addressed in this PR.
