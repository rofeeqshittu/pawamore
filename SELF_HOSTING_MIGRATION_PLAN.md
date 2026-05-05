# Self-Hosting Migration Plan — PawaMore Systems

> Goal: Split this single Lovable/Supabase project into an independently-hostable
> **frontend** and **backend** so you fully own deployment, infrastructure, and
> data — without breaking any existing feature.

Date drafted: May 5, 2026
Author: Lovable AI (research & recommendations)
Scope: Documentation only — no code changes performed.

---

## 1. Current Architecture Snapshot

### 1.1 Frontend
- **Framework:** React 18 + Vite 5 + TypeScript 5
- **UI:** Tailwind CSS v3, shadcn/ui (Radix), framer-motion, lucide-react
- **Data/State:** `@tanstack/react-query`, React Context (`AuthContext`, `CartContext`)
- **Routing:** `react-router-dom` v6 (BrowserRouter, SPA)
- **Forms/Validation:** `react-hook-form` + `zod`
- **Misc:** PWA service worker (`public/sw.js`), Recharts (admin analytics),
  react-markdown (chat), embla-carousel
- **Build output:** static SPA (`dist/`) — fully portable to any static host.

### 1.2 Backend (currently Supabase via Lovable Cloud)
- **Database:** Postgres (Supabase project ref `ijmhkuenipllgbotltyx`)
  - 22 tables (products, orders, profiles, user_roles, chat_*, scraper_*, etc.)
  - 9 SECURITY DEFINER functions (`has_role`, `handle_new_user`,
    `validate_order_item_price`, `recalculate_order_total`, `set_deleted_at`,
    `guard_review_approval`, `get_guest_order`, …)
  - Triggers on `auth.users` (handle_new_user), products (set_deleted_at),
    order_items (price/total enforcement), product_reviews (approval guard)
  - Custom enums: `app_role`, `order_status`
  - 29 SQL migrations under `supabase/migrations/`
- **Auth:** Supabase Auth (email/password, Google OAuth, JWT, HIBP enabled,
  email verification required, anonymous signup disabled)
- **Storage:** 3 public buckets — `product-images`, `review-images`, `avatars`
  (RLS scoped to user folder)
- **Edge Functions (Deno):** 9 functions
  - `ai-support-chat` — Lovable AI Gateway (Gemini) chatbot
  - `create-guest-order` — service-role guest checkout
  - `get-flutterwave-key` — exposes public key
  - `og-image-proxy` — OG image scraper proxy
  - `scrape-product`, `scrape-product-from-url` — AI product importer
  - `send-newsletter`, `send-order-receipt` — transactional email
  - `verify-payment` — Flutterwave verification
- **RLS:** Enabled on every public table, gated by `has_role(uid,'admin')`
- **Realtime:** Used by `chat_messages` (LiveChat); `orders` deliberately
  excluded for PII safety
- **Secrets in use:** `LOVABLE_API_KEY`, `FLUTTERWAVE_SECRET_KEY`,
  `FLUTTERWAVE_PUBLIC_KEY`, `SUPABASE_*`

### 1.3 Frontend → Backend touchpoints
- `src/integrations/supabase/client.ts` — single Supabase JS client (auto-generated)
- `src/integrations/supabase/types.ts` — generated DB types
- `supabase.from(...)` calls in ~35 files (direct PostgREST via supabase-js)
- `supabase.functions.invoke(...)` in 6 files (chat, checkout, scraper, newsletter, quick-buy)
- `supabase.auth.*` in AuthContext, Login, Signup, Reset/Forgot password
- `supabase.storage.*` for product images, avatars, review uploads
- `supabase.channel(...).on('postgres_changes', …)` for realtime chat

---

## 2. Recommended Target Architecture

You have two realistic paths. Pick one — they map cleanly to your effort budget.

### Option A — **Self-hosted Supabase** (RECOMMENDED, lowest risk)
Keep using `@supabase/supabase-js`, RLS, edge functions, auth, and storage,
but run the whole Supabase stack yourself (Docker Compose or Kubernetes).
**Pros:** ~zero frontend code changes, all 29 migrations and 9 functions work
as-is, RLS keeps your security model, realtime/storage/auth included.
**Cons:** You operate Postgres + Studio + GoTrue + PostgREST + Realtime +
Storage + Kong + Edge Runtime.

