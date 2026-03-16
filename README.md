# SLIF Next.js Migration

## Stack
- Next.js App Router with SSR
- PocketBase-backed content and admin auth
- MinIO/S3-compatible media uploads using `https://media.srilankainvestmentforum.com`

## Setup
1. Copy `.env.example` to `.env` and fill in real secrets and MinIO credentials.
2. Install dependencies: `npm install`
3. Set `POCKETBASE_URL`, `POCKETBASE_SUPERUSER_EMAIL`, and `POCKETBASE_SUPERUSER_PASSWORD`
4. Apply the PocketBase schema: `npm run pb:schema`
5. Create/update the first PocketBase admin: `npm run pb:bootstrap-admin`
6. Seed a fresh PocketBase instance from the JSON content: `npm run pb:seed`
7. Start the app: `npm run dev`

## Docker
- The website can run in its own container; PocketBase and MinIO remain external services configured through environment variables.
- The provided `Dockerfile` builds a standalone Next.js production image and includes the Poppler utilities required by the brochure preview routes.
- Build the image with `docker build -t slif-next .`
- Run it with your production env vars, for example:
  `docker run --env-file .env -p 3000:3000 slif-next`
- The container serves only the website on port `3000`.

## Admin
- `/admin/login`
- Initial admin user is created from `ADMIN_EMAIL` and `ADMIN_PASSWORD` when `npm run pb:bootstrap-admin` or `npm run pb:seed` runs.

## Operations
- Media integrity check: `npm run media:check`
- PocketBase schema apply: `npm run pb:schema`
- PocketBase bootstrap admin: `npm run pb:bootstrap-admin`
- PocketBase JSON seed: `npm run pb:seed`
