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

**Deployed as:** Arcane project `proposalforge` (id `1c1a10cb-bf64-4ef3-8c36-842428484137`),
container `proposalforge-proposalforge-1` on `public-proxy`, port 3000,
fronted by NPM (proxy host id 33) at `proposal.feistyferret.com` with a
live Let's Encrypt cert. Confirmed live 2026-09-10 (HTTP 200).

**Known gap:** deployed without `ANTHROPIC_API_KEY` (Maestro's call, to
not block the deploy) — "Generate with AI" will fail until a key is set
in the Arcane project's env and the project is redeployed
(`POST /api/environments/0/projects/1c1a10cb-bf64-4ef3-8c36-842428484137/up`
after updating `envContent`).

**Database:** Supabase project `nvywxazwnrjpuofzykgs` — see
`connections/proposalforge-supabase.md`. Schema applied via
`supabase db query --linked -f supabase/migration.sql` (Management API,
no direct DB password needed).
