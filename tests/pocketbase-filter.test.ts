import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPocketBaseEqFilter,
  normalizeLegacyIdLookup,
  normalizeSlugLookup,
  quotePocketBaseFilterValue,
} from "@/lib/pocketbase-filter";

test("quotePocketBaseFilterValue escapes quotes and backslashes", () => {
  assert.equal(
    quotePocketBaseFilterValue('sector"one\\two'),
    '"sector\\"one\\\\two"',
  );
});

test("buildPocketBaseEqFilter wraps escaped values safely", () => {
  assert.equal(
    buildPocketBaseEqFilter("slug", 'energy" || published = false || slug = "x'),
    'slug = "energy\\" || published = false || slug = \\"x"',
  );
});

test("normalizeSlugLookup lowercases valid slugs and rejects invalid values", () => {
  assert.equal(normalizeSlugLookup(" Green-Energy "), "green-energy");
  assert.equal(normalizeSlugLookup('green" || id != ""'), null);
  assert.equal(normalizeSlugLookup(""), null);
});

test("normalizeLegacyIdLookup trims valid ids and rejects control characters", () => {
  assert.equal(normalizeLegacyIdLookup(" PRJ-001 "), "PRJ-001");
  assert.equal(normalizeLegacyIdLookup("foo\nbar"), null);
  assert.equal(normalizeLegacyIdLookup(""), null);
});