### Option B — **Custom Node/TS backend** (full ownership, more work)
Replace Supabase with a Node backend (Fastify/NestJS/Express) + Postgres +
S3-compatible storage + your own JWT auth. You rewrite RLS as application-layer
authorization, port the 9 edge functions to Node routes, and replace
realtime with WebSocket/SSE.
**Pros:** No Supabase lock-in, ordinary Node ops, easy to layer caching/queues.
**Cons:** Weeks of work, you re-implement auth + storage + realtime + RLS,
and you must regenerate frontend SDK.

> The plan below covers **both options**, with Option A as the primary path
> and a clearly-marked Option B section.

---

## 3. Proposed Repository Layout

Convert to a monorepo so frontend and backend are separately deployable but
share types.

```
pawamore/
├── apps/
│   ├── web/                  # Existing React/Vite app (moved from repo root)
│   │   ├── src/
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── backend/              # NEW — see Option A or B below
│       └── …
├── packages/
│   ├── shared-types/         # DB / API DTO types shared by web + backend
│   └── eslint-config/        # Optional shared lint config
├── infra/
│   ├── docker-compose.yml    # Local dev stack (Option A) or Postgres+API (Option B)
│   ├── supabase/             # Self-hosted Supabase config (Option A)
│   ├── nginx/ or caddy/      # Reverse proxy + TLS
│   └── k8s/ or terraform/    # Optional production IaC
├── .github/workflows/        # CI: lint, test, build, deploy
├── package.json              # Workspaces root (pnpm or bun)
├── turbo.json or nx.json     # Optional task runner
└── README.md
```

Use **pnpm workspaces** (or `bun` workspaces — you already use `bun.lock`).
Add `turborepo` for caching builds across apps.

---

## 4. Option A — Self-Hosted Supabase (Detailed Plan)

### 4.1 Backend folder (`apps/backend/`)

Mirror the existing `supabase/` directory structure, owned by you:

```
apps/backend/
├── docker-compose.yml             # Full Supabase stack
├── .env.example                   # All required env vars (no secrets committed)
├── volumes/                       # Persistent Postgres + Storage data (gitignored)
├── migrations/                    # Copy of supabase/migrations/*.sql (29 files)
├── functions/                     # Copy of supabase/functions/* (9 functions)
│   ├── ai-support-chat/
│   ├── create-guest-order/
│   ├── …
│   └── _shared/cors.ts
├── seed/                          # itel-product-seed.sql, fixtures
├── scripts/
│   ├── migrate.sh                 # supabase db push against self-host
│   ├── deploy-functions.sh        # supabase functions deploy --project-ref local
│   ├── backup.sh                  # pg_dump nightly
│   └── restore.sh
└── README.md
```

### 4.2 Stand up self-hosted Supabase

1. Clone the official `supabase/supabase` repo's `docker/` folder into
   `infra/supabase/`. It contains a production-ready compose file with
   Postgres, GoTrue (auth), PostgREST, Realtime, Storage API, imgproxy,
   Kong gateway, Studio, and Edge Runtime.
2. Configure `.env` (JWT secret, anon/service keys, SMTP, S3, OAuth client IDs).
3. `docker compose up -d` — you now have a Supabase clone on your hardware.
4. Apply migrations:
   ```bash
   supabase link --project-ref <self-host-ref>  # or use psql directly
   supabase db push                              # runs the 29 migrations
   ```
5. Deploy edge functions:
   ```bash
   for fn in ai-support-chat create-guest-order get-flutterwave-key \
             og-image-proxy scrape-product scrape-product-from-url \
             send-newsletter send-order-receipt verify-payment; do
     supabase functions deploy $fn --project-ref <self-host-ref>
   done
   ```
6. Recreate the 3 storage buckets and RLS policies (script provided in
   `apps/backend/scripts/init-storage.sh`).
7. Configure Auth providers (Google OAuth client ID/secret), HIBP, email
   verification, redirect URLs.

### 4.3 Frontend changes (minimal)

In `apps/web/.env`:
```env
VITE_SUPABASE_URL=https://api.yourdomain.com
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
VITE_SUPABASE_PROJECT_ID=<your-self-host-ref>
```

That's it. `src/integrations/supabase/client.ts` reads from `import.meta.env`
already, so no source changes are needed.

> **Note:** `src/integrations/supabase/types.ts` is auto-generated by Lovable
> today. After migrating, regenerate it yourself with:
> `supabase gen types typescript --project-id <ref> > apps/web/src/integrations/supabase/types.ts`

### 4.4 Edge function secrets to recreate
Set these in your self-hosted Edge Runtime environment:
- `LOVABLE_API_KEY` *(or replace with direct OpenAI/Gemini key — see §6)*
- `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_PUBLIC_KEY`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
  `SUPABASE_DB_URL`
