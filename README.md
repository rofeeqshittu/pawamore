# PawaMore — Solar Energy E-Commerce Platform

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## What technologies are used?

- **Vite** + **React** + **TypeScript**
- **shadcn-ui** + **Tailwind CSS**
- **Supabase** (PostgreSQL, Auth, Edge Functions, Storage)
- **Vitest** (unit tests)

---

## How can I edit this code?

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

**Use your preferred IDE**

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm install

# Step 4: Start the dev server
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file → pencil icon → commit.

**Use GitHub Codespaces**

- Code → Codespaces → New codespace.

---

## Running Tests

```sh
npm run test          # run once
npm run test:watch    # watch mode
```

---

## AI Product Scraper

See [`AI_PRODUCT_SCRAPER_PLAN.md`](./AI_PRODUCT_SCRAPER_PLAN.md) for the full architecture.

### What it does

The AI Product Scraper lets admins paste any solar product URL into the Admin Dashboard
(Scraper tab). PawaMore then:

1. Fetches the page HTML via the `scrape-product` Supabase Edge Function.
2. Sends a compact version of the HTML to **Gemini Flash** (via the Lovable AI Gateway).
3. Extracts name, description, specs, price, images, and more.
4. Upserts the product into Supabase and stores a run record in `scraper_runs`.

### Running locally

```sh
# Start Supabase
supabase start

# Apply all migrations (creates scraper_runs table)
supabase db push

# Serve the scrape-product Edge Function
supabase functions serve scrape-product --env-file .env.local

# Trigger a scrape
curl -X POST http://localhost:54321/functions/v1/scrape-product \
  -H "Authorization: Bearer <admin-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://itelsolar.com/product/itel-500w-solar-generator-1000wh-lithium-battery-iess-05k10p/"}'
```

### Required environment variables

| Variable                    | Description                              |
|-----------------------------|------------------------------------------|
| `LOVABLE_API_KEY`           | API key for the Lovable AI Gateway       |
| `SUPABASE_URL`              | Your Supabase project URL                |
| `SUPABASE_ANON_KEY`         | Supabase anonymous key                   |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-only)  |
| `VITE_SUPABASE_URL`         | Supabase URL exposed to the frontend     |

---

## Deploying

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click
**Share → Publish**.

To connect a custom domain, go to Project → Settings → Domains → Connect Domain.
([Docs](https://docs.lovable.dev/features/custom-domain#custom-domain))

