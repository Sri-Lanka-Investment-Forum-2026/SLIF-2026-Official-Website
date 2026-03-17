# Sri Lanka Investment Forum 2026

Next.js 15 application for the Sri Lanka Investment Forum 2026 website and internal content admin.

It serves:

- Public SLIF pages such as home, venue, contact, offers, privacy, and terms
- A gated admin area for managing sectors, projects, speakers, and media-backed content
- PocketBase-backed content storage and admin authentication
- S3-compatible media uploads via MinIO
- Brochure proxy and render endpoints for PDF previews

## Stack

- Next.js 15 App Router
- React 19
- TypeScript
- PocketBase
- MinIO / S3-compatible object storage
- Sharp for image optimization
- Zod + React Hook Form for validation and admin forms
- Bootstrap-based frontend assets with some legacy vendor scripts retained under `public/assets`

## Core Features

- Public marketing/event site with SSR pages
- Investment sector listing and sector detail pages
- Project detail pages with legacy ID redirect support
- Admin login backed by PocketBase `admins`
- CRUD flows for sectors, projects, and speaker sessions/cards
- Server-side upload API with folder policy validation
- Automatic image optimization to WebP on upload
- Media asset registration in PocketBase
- Secure brochure proxying with size/type/origin checks
- Legacy `.html` route redirects for older URLs

## Application Areas

### Public routes

- `/`
- `/offers`
- `/venue`
- `/contact`
- `/privacy`
- `/terms`
- `/sectors`
- `/sectors/[slug]`
- `/projects/[slug]`

`/sectors` and sector detail pages are controlled by `SECTORS_PAGE_PUBLISHED`. When disabled, the site falls back away from sector routes and `/projects` redirects to `/`.

### Admin routes

- `/admin/login`
- `/admin`
- `/admin/sectors`
- `/admin/projects`
- `/admin/speakers`

All `/admin/*` routes are protected by middleware and server-side session checks. Auth state is stored in the PocketBase cookie `pb_auth`.

## How Content Is Stored

PocketBase is the system of record. The schema in `pocketbase/schema.ts` defines:

- `admins`
- `media_assets`
- `sectors`
- `sector_overview_paragraphs`
- `sector_stats`
- `sector_why_invest`
- `sector_advantages`
- `projects`
- `project_media`
- `project_stats`
- `project_highlights`
- `project_financial_items`
- `speaker_section_settings`
- `speaker_sessions`
- `speakers`

Seed content lives in:

- `data/sectors.json`
- `data/projects.json`
- `data/speakers.json`

The seed script applies the schema, clears content collections, ensures the initial admin exists, then imports those JSON files into PocketBase.

## Media And Brochures

- Admin uploads go through `POST /api/admin/uploads`
- Upload destinations are restricted to known folders such as `projects`, `sectors`, `reports`, `speakers`, and `uploads`
- Images are resized and converted to WebP before upload
- Uploaded media is written to MinIO and registered in `media_assets`
- Public media URLs are generated from `MEDIA_PUBLIC_BASE_URL`
- Brochure endpoints only accept PDFs hosted on the configured media origin
- Brochure metadata/render routes depend on Poppler utilities: `pdfinfo` and `pdftoppm`

## Environment Variables

Copy `.env.example` to `.env` and fill in the values for your environment.

| Variable                        | Required                        | Purpose                                                                  |
| ------------------------------- | ------------------------------- | ------------------------------------------------------------------------ |
| `POCKETBASE_URL`                | Yes                             | Base URL for PocketBase. Defaults to `http://127.0.0.1:8090` when unset. |
| `POCKETBASE_SUPERUSER_EMAIL`    | For schema/seed/admin bootstrap | PocketBase superuser used by setup scripts and privileged writes.        |
| `POCKETBASE_SUPERUSER_PASSWORD` | For schema/seed/admin bootstrap | Password for the PocketBase superuser.                                   |
| `SECTORS_PAGE_PUBLISHED`        | No                              | Enables public sector pages and related navigation. Defaults to `false`. |
| `MEDIA_PUBLIC_BASE_URL`         | Yes                             | Public base URL used to generate/validate media and brochure links.      |
| `MINIO_ENDPOINT`                | For uploads                     | S3 API endpoint for MinIO or compatible object storage.                  |
| `MINIO_REGION`                  | No                              | Storage region. Defaults to `us-east-1`.                                 |
| `MINIO_BUCKET`                  | For uploads                     | Bucket used for uploaded assets.                                         |
| `MINIO_ACCESS_KEY`              | For uploads                     | Storage access key.                                                      |
| `MINIO_SECRET_KEY`              | For uploads                     | Storage secret key.                                                      |
| `ADMIN_EMAIL`                   | Recommended                     | Email for the initial SLIF admin user.                                   |
| `ADMIN_PASSWORD`                | Recommended                     | Password for the initial SLIF admin user.                                |
| `ADMIN_NAME`                    | No                              | Display name for the initial admin. Defaults to `SLIF Admin`.            |

