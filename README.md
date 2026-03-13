# SLIF Next.js Migration

## Stack
- Next.js App Router with SSR
- Prisma ORM on SQLite
- NextAuth credentials login for `/admin`
- MinIO/S3-compatible media uploads using `https://media.srilankainvestmentforum.com`

## Setup
1. Copy `.env.example` to `.env` and fill in real secrets and MinIO credentials.
2. Set `DATABASE_URL` to an absolute SQLite file URL, for example `file:/mnt/storage/Work/BOI/SLIF/prisma/dev.db`.
3. Install dependencies: `npm install`
4. Generate the Prisma client: `npm run prisma:generate`
5. Create/update the SQLite schema: `npm run db:push`
6. Import the current JSON content: `npm run db:seed`
7. Start the app: `npm run dev`

## Admin
- `/admin/login`
- Initial admin user is created from `ADMIN_EMAIL` and `ADMIN_PASSWORD` when `npm run db:seed` runs.

## Operations
- SQLite backup: `npm run backup:sqlite`
- Media integrity check: `npm run media:check`
