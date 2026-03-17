export const cn = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

export const cleanArray = <T>(items: T[]) => items.filter(Boolean);

const SAFE_WEB_PROTOCOLS = new Set(["http:", "https:", "#"]);
const SAFE_HREF_PROTOCOLS = new Set([
  "http:",
  "https:",
  "mailto:",
  "tel:",
  "#",
]);
const RELATIVE_PATH_PATTERN = /^\/(?!\/)/;

const normalizeUrlValue = (value?: string | null) => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

const tryParseUrl = (value?: string | null) => {
  const normalized = normalizeUrlValue(value);

  if (!normalized) {
    return null;
  }

  try {
    return new URL(normalized);
  } catch {
    return null;
  }
};

export const isAbsoluteUrl = (value?: string | null) => {
  const parsed = tryParseUrl(value);
  return Boolean(parsed && SAFE_WEB_PROTOCOLS.has(parsed.protocol));
};

export const isSafeNavigationHref = (value?: string | null) => {
  const normalized = normalizeUrlValue(value);

  if (!normalized) {
    return false;
  }

  if (RELATIVE_PATH_PATTERN.test(normalized)) {
    return true;
  }

  const parsed = tryParseUrl(normalized);
  return Boolean(parsed && SAFE_WEB_PROTOCOLS.has(parsed.protocol));
};

export const isSafeHref = (value?: string | null) => {
  const normalized = normalizeUrlValue(value);

  if (!normalized) {
    return false;
  }

  if (RELATIVE_PATH_PATTERN.test(normalized)) {
    return true;
  }

  const parsed = tryParseUrl(normalized);
  return Boolean(parsed && SAFE_HREF_PROTOCOLS.has(parsed.protocol));
};

export const isSafeMediaUrl = (value?: string | null) => {
  const normalized = normalizeUrlValue(value);

  if (!normalized) {
    return false;
  }

  return RELATIVE_PATH_PATTERN.test(normalized) || isAbsoluteUrl(normalized);
};

export const hasUsableHref = (value?: string | null) => isSafeHref(value);

export const hasRenderableBrochure = (value?: string | null): value is string =>
  isAbsoluteUrl(value);

export const toSafeNavigationHref = (value?: string | null): string | null => {
  const normalized = normalizeUrlValue(value);
  return isSafeNavigationHref(normalized) ? (normalized ?? null) : null;
};

export const toSafeMediaUrl = (
  value: string | null | undefined,
  fallback: string,
): string => {
  const normalized = normalizeUrlValue(value);
  return isSafeMediaUrl(normalized) ? (normalized ?? fallback) : fallback;
};
