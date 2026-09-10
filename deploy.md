# Deploy: proposalforge

**Profile:** standard pattern (web) — no deviations on the Feisty side. One
deviation upstream of Feisty: the app's own database is a dedicated
Supabase project, not a Gibson schema (see `connections/proposalforge-supabase.md`
for why — tight coupling to Supabase auth/RLS, not just Postgres).

**Build command:** CI-only — GitHub Actions (`.github/workflows/build.yml`)
builds the repo's `Dockerfile` (multi-stage, Next.js `output: "standalone"`)
on every push to `main` and pushes to
`ghcr.io/feistyferretlabs/proposalforge:latest`.

**Stable path:** https://proposal.feistyferret.com

**Requires** (Arcane project `.env` / `envContent`, not baked into the image):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`

**Deployed as:** Arcane project `proposalforge`, container on
`public-proxy`, port 3000, fronted by NPM at `proposal.feistyferret.com`
(Let's Encrypt cert via NPM's `certificate_id: "new"`).

**Database:** Supabase project `nvywxazwnrjpuofzykgs` — see
`connections/proposalforge-supabase.md`. Schema applied via
`supabase db query --linked -f supabase/migration.sql` (Management API,
no direct DB password needed).
