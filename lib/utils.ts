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

export const isAbsoluteUrl = (value?: string | null) =>
  Boolean(value && /^(https?:)?\/\//i.test(value));