- SMTP credentials (for `send-newsletter`, `send-order-receipt`)

### 4.5 Data migration from Lovable Cloud
1. From Lovable Cloud → Database → export each table to CSV, **or** run
   `pg_dump` against the Supabase connection string (visible in dashboard).
2. Restore into self-hosted Postgres:
   ```bash
   pg_restore -d postgres -h localhost -U postgres backup.dump
   ```
3. Migrate Auth users: use Supabase's `auth.users` export endpoint or
   `pg_dump --schema=auth`. JWT secret must match between source and target
   if you want existing sessions to remain valid (otherwise users re-login).
4. Storage buckets: use `rclone` or `aws s3 sync` between the source S3
   endpoint and your self-hosted MinIO/S3.
5. Validate row counts and a sample of orders/products before cutover.

---

## 5. Option B — Custom Node Backend (Detailed Plan)

If you want to drop Supabase entirely.

### 5.1 Backend folder (`apps/backend/`)

```
apps/backend/
├── src/
│   ├── server.ts              # Fastify or NestJS bootstrap
│   ├── routes/
│   │   ├── auth/              # /signup /login /refresh /reset
│   │   ├── products/          # CRUD + search
│   │   ├── orders/            # checkout, lookup, guest orders
│   │   ├── reviews/
│   │   ├── chat/              # SSE/WebSocket for realtime
│   │   ├── admin/             # role-gated
│   │   ├── payments/flutterwave
│   │   ├── newsletter/
│   │   ├── support/           # tickets
│   │   └── scrape/            # AI scraper
│   ├── middleware/
│   │   ├── auth.ts            # JWT verify
│   │   ├── rbac.ts            # has_role replacement
│   │   └── rateLimit.ts
│   ├── db/
│   │   ├── client.ts          # Drizzle or Prisma
│   │   ├── schema.ts          # Mirrors current 22 tables
│   │   └── migrations/        # Drizzle Kit / Prisma migrate
│   ├── services/
│   │   ├── storage.ts         # S3 / MinIO wrapper
│   │   ├── email.ts           # Nodemailer / Resend
│   │   ├── ai.ts              # OpenAI/Gemini client
│   │   └── flutterwave.ts
│   ├── workers/               # BullMQ for scraping, email, receipts
│   └── types/                 # Shared API types (re-exported to web)
├── test/
├── Dockerfile
├── package.json
└── tsconfig.json
```

### 5.2 Recommended stack
| Concern        | Choice                                                  |
|----------------|---------------------------------------------------------|
| HTTP framework | **Fastify** (fast, schema-first) or **NestJS** (DI/structure) |
| ORM            | **Drizzle ORM** (closest to current SQL migrations) or Prisma |
| Auth           | `jose` for JWT + bcrypt/argon2 for password hashing     |
| OAuth          | `arctic` or `@fastify/oauth2` for Google                |
| Storage        | **MinIO** (self-host) or AWS S3 / Cloudflare R2         |
| Realtime       | Native WebSocket (`ws`) or `socket.io` for chat         |
| Queue          | **BullMQ** + Redis for scraping/email jobs              |
| Email          | Resend, SES, or self-hosted Postal                      |
| Cache          | Redis                                                   |
| Validation     | `zod` (already used in frontend)                        |
| Logging        | `pino`                                                  |
| Observability  | OpenTelemetry → Grafana/Tempo/Loki                      |

### 5.3 Frontend changes (significant)
- Replace `@/integrations/supabase/client` with a typed `apiClient.ts`
  (Axios or fetch wrapper) hitting `VITE_API_BASE_URL`.
- Replace `supabase.auth.*` with `/auth/*` calls; store JWT in httpOnly
  cookie (preferred) or memory + refresh token rotation.
- Replace `supabase.from('x').select()` with React Query hooks calling REST
  endpoints — touches all ~35 files but is mechanical.
- Replace `supabase.storage.*` with signed-URL upload endpoints.
- Replace realtime chat with `EventSource`/WebSocket subscription.

### 5.4 Porting the RLS policies
Every `has_role(auth.uid(),'admin')` policy becomes a route-level guard:
```ts
fastify.get('/admin/products', { preHandler: [auth, requireRole('admin')] }, …)
```
Per-row ownership (`auth.uid() = user_id`) becomes WHERE clauses inside the
service layer. Document each policy → guard mapping in
`apps/backend/docs/RLS_TO_GUARDS.md`.

### 5.5 Porting the 9 edge functions
Each becomes a Fastify route or background worker. The Deno-specific
`Deno.env.get`, `Deno.serve`, and ESM-from-URL imports become Node `process.env`
and npm packages. Keep the same request/response shapes so the frontend
contract is unchanged.

