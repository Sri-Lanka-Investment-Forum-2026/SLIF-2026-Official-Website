# Security Audit Report

Date: 2026-03-16
Project: SLIF Next.js application

## Scope

- Server-side auth and session handling
- Admin write paths and upload flow
- Public brochure/PDF endpoints
- PocketBase data-access layer and schema rules
- Frontend link/media rendering paths
- Dependency scan (`npm audit --omit=dev`)

## Summary

The project has a relatively small attack surface and the production dependency set currently reports no known npm advisories, but there are several meaningful application-level issues.

The two most important problems are:

1. PocketBase queries are built with unescaped string interpolation in multiple public lookup paths.
2. The public brochure endpoints allow unbounded remote PDF fetching and rendering, which creates an easy denial-of-service path.

There are also weaker but still relevant issues around upload validation, unsafe URL schemes in CMS-managed links, and missing browser hardening headers.

## Findings

### 1. Medium: PocketBase filter injection in public lookup paths

Affected code:

- `lib/data/pocketbase-repository.ts:369-399`
- `lib/data/pocketbase-repository.ts:602-625`
- `app/project.html/route.ts:5-16`
- `app/sectors/sector.html/route.ts:7-19`

Details:

- Public route params and query params are inserted directly into PocketBase filter strings with template literals such as:
  - ``published = true && slug = "${slug}"``
  - ``published = true && (slug = "${value}" || legacyId = "${value}")"``
  - ``slug = "${slug}"``
  - ``legacyId = "${legacyId}"``
- The repository already contains a safe escaping helper (`quoteFilterValue`) but it is not used for these lookups.

Impact:

- An attacker can supply quotes and PocketBase operators to alter filter logic.
- This can break exact-match guarantees, return the wrong published record, and poison redirect/canonical behavior on `/projects/[slug]`, `/project.html?id=...`, `/sectors/[slug]`, and `/sectors/sector.html?sector=...`.
- The published-record rules limit worst-case exposure, but the current behavior still makes user-controlled query syntax part of the database lookup.

Recommended fix:

- Replace raw string interpolation with a shared escaping helper for every dynamic filter value.
- Prefer strict validation for slug/legacy-id formats before querying.
- Audit scripts using the same pattern (`scripts/pocketbase-bootstrap-admin.ts`, `scripts/seed.ts`) even though they are not public request paths.

### 2. High: Public brochure endpoints allow unbounded PDF fetch and rendering

Affected code:

- `lib/brochure.ts:14-38`
- `app/api/brochure/route.ts:5-42`
- `app/api/brochure/meta/route.ts:19-63`
- `app/api/brochure/render/route.ts:19-79`

Details:

- Any unauthenticated caller can request brochure processing for any URL under `MEDIA_PUBLIC_BASE_URL`.
- `fetchBrochureBuffer()` downloads the entire upstream file into memory with `arrayBuffer()`.
- The `meta` and `render` routes then write the full file to disk and invoke `pdfinfo` / `pdftoppm`.
- There are no limits on:
  - response size
  - content type
  - fetch timeout
  - page count beyond UI capping
  - render width upper bound beyond “positive integer”
  - request rate or concurrency

Impact:

- Repeated requests against large or malformed PDFs can consume memory, CPU, temporary disk, and worker time.
- Because these routes are public, they create an externally reachable denial-of-service path.

Recommended fix:

- Enforce a strict maximum `Content-Length` before download and reject missing/oversized responses.
- Require `application/pdf` (or a very small allowlist) before processing.
- Add fetch and subprocess timeouts.
- Cap render width and reject unexpected page numbers early.
- Consider pre-generating thumbnails/metadata at upload time instead of rendering on demand.
- Add rate limiting at the edge or reverse proxy.

### 3. Medium: Admin upload endpoint accepts arbitrary file types and buffers whole files in memory

Affected code:

- `app/api/admin/uploads/route.ts:15-45`

Details:

- The route accepts any uploaded file, trusts the client-supplied MIME type, preserves the original extension, and loads the entire file into memory with `file.arrayBuffer()`.
- There is no server-side size limit, MIME allowlist, extension allowlist, or content sniffing.

Impact:

- Any authenticated admin session can upload very large files and force excessive memory use.
- The media bucket can also be populated with arbitrary active content types (for example HTML or SVG) under a public URL, which increases phishing and content-trust risk if the media domain is broadly trusted.

Recommended fix:

- Enforce a maximum file size on the server.
- Restrict allowed MIME types/extensions by target folder.
- Normalize or reject dangerous content types such as HTML unless there is a specific business need.
- Consider streaming uploads instead of buffering whole files in memory.

### 4. Medium: CMS-managed public links allow unsafe schemes such as `javascript:`

Affected code:

- `lib/utils.ts:15-22`
- `lib/validation.ts:11-79`
- `app/(public)/sectors/[slug]/page.tsx:53-56`
- `app/(public)/sectors/[slug]/page.tsx:180-203`
- `app/(public)/projects/[slug]/page.tsx:135-143`

Details:

- `hasUsableHref()` only checks for non-empty values and `"#"`.
- URL-bearing fields in the admin schemas are plain strings with no protocol validation.
- Those values are rendered directly into public anchors for brochure downloads, consultation links, and report links.

Impact:

- If a malicious or compromised admin account stores `javascript:` or similar payloads, visitors can be served clickable stored XSS links from trusted pages.
- This is not an unauthenticated write issue, but it does turn CMS data into executable browser behavior.

Recommended fix:

- Validate URL-bearing fields with an allowlist of schemes such as `https:`, `http:`, `mailto:`, and `tel:` as appropriate.
- Reject `javascript:`, `data:`, and other non-navigation schemes for public content fields.
- Add the same validation server-side in `zod` schemas, not only in the UI.

### 5. Low: Missing baseline security headers and CSP

Affected code:

- `app/layout.tsx:21-37`
- `app/(public)/layout.tsx:19-26`
- `next.config.ts:1-60`

Details:

- The app loads multiple scripts and remote font resources but does not define a Content Security Policy.
- There is also no centralized configuration for headers such as:
  - `Content-Security-Policy`
  - `X-Frame-Options` / `frame-ancestors`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - `Strict-Transport-Security`

Impact:

- This does not create XSS on its own, but it removes important browser-side containment if any injection is introduced later.

Recommended fix:

- Add response headers in `next.config.ts` or middleware.
- Start with a restrictive CSP that matches the current script/style/font/image sources and tighten it incrementally.

## Additional Observations

- `lib/data/pocketbase-repository.ts:23-33` falls back to a PocketBase superuser client for writes whenever there is no valid session. Current call sites do authenticate before writes, so this is not an active exploit by itself, but it increases the blast radius of any future authorization mistake.
- `.env` is not tracked in git, and `.gitignore` correctly excludes environment files.

## Dependency Review

Command run:

```bash
npm audit --omit=dev
```

Result:

- `found 0 vulnerabilities`

This only covers advisories known to the npm registry for installed production dependencies. It does not replace application-level review.

## Recommended Remediation Order

1. Fix PocketBase filter construction by escaping every dynamic value and validating slug/id inputs.
2. Lock down brochure processing with size/type/time/rate limits.
3. Add server-side upload restrictions and file-size limits.
4. Add strict URL validation for all CMS-managed public links.
5. Introduce CSP and baseline security headers.

## Audit Limitations

- This was a source review plus dependency advisory scan.
- I did not perform live penetration testing against a deployed environment, infrastructure review, TLS review, or PocketBase/MinIO host configuration review.
