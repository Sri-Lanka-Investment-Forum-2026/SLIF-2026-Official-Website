import assert from "node:assert/strict";
import test from "node:test";

import { projectInputSchema, sectorInputSchema, speakerInputSchema } from "@/lib/validation";
import {
  hasRenderableBrochure,
  hasUsableHref,
  isAbsoluteUrl,
  isSafeMediaUrl,
  toSafeNavigationHref,
} from "@/lib/utils";

test("safe URL helpers reject unsafe schemes and preserve supported links", () => {
  assert.equal(hasUsableHref("https://example.com/file.pdf"), true);
  assert.equal(hasUsableHref("/contact"), true);
  assert.equal(hasUsableHref("#"), true);
  assert.equal(hasUsableHref("#details"), true);
  assert.equal(hasUsableHref("mailto:info@example.com"), true);
  assert.equal(hasUsableHref("javascript:alert(1)"), false);
  assert.equal(isAbsoluteUrl("https://example.com"), true);
  assert.equal(isAbsoluteUrl("javascript:alert(1)"), false);
  assert.equal(isSafeMediaUrl("/assets/example.webp"), true);
  assert.equal(isSafeMediaUrl("data:text/html,boom"), false);
  assert.equal(hasRenderableBrochure("https://media.example.com/example.pdf"), true);
  assert.equal(hasRenderableBrochure("/downloads/example.pdf"), false);
  assert.equal(toSafeNavigationHref("#"), "#");
  assert.equal(toSafeNavigationHref("javascript:alert(1)"), null);
});

test("sector schema rejects unsafe consultation and report links", () => {
  const result = sectorInputSchema.safeParse({
    slug: "green-energy",
    name: "Green Energy",
    consultationLink: "javascript:alert(1)",
    reportLink: "https://media.example.com/report.pdf",
  });

  assert.equal(result.success, false);
});

test("project schema rejects unsafe brochure and media URLs", () => {
  const brochureResult = projectInputSchema.safeParse({
    legacyId: "PRJ-001",
    slug: "green-energy-park",
    sectorId: "sector-1",
    title: "Green Energy Park",
    brochureUrl: "javascript:alert(1)",
  });
  const mediaResult = projectInputSchema.safeParse({
    legacyId: "PRJ-001",
    slug: "green-energy-park",
    sectorId: "sector-1",
    title: "Green Energy Park",
    media: [{ url: "data:image/svg+xml,<svg></svg>", altText: "" }],
  });

  assert.equal(brochureResult.success, false);
  assert.equal(mediaResult.success, false);
});

test("project schema allows hash more-info links used by seeded content", () => {
  assert.equal(
    projectInputSchema.safeParse({
      legacyId: "PRJ-001",
      slug: "green-energy-park",
      sectorId: "sector-1",
      title: "Green Energy Park",
      moreInfoUrl: "#",
    }).success,
    true,
  );
});

test("speaker schema allows safe image URLs and rejects unsafe ones", () => {
  assert.equal(
    speakerInputSchema.safeParse({
      name: "Jane Doe",
      imageUrl: "https://media.example.com/speaker.webp",
    }).success,
    true,
  );
  assert.equal(
    speakerInputSchema.safeParse({
      name: "Jane Doe",
      imageUrl: "javascript:alert(1)",
    }).success,
    false,
  );
});
