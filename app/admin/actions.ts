"use server";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

import { signIn, signOut } from "@/auth";
import { dataRepository } from "@/lib/data/repository";
import { registerMediaUrl } from "@/lib/media";
import {
  loginSchema,
  projectInputSchema,
  sectorInputSchema,
  speakerSettingsSchema,
  type ProjectInput,
  type SectorInput,
  type SpeakerSettingsInput,
} from "@/lib/validation";
import { requireAdmin } from "@/lib/auth-utils";

const normalizeStringList = (values: string[]) => values.map((value) => value.trim()).filter(Boolean);

const normalizeStatList = (values: Array<{ label: string; value: string }>) =>
  values
    .map((item) => ({
      label: item.label.trim(),
      value: item.value.trim(),
    }))
    .filter((item) => item.label || item.value);

const normalizeMediaList = (values: Array<{ url: string; altText?: string }>) =>
  values
    .map((item) => ({
      url: item.url.trim(),
      altText: item.altText?.trim() ?? "",
    }))
    .filter((item) => item.url);

const revalidatePublic = (...paths: string[]) => {
  for (const path of paths) {
    revalidatePath(path);
  }
};

const normalizeSlugValue = (value: string) => value.trim().toLowerCase();

const toActionError = (error: unknown, fallback: string) => {
  if (error instanceof ZodError) {
    return new Error(error.issues[0]?.message ?? fallback);
  }

  if (error instanceof Error && error.message) {
    return error;
  }

  return new Error(fallback);
};

export async function loginAction(
  _: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: "Enter a valid email and password.",
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/admin",
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    return {
      error: "Invalid login credentials.",
    };
  }

  return { error: null };
}

export async function logoutAction() {
  await signOut({
    redirectTo: "/admin/login",
  });
}

export async function saveSectorAction(input: SectorInput) {
  await requireAdmin();

  let parsed: SectorInput;

  try {
    parsed = sectorInputSchema.parse({
      ...input,
      slug: normalizeSlugValue(input.slug),
      overviewParagraphs: normalizeStringList(input.overviewParagraphs),
      stats: normalizeStatList(input.stats),
      whyInvestItems: normalizeStringList(input.whyInvestItems),
      advantages: normalizeStringList(input.advantages),
    });
  } catch (error) {
    throw toActionError(error, "Unable to save sector.");
  }

  await Promise.all([
    registerMediaUrl(parsed.heroImageUrl),
    registerMediaUrl(parsed.imageUrl),
    registerMediaUrl(parsed.officerImageUrl),
    registerMediaUrl(parsed.reportLink),
  ]);

  const { id: sectorId } = await dataRepository.saveSector(parsed);

  revalidatePublic("/", "/sectors", `/sectors/${parsed.slug}`, "/admin", "/admin/sectors");

  return { ok: true as const, id: sectorId };
}

export async function deleteSectorAction(id: string) {
  await requireAdmin();
  await dataRepository.deleteSector(id);
  revalidatePublic("/", "/sectors", "/admin", "/admin/sectors");
}

export async function saveProjectAction(input: ProjectInput) {
  await requireAdmin();

  let parsed: ProjectInput;

  try {
    parsed = projectInputSchema.parse({
      ...input,
      slug: normalizeSlugValue(input.slug),
      media: normalizeMediaList(input.media),
      stats: normalizeStatList(input.stats),
      highlights: normalizeStringList(input.highlights),
      financialItems: normalizeStringList(input.financialItems),
    });
  } catch (error) {
    throw toActionError(error, "Unable to save project.");
  }

  await Promise.all([
    ...parsed.media.map((item) => registerMediaUrl(item.url, { altText: item.altText })),
    registerMediaUrl(parsed.brochureUrl),
    registerMediaUrl(parsed.videoUrl),
    registerMediaUrl(parsed.heroVideoUrl),
  ]);

  const { id: projectId, sectorSlug } = await dataRepository.saveProject(parsed);

  revalidatePublic(
    "/sectors",
    `/sectors/${sectorSlug}`,
    `/projects/${parsed.slug}`,
    "/admin",
    "/admin/projects",
  );

  return { ok: true as const, id: projectId };
}

export async function deleteProjectAction(id: string) {
  await requireAdmin();
  await dataRepository.deleteProject(id);
  revalidatePublic("/sectors", "/admin", "/admin/projects");
}

export async function saveSpeakerSettingsAction(input: SpeakerSettingsInput) {
  await requireAdmin();

  let parsed: SpeakerSettingsInput;

  try {
    parsed = speakerSettingsSchema.parse({
      ...input,
      sessions: input.sessions.map((session) => ({
        ...session,
        speakers: session.speakers.filter((speaker) => speaker.name.trim()),
      })),
    });
  } catch (error) {
    throw toActionError(error, "Unable to save speakers.");
  }

  await Promise.all(
    parsed.sessions.flatMap((session) =>
      session.speakers.map((speaker) =>
        registerMediaUrl(speaker.imageUrl, { altText: speaker.alt || speaker.name }),
      ),
    ),
  );

  await dataRepository.saveSpeakerSettings(parsed);

  revalidatePublic("/", "/admin", "/admin/speakers");

  return { ok: true as const };
}