---

## 6. AI Provider (Lovable AI Gateway)

`LOVABLE_API_KEY` only works while you stay on Lovable. After self-hosting:
- Replace `https://ai.gateway.lovable.dev/v1/chat/completions` calls with
  the upstream provider directly: OpenAI, Google Gemini, or Anthropic.
- Code lives in `supabase/functions/ai-support-chat/`,
  `scrape-product/`, `scrape-product-from-url/` — three files to update.
- Get an OpenAI or Google AI Studio API key, set `OPENAI_API_KEY` /
  `GEMINI_API_KEY` as a secret, swap base URL + auth header.

---

## 7. Hosting & Infrastructure Recommendations

### 7.1 Frontend (static SPA)
| Host              | Notes                                          |
|-------------------|------------------------------------------------|
| **Cloudflare Pages** | Free tier, global CDN, easy custom domains  |
| Vercel            | Best DX, generous free tier                    |
| Netlify           | Similar to Vercel                              |
| Self-host         | Nginx/Caddy serving `dist/` + SPA fallback     |

Required: SPA fallback (`/* → /index.html`), HTTPS, Brotli, long-cache for
`assets/*`, no-cache for `index.html`.

### 7.2 Backend
| Option | Best for                                                   |
|--------|------------------------------------------------------------|
| **VPS (Hetzner/DO/Linode)** + Docker Compose | Smallest cost, full control |
| Fly.io / Railway / Render | Managed containers, auto-TLS                |
| AWS ECS Fargate / GCP Cloud Run | Scales to zero, more ops             |
| Kubernetes (k3s on 2-3 nodes) | If you anticipate horizontal scale       |

For Option A (self-hosted Supabase) on a single VPS, recommend:
- Hetzner CPX31 (4 vCPU / 8 GB) ≈ €13/mo for low traffic
- Add daily `pg_dump` to S3-compatible offsite backup (Backblaze B2)
- Caddy reverse proxy in front of Kong for automatic TLS

### 7.3 Domains & DNS
- `pawamore.com` → frontend
- `api.pawamore.com` → Supabase Kong (Option A) or Node API (Option B)
- `studio.pawamore.com` → Supabase Studio (basic-auth protect it!)

---

## 8. CI/CD

`.github/workflows/`:

```yaml
ci.yml          # lint, typecheck, vitest, playwright on every PR
web-deploy.yml  # build apps/web → push to Cloudflare Pages on main
backend-deploy.yml
                # Option A: rsync migrations + functions → server, run supabase db push
                # Option B: docker build & push image, ssh deploy or k8s rollout
db-backup.yml   # nightly pg_dump → B2/S3
```

You already have `.github/workflows/ci_migrate_deploy.yml` and
`ci_apply_migrations_and_deploy.sh` — those are a great starting point.

---

## 9. Security Checklist (must verify after migration)

- [ ] `SUPABASE_SERVICE_ROLE_KEY` never exposed to the browser
- [ ] CORS on edge functions/API restricted to your domains
- [ ] All admin checks use server-side `has_role` (Option A) or `requireRole` (Option B) — never localStorage
- [ ] Anonymous signups disabled, email verification required, HIBP enabled
- [ ] Rate limiting on `/auth/*`, `/scrape/*`, `/contact`, `/newsletter`
- [ ] `orders` excluded from realtime publication (preserve current behavior)
- [ ] Storage bucket policies enforce per-user folder ownership
- [ ] `verify-payment` still validates `tx_ref` ↔ `order_id` ↔ `user_id`
- [ ] Triggers preserved: `validate_order_item_price`, `recalculate_order_total`, `guard_review_approval`, `set_deleted_at`, `handle_new_user`
- [ ] Backups encrypted at rest, restore tested at least once
- [ ] HTTPS everywhere, HSTS, secure cookies
- [ ] Secrets via Doppler / Infisical / Vault (not committed `.env`)

---

## 10. Step-by-Step Migration Roadmap

### Phase 0 — Preparation (1–2 days)
1. Fork/export the current Lovable repo to your own GitHub.
2. Restructure into the monorepo layout in §3 (move existing code to `apps/web/`).
3. Set up `pnpm-workspace.yaml` + `turbo.json`.
4. Take a full backup: `pg_dump` + storage `rclone sync` + auth users export.

