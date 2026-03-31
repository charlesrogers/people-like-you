# People Like You (PLY)

## Stack
- Next.js 15, React 19, TypeScript, Tailwind v4
- Self-hosted Supabase (Postgres + Auth + Storage) on Hetzner
- OpenAI for voice transcription + profile extraction + intro generation
- Resend for transactional email
- Sentry for error tracking
- **Deployed on Coolify (Hetzner VPS)** at people-like-you.com

## Deployment
- `git push` to GitHub auto-deploys via GHCR + Coolify. Do NOT use Vercel.
- Staging: push to `staging` branch → deploys to staging-ply.imprevista.com
- Coolify app UUID: check `.github/workflows/deploy.yml`
- Migrations auto-run on deploy (GH Actions reads `migrations/*.sql`, checks `_migrations` table)
- Run migrations manually: `ssh root@95.216.205.160 "docker exec -i supabase-db psql -U postgres -d postgres" < migrations/XXX.sql`

## Database
- Self-hosted Supabase at db.imprevista.com (NOT Supabase Cloud, NOT Neon)
- Direct Postgres: `postgresql://postgres:<password>@supabase-db:5432/postgres`
- Public keys in `.env.production` (committed, baked into Docker build)
- Secret keys set as Coolify runtime env vars only

## Key Systems
- **Onboarding**: Voice memos → Whisper transcription → GPT extraction → composite profile
- **Matchmaker** (`src/lib/matchmaker.ts`): Embedding similarity + life stage + location tiers + Elo
- **Intro Engine v2** (`src/lib/intro-engine-v2.ts`): Generates "trailer" narratives for matches
- **Location matching** (`src/lib/geo.ts`): Uses `zip_locations` table (33K US zips with metro codes)
- **Cron delivery** (`/api/cron/deliver-matches`): Daily match delivery with narrative generation

## Cron Jobs (on Hetzner server, /etc/cron.d/coolify-apps)
- Deliver matches: hourly
- Expire intros: hourly
- Process voice memos: every 10 min
- Profile recompute: every 6h
- Embedding sync: every 6h

## Email
- Resend (hello@people-like-you.com, domain verified)
- Templates in `src/lib/email.ts`: welcome, match notification, date reminder
