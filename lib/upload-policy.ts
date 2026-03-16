const FILE_EXTENSION_PATTERN = /\.([a-z0-9]+)$/i;
const UPLOAD_FOLDER_PATTERN = /^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/;
const DEFAULT_MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

type UploadPolicy = {
  allowedExtensions: Set<string>;
  allowedMimeTypes: Set<string>;
  maxBytes: number;
};

const createPolicy = (config: {
  extensions: string[];
  mimeTypes: string[];
  maxBytes?: number;
}): UploadPolicy => ({
  allowedExtensions: new Set(config.extensions),
  allowedMimeTypes: new Set(config.mimeTypes),
  maxBytes: config.maxBytes ?? DEFAULT_MAX_UPLOAD_BYTES,
});

const uploadPolicies: Record<string, UploadPolicy> = {
  uploads: createPolicy({
    extensions: ["jpg", "jpeg", "png", "webp", "gif", "pdf", "mp4", "webm", "mov", "m4v"],
    mimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-m4v",
    ],
  }),
  projects: createPolicy({
    extensions: ["jpg", "jpeg", "png", "webp", "gif", "pdf", "mp4", "webm", "mov", "m4v"],
    mimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-m4v",
    ],
  }),
  sectors: createPolicy({
    extensions: ["jpg", "jpeg", "png", "webp", "gif"],
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  }),
  reports: createPolicy({
    extensions: ["pdf"],
    mimeTypes: ["application/pdf"],
  }),
  speakers: createPolicy({
    extensions: ["jpg", "jpeg", "png", "webp", "gif"],
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  }),
};

export const normalizeUploadFolder = (value: string) => {
  const normalized = value.trim().replace(/^\/+|\/+$/g, "");

  if (!normalized || !UPLOAD_FOLDER_PATTERN.test(normalized)) {
    return null;
  }

  return normalized in uploadPolicies ? normalized : null;
};

export const getUploadFileExtension = (fileName: string) => {
  const match = fileName.trim().toLowerCase().match(FILE_EXTENSION_PATTERN);
  return match?.[1] ?? "";
};

export const getUploadPolicy = (folder: string) => uploadPolicies[folder] ?? null;

export const validateUploadFile = (folder: string, fileName: string, mimeType: string, size: number) => {
  const policy = getUploadPolicy(folder);

  if (!policy) {
    return { ok: false as const, error: "Unsupported upload destination." };
  }

  if (!Number.isFinite(size) || size <= 0) {
    return { ok: false as const, error: "Uploaded file is empty." };
  }

  if (size > policy.maxBytes) {
    return { ok: false as const, error: "Uploaded file exceeds the 25 MB limit." };
  }

  const extension = getUploadFileExtension(fileName);
  const normalizedMimeType = mimeType.trim().toLowerCase();

  if (!extension || !policy.allowedExtensions.has(extension)) {
    return { ok: false as const, error: "This file type is not allowed for that upload field." };
  }

  if (!normalizedMimeType || !policy.allowedMimeTypes.has(normalizedMimeType)) {
    return { ok: false as const, error: "This MIME type is not allowed for that upload field." };
  }

  return { ok: true as const, policy };
};