### Phase 1 — Stand up backend in parallel (Option A: 2–3 days; Option B: 2–3 weeks)
5. Provision VPS, install Docker.
6. Bring up self-hosted Supabase (A) or Node backend skeleton (B).
7. Apply migrations / create schema.
8. Deploy edge functions / port to Node routes.
9. Configure secrets, OAuth, SMTP, storage buckets.
10. Smoke-test auth, products read, order create, admin login from a curl/Postman.

### Phase 2 — Data migration (1 day)
11. Run `pg_dump` from Lovable Cloud during a maintenance window.
12. Restore into self-host. Verify row counts.
13. Sync storage buckets.
14. Test on a staging frontend pointed at the new backend.

### Phase 3 — Frontend cutover (Option A: 1 hr; Option B: 1–2 weeks)
15. Update `.env` (Option A) or refactor to API client (Option B).
16. Regenerate types (Option A) or write OpenAPI client (Option B).
17. Run E2E tests (`playwright`) against staging.
18. DNS swap → frontend points at new backend.

### Phase 4 — Decommission (after 7 days of monitoring)
19. Disable Lovable Cloud project (or keep read-only as fallback).
20. Set up monitoring: Uptime Kuma, Grafana, log aggregation.
21. Document runbooks: backup/restore, incident response, scaling.

---

## 11. Effort & Cost Estimate

| Path                                    | Engineering effort | Monthly infra cost (low traffic) |
|-----------------------------------------|-------------------|----------------------------------|
| **Option A — Self-hosted Supabase**     | 1 engineer × 1 week | €15–30 (VPS + backups + domains) |
| **Option B — Custom Node backend**      | 1 engineer × 4–6 weeks | €15–50 (VPS + Redis + S3)     |

---

## 12. Recommendation

**Take Option A.** Reasons:
- You preserve every RLS policy, trigger, and edge function with no rewrite.
- Frontend changes are limited to environment variables.
- Same Supabase JS SDK → no behavioural drift, your tests stay valid.
- You can revisit Option B later, one domain at a time, by replacing edge
  functions with Node services behind the same Kong gateway.
- Self-hosted Supabase is battle-tested (used in production by thousands of
  teams) and easy to back up (it's just Postgres + S3).

Only choose Option B if you have a hard requirement to remove Supabase from
your stack (compliance, philosophical, or you want a single Node codebase).

---

## 13. Risks & Mitigations

| Risk                                            | Mitigation                                  |
|-------------------------------------------------|---------------------------------------------|
| Auth JWT secret mismatch → all users logged out | Pre-announce maintenance, force re-login    |
| Storage URL changes break product images        | Run a one-time UPDATE rewriting `image_url` prefixes |
| Edge function cold starts (self-hosted)         | Use Edge Runtime warmers or move hot ones to Node |
| Lovable AI Gateway key stops working            | Switch to OpenAI/Gemini key in §6 *before* cutover |
| No managed backups                              | Automated `pg_dump` to offsite S3, weekly restore drill |
| Realtime channel changes (Option B)             | Keep API contract identical; abstract behind a hook |
| Scraper functions hit memory limits on VPS      | Move to BullMQ worker with 2 GB Node heap   |

---

## 14. Files to Inventory Before Migration

Already-existing assets that will help:
- `supabase/migrations/*.sql` (29 files) — port as-is
- `supabase/functions/*` (9 functions) — port as-is or rewrite
- `supabase/config.toml` — replace with self-host config
- `supabase/README_RLS.md`, `supabase/INSTRUCTIONS_FOR_LOVABLE_AI.md`
- `itel-product-seed.sql` — seed data
- `ci_apply_migrations_and_deploy.sh` — adapt for self-host
- `cloudflare-worker/` — keep if you continue using OG proxy worker
- `e2e/admin-bulk-actions.spec.ts`, `playwright.config.ts` — re-point at staging URL
- `AI_PRODUCT_SCRAPER_*.md`, `LOVABLE_SCRAPER_DEPLOY_RUNBOOK.md`,
  `DEPLOYMENT_CHECKLIST.md` — repurpose

---

## 15. Open Questions for You

Before executing, decide:
1. Option A or Option B?
2. Cloud provider preference (Hetzner / DO / AWS / on-prem)?
3. Do you want to keep Google OAuth, or also add Apple/SAML?
4. Email provider: SES / Resend / Postal / SMTP relay?
5. Where do existing customer images live today, and is there budget for
   S3-compatible storage egress?
6. Acceptable downtime window for cutover (target: < 30 min)?
7. Who owns ongoing ops (you / a hire / a managed-DevOps contractor)?

Once you've decided, I can generate the actual monorepo skeleton, the
docker-compose for self-hosted Supabase, and the GitHub Actions workflows —
just say the word.

---

*End of plan.*
