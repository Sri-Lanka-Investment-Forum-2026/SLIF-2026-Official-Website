import assert from "node:assert/strict";
import test from "node:test";

import {
  getUploadFileExtension,
  normalizeUploadFolder,
  validateUploadFile,
} from "@/lib/upload-policy";

test("normalizeUploadFolder only accepts known safe folder names", () => {
  assert.equal(normalizeUploadFolder("projects"), "projects");
  assert.equal(normalizeUploadFolder("/speakers/"), "speakers");
  assert.equal(normalizeUploadFolder("../etc"), null);
  assert.equal(normalizeUploadFolder("unknown"), null);
});

test("getUploadFileExtension returns normalized lowercase extensions", () => {
  assert.equal(getUploadFileExtension("brochure.PDF"), "pdf");
  assert.equal(getUploadFileExtension("no-extension"), "");
});

test("validateUploadFile enforces folder, mime, extension, and size rules", () => {
  assert.deepEqual(
    validateUploadFile("reports", "report.pdf", "application/pdf", 1024).ok,
    true,
  );
  assert.deepEqual(
    validateUploadFile("reports", "report.svg", "image/svg+xml", 1024).ok,
    false,
  );
  assert.deepEqual(
    validateUploadFile("speakers", "speaker.webp", "image/webp", 30 * 1024 * 1024).ok,
    false,
  );
});
