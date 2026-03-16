import { z } from "zod";

import { isAbsoluteUrl, isSafeMediaUrl, isSafeNavigationHref } from "@/lib/utils";

const requiredString = z.string().trim().min(1);
const optionalString = z.string().trim().optional().or(z.literal(""));
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const optionalSchemaWithValidation = (predicate: (value: string) => boolean, message: string) =>
  optionalString.refine((value) => !value || predicate(value), { message });

const optionalMediaUrl = optionalSchemaWithValidation(
  isSafeMediaUrl,
  "Enter a valid media URL starting with https://, http://, or /.",
);
const optionalNavigationUrl = optionalSchemaWithValidation(
  isSafeNavigationHref,
  "Enter a valid URL starting with https://, http://, or /.",
);
const optionalAbsoluteUrl = optionalSchemaWithValidation(
  isAbsoluteUrl,
  "Enter a valid absolute URL starting with https:// or http://.",
);

export const statItemSchema = z.object({
  label: optionalString.default(""),
  value: optionalString.default(""),
});

export const sectorInputSchema = z.object({
  id: optionalString,
  slug: requiredString.regex(slugPattern, "Use lowercase letters, numbers, and hyphens only."),
  sortOrder: z.coerce.number().int().min(0).default(0),
  published: z.boolean().default(true),
  name: requiredString,
  tagline: optionalString,
  heroImageUrl: optionalMediaUrl,
  imageUrl: optionalMediaUrl,
  seoTitle: optionalString,
  seoDescription: optionalString,
  ctaTitle: optionalString,
  ctaDescription: optionalString,
  officerName: optionalString,
  officerTitle: optionalString,
  officerSpecialization: optionalString,
  officerPhone: optionalString,
  officerEmail: optionalString,
  officerImageUrl: optionalMediaUrl,
  consultationLink: optionalNavigationUrl,
  reportLink: optionalAbsoluteUrl,
  officerDescription: optionalString,
  overviewParagraphs: z.array(requiredString).default([]),
  stats: z.array(statItemSchema).default([]),
  whyInvestItems: z.array(requiredString).default([]),
  advantages: z.array(requiredString).default([]),
});

export const projectInputSchema = z.object({
  id: optionalString,
  legacyId: requiredString,
  slug: requiredString.regex(slugPattern, "Use lowercase letters, numbers, and hyphens only."),
  sectorId: requiredString,
  sortOrder: z.coerce.number().int().min(0).default(0),
  published: z.boolean().default(true),
  type: optionalString,
  title: requiredString,
  subTitle: optionalString,
  description: optionalString,
  brochureUrl: optionalAbsoluteUrl,
  moreInfoUrl: optionalNavigationUrl,
  videoUrl: optionalMediaUrl,
  heroVideoUrl: optionalMediaUrl,
  media: z
    .array(
      z.object({
        url: requiredString.refine(
          isSafeMediaUrl,
          "Enter a valid media URL starting with https://, http://, or /.",
        ),
        altText: optionalString,
      }),
    )
    .default([]),
  stats: z.array(statItemSchema).default([]),
  highlights: z.array(requiredString).default([]),
  financialItems: z.array(requiredString).default([]),
});

export const speakerInputSchema = z.object({
  id: optionalString,
  name: requiredString,
  title: optionalString,
  company: optionalString,
  imageUrl: optionalMediaUrl,
  alt: optionalString,
});

export const speakerSessionInputSchema = z.object({
  id: optionalString,
  name: requiredString,
  speakers: z.array(speakerInputSchema).default([]),
});

export const speakerSettingsSchema = z.object({
  title: requiredString,
  subtitle: optionalString,
  sessions: z.array(speakerSessionInputSchema).default([]),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: requiredString,
});

export type SectorInput = z.infer<typeof sectorInputSchema>;
export type ProjectInput = z.infer<typeof projectInputSchema>;
export type SpeakerSettingsInput = z.infer<typeof speakerSettingsSchema>;
