import { z } from "zod";

const requiredString = z.string().trim().min(1);
const optionalString = z.string().trim().optional().or(z.literal(""));

export const statItemSchema = z.object({
  label: optionalString.default(""),
  value: optionalString.default(""),
});

export const sectorInputSchema = z.object({
  id: optionalString,
  slug: requiredString,
  sortOrder: z.coerce.number().int().min(0).default(0),
  published: z.boolean().default(true),
  name: requiredString,
  tagline: optionalString,
  heroImageUrl: optionalString,
  imageUrl: optionalString,
  seoTitle: optionalString,
  seoDescription: optionalString,
  ctaTitle: optionalString,
  ctaDescription: optionalString,
  officerName: optionalString,
  officerTitle: optionalString,
  officerSpecialization: optionalString,
  officerPhone: optionalString,
  officerEmail: optionalString,
  officerImageUrl: optionalString,
  consultationLink: optionalString,
  reportLink: optionalString,
  officerDescription: optionalString,
  overviewParagraphs: z.array(requiredString).default([]),
  stats: z.array(statItemSchema).default([]),
  whyInvestItems: z.array(requiredString).default([]),
  advantages: z.array(requiredString).default([]),
});

export const projectInputSchema = z.object({
  id: optionalString,
  legacyId: requiredString,
  slug: requiredString,
  sectorId: requiredString,
  sortOrder: z.coerce.number().int().min(0).default(0),
  published: z.boolean().default(true),
  type: optionalString,
  title: requiredString,
  subTitle: optionalString,
  description: optionalString,
  brochureUrl: optionalString,
  moreInfoUrl: optionalString,
  videoUrl: optionalString,
  heroVideoUrl: optionalString,
  media: z.array(z.object({ url: requiredString, altText: optionalString })).default([]),
  stats: z.array(statItemSchema).default([]),
  highlights: z.array(requiredString).default([]),
  financialItems: z.array(requiredString).default([]),
});

export const speakerInputSchema = z.object({
  id: optionalString,
  name: requiredString,
  title: optionalString,
  company: optionalString,
  imageUrl: optionalString,
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
