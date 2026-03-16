const POCKETBASE_FILTER_ESCAPE_PATTERN = /["\\]/g;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001F\u007F]/;
const SLUG_LOOKUP_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const quotePocketBaseFilterValue = (value: string) =>
  `"${value.replace(POCKETBASE_FILTER_ESCAPE_PATTERN, "\\$&")}"`;

export const buildPocketBaseEqFilter = (field: string, value: string) =>
  `${field} = ${quotePocketBaseFilterValue(value)}`;

export const buildPocketBaseOrFilter = (field: string, values: string[]) =>
  values.map((value) => buildPocketBaseEqFilter(field, value)).join(" || ");

export const normalizeSlugLookup = (value: string) => {
  const normalized = value.trim().toLowerCase();
  return SLUG_LOOKUP_PATTERN.test(normalized) ? normalized : null;
};

export const normalizeLegacyIdLookup = (value: string) => {
  const normalized = value.trim();

  if (!normalized || normalized.length > 255 || CONTROL_CHARACTER_PATTERN.test(normalized)) {
    return null;
  }

  return normalized;
};