## Local Development

### Prerequisites

- Node.js 22+
- npm
- A running PocketBase instance
- MinIO or another S3-compatible object store if you want uploads enabled
- Poppler utilities if you want brochure meta/render endpoints locally

### Install

```bash
npm install
cp .env.example .env
```

### Configure services

1. Point `POCKETBASE_URL` to your PocketBase instance.
2. Add a PocketBase superuser email/password.
3. Set `MEDIA_PUBLIC_BASE_URL`.
4. If uploads are needed, configure the MinIO variables.
5. If you want an initial CMS login, set `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

### Initialize PocketBase

```bash
npm run pb:schema
npm run pb:bootstrap-admin
```

If you want to load the bundled JSON content as well:

```bash
npm run pb:seed
```

Or do the full setup in one step:

```bash
npm run pb:setup:seed
```

### Start the app

```bash
npm run dev
```

Open:

- Public site: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`

## Scripts

| Command                      | Purpose                                               |
| ---------------------------- | ----------------------------------------------------- |
| `npm run dev`                | Start the Next.js dev server                          |
| `npm run build`              | Build production output                               |
| `npm run start`              | Run the production server                             |
| `npm run check`              | Generate route types and run TypeScript type checking |
| `npm test`                   | Run Node test suite                                   |
| `npm run pb:schema`          | Apply PocketBase schema                               |
| `npm run pb:bootstrap-admin` | Create or update the configured initial admin         |
| `npm run pb:setup`           | Apply schema and bootstrap admin                      |
| `npm run pb:seed`            | Reset/import bundled JSON content into PocketBase     |
| `npm run pb:setup:seed`      | Apply schema, bootstrap admin, then seed content      |
| `npm run media:check`        | HEAD-check registered media asset URLs                |

## Testing

Current lightweight coverage lives in `tests/` and focuses on:

- PocketBase filter escaping
- Upload folder/type/size policy
- URL safety and validation rules

Run:

```bash
npm test
npm run check
```

## Deployment

The app is configured with `output: "standalone"` and includes a production `Dockerfile`.

The container:

- Builds the standalone Next.js server
- Serves the app on port `3000`
- Installs `poppler-utils` for brochure preview endpoints
- Expects PocketBase and MinIO to be external services

Build and run:

```bash
docker build -t slif-next .
docker run --env-file .env -p 3000:3000 slif-next
```

## Project Structure

```text
app/                 App Router pages, route handlers, and server actions
components/          Admin and public React components
data/                Seed JSON for sectors, projects, and speakers
lib/                 Auth, PocketBase, media, validation, and utility modules
pocketbase/          PocketBase schema definition
public/              Static assets and retained vendor frontend files
scripts/             Schema/app bootstrap, seed, and media maintenance scripts
tests/               Node test suite
```

## Operational Notes

- The admin area uses PocketBase auth records from the custom `admins` collection, not NextAuth.
- Public reads prefer a request-scoped PocketBase server client and fall back to an unauthenticated client when needed.
- Privileged writes fall back to a PocketBase superuser client when an authenticated admin session is not available.
- Media validation distinguishes between external URLs and URLs rooted at `MEDIA_PUBLIC_BASE_URL`.
- Legacy routes like `/project.html?id=...` and `/sectors/sector.html?sector=...` are redirected into modern routes.
