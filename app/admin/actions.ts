"use server";
import { revalidatePath } from "next/cache";

import { signIn, signOut } from "@/auth";
import { registerMediaUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";
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

const asNullable = (value?: string | null) => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

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

  const parsed = sectorInputSchema.parse({
    ...input,
    overviewParagraphs: normalizeStringList(input.overviewParagraphs),
    stats: normalizeStatList(input.stats),
    whyInvestItems: normalizeStringList(input.whyInvestItems),
    advantages: normalizeStringList(input.advantages),
  });

  await Promise.all([
    registerMediaUrl(parsed.heroImageUrl),
    registerMediaUrl(parsed.imageUrl),
    registerMediaUrl(parsed.officerImageUrl),
    registerMediaUrl(parsed.reportLink),
  ]);

  const sectorId = await prisma.$transaction(async (tx) => {
    if (parsed.id) {
      await tx.sectorOverviewParagraph.deleteMany({ where: { sectorId: parsed.id } });
      await tx.sectorStat.deleteMany({ where: { sectorId: parsed.id } });
      await tx.sectorWhyInvest.deleteMany({ where: { sectorId: parsed.id } });
      await tx.sectorAdvantage.deleteMany({ where: { sectorId: parsed.id } });

      const updated = await tx.sector.update({
        where: { id: parsed.id },
        data: {
          slug: parsed.slug,
          sortOrder: parsed.sortOrder,
          published: parsed.published,
          name: parsed.name,
          tagline: asNullable(parsed.tagline),
          heroImageUrl: asNullable(parsed.heroImageUrl),
          imageUrl: asNullable(parsed.imageUrl),
          seoTitle: asNullable(parsed.seoTitle),
          seoDescription: asNullable(parsed.seoDescription),
          ctaTitle: asNullable(parsed.ctaTitle),
          ctaDescription: asNullable(parsed.ctaDescription),
          officerName: asNullable(parsed.officerName),
          officerTitle: asNullable(parsed.officerTitle),
          officerSpecialization: asNullable(parsed.officerSpecialization),
          officerPhone: asNullable(parsed.officerPhone),
          officerEmail: asNullable(parsed.officerEmail),
          officerImageUrl: asNullable(parsed.officerImageUrl),
          consultationLink: asNullable(parsed.consultationLink),
          reportLink: asNullable(parsed.reportLink),
          officerDescription: asNullable(parsed.officerDescription),
          overviewParagraphs: {
            create: parsed.overviewParagraphs.map((value, index) => ({ value, sortOrder: index })),
          },
          stats: {
            create: parsed.stats.map((item, index) => ({
              label: item.label,
              value: item.value,
              sortOrder: index,
            })),
          },
          whyInvestItems: {
            create: parsed.whyInvestItems.map((value, index) => ({ value, sortOrder: index })),
          },
          advantages: {
            create: parsed.advantages.map((value, index) => ({ value, sortOrder: index })),
          },
        },
      });

      return updated.id;
    }

    const created = await tx.sector.create({
      data: {
        slug: parsed.slug,
        sortOrder: parsed.sortOrder,
        published: parsed.published,
        name: parsed.name,
        tagline: asNullable(parsed.tagline),
        heroImageUrl: asNullable(parsed.heroImageUrl),
        imageUrl: asNullable(parsed.imageUrl),
        seoTitle: asNullable(parsed.seoTitle),
        seoDescription: asNullable(parsed.seoDescription),
        ctaTitle: asNullable(parsed.ctaTitle),
        ctaDescription: asNullable(parsed.ctaDescription),
        officerName: asNullable(parsed.officerName),
        officerTitle: asNullable(parsed.officerTitle),
        officerSpecialization: asNullable(parsed.officerSpecialization),
        officerPhone: asNullable(parsed.officerPhone),
        officerEmail: asNullable(parsed.officerEmail),
        officerImageUrl: asNullable(parsed.officerImageUrl),
        consultationLink: asNullable(parsed.consultationLink),
        reportLink: asNullable(parsed.reportLink),
        officerDescription: asNullable(parsed.officerDescription),
        overviewParagraphs: {
          create: parsed.overviewParagraphs.map((value, index) => ({ value, sortOrder: index })),
        },
        stats: {
          create: parsed.stats.map((item, index) => ({
            label: item.label,
            value: item.value,
            sortOrder: index,
          })),
        },
        whyInvestItems: {
          create: parsed.whyInvestItems.map((value, index) => ({ value, sortOrder: index })),
        },
        advantages: {
          create: parsed.advantages.map((value, index) => ({ value, sortOrder: index })),
        },
      },
    });

    return created.id;
  });

  revalidatePublic("/", "/sectors", `/sectors/${parsed.slug}`, "/admin", "/admin/sectors");

  return { ok: true as const, id: sectorId };
}

export async function deleteSectorAction(id: string) {
  await requireAdmin();
  await prisma.sector.delete({ where: { id } });
  revalidatePublic("/", "/sectors", "/admin", "/admin/sectors");
}

export async function saveProjectAction(input: ProjectInput) {
  await requireAdmin();

  const parsed = projectInputSchema.parse({
    ...input,
    media: normalizeMediaList(input.media),
    stats: normalizeStatList(input.stats),
    highlights: normalizeStringList(input.highlights),
    financialItems: normalizeStringList(input.financialItems),
  });

  await Promise.all([
    ...parsed.media.map((item) => registerMediaUrl(item.url, { altText: item.altText })),
    registerMediaUrl(parsed.brochureUrl),
    registerMediaUrl(parsed.videoUrl),
    registerMediaUrl(parsed.heroVideoUrl),
  ]);

  const sector = await prisma.sector.findUniqueOrThrow({
    where: {
      id: parsed.sectorId,
    },
    select: {
      slug: true,
    },
  });

  const projectId = await prisma.$transaction(async (tx) => {
    if (parsed.id) {
      await tx.projectMedia.deleteMany({ where: { projectId: parsed.id } });
      await tx.projectStat.deleteMany({ where: { projectId: parsed.id } });
      await tx.projectHighlight.deleteMany({ where: { projectId: parsed.id } });
      await tx.projectFinancialItem.deleteMany({ where: { projectId: parsed.id } });

      const updated = await tx.project.update({
        where: { id: parsed.id },
        data: {
          legacyId: parsed.legacyId,
          slug: parsed.slug,
          sectorId: parsed.sectorId,
          sortOrder: parsed.sortOrder,
          published: parsed.published,
          type: asNullable(parsed.type),
          title: parsed.title,
          subTitle: asNullable(parsed.subTitle),
          description: asNullable(parsed.description),
          brochureUrl: asNullable(parsed.brochureUrl),
          moreInfoUrl: asNullable(parsed.moreInfoUrl),
          videoUrl: asNullable(parsed.videoUrl),
          heroVideoUrl: asNullable(parsed.heroVideoUrl),
          media: {
            create: parsed.media.map((item, index) => ({
              url: item.url,
              altText: asNullable(item.altText),
              sortOrder: index,
            })),
          },
          stats: {
            create: parsed.stats.map((item, index) => ({
              label: item.label,
              value: item.value,
              sortOrder: index,
            })),
          },
          highlights: {
            create: parsed.highlights.map((value, index) => ({ value, sortOrder: index })),
          },
          financialItems: {
            create: parsed.financialItems.map((value, index) => ({ value, sortOrder: index })),
          },
        },
      });

      return updated.id;
    }

    const created = await tx.project.create({
      data: {
        legacyId: parsed.legacyId,
        slug: parsed.slug,
        sectorId: parsed.sectorId,
        sortOrder: parsed.sortOrder,
        published: parsed.published,
        type: asNullable(parsed.type),
        title: parsed.title,
        subTitle: asNullable(parsed.subTitle),
        description: asNullable(parsed.description),
        brochureUrl: asNullable(parsed.brochureUrl),
        moreInfoUrl: asNullable(parsed.moreInfoUrl),
        videoUrl: asNullable(parsed.videoUrl),
        heroVideoUrl: asNullable(parsed.heroVideoUrl),
        media: {
          create: parsed.media.map((item, index) => ({
            url: item.url,
            altText: asNullable(item.altText),
            sortOrder: index,
          })),
        },
        stats: {
          create: parsed.stats.map((item, index) => ({
            label: item.label,
            value: item.value,
            sortOrder: index,
          })),
        },
        highlights: {
          create: parsed.highlights.map((value, index) => ({ value, sortOrder: index })),
        },
        financialItems: {
          create: parsed.financialItems.map((value, index) => ({ value, sortOrder: index })),
        },
      },
    });

    return created.id;
  });

  revalidatePublic(
    "/sectors",
    `/sectors/${sector.slug}`,
    `/projects/${parsed.slug}`,
    "/admin",
    "/admin/projects",
  );

  return { ok: true as const, id: projectId };
}

export async function deleteProjectAction(id: string) {
  await requireAdmin();
  await prisma.project.delete({ where: { id } });
  revalidatePublic("/sectors", "/admin", "/admin/projects");
}

export async function saveSpeakerSettingsAction(input: SpeakerSettingsInput) {
  await requireAdmin();

  const parsed = speakerSettingsSchema.parse({
    ...input,
    sessions: input.sessions.map((session) => ({
      ...session,
      speakers: session.speakers.filter((speaker) => speaker.name.trim()),
    })),
  });

  await Promise.all(
    parsed.sessions.flatMap((session) =>
      session.speakers.map((speaker) =>
        registerMediaUrl(speaker.imageUrl, { altText: speaker.alt || speaker.name }),
      ),
    ),
  );

  await prisma.$transaction(async (tx) => {
    await tx.speaker.deleteMany();
    await tx.speakerSession.deleteMany();

    await tx.speakerSectionSettings.upsert({
      where: {
        id: "singleton",
      },
      update: {
        title: parsed.title,
        subtitle: asNullable(parsed.subtitle),
      },
      create: {
        id: "singleton",
        title: parsed.title,
        subtitle: asNullable(parsed.subtitle),
      },
    });

    for (const [sessionIndex, session] of parsed.sessions.entries()) {
      const createdSession = await tx.speakerSession.create({
        data: {
          name: session.name,
          sortOrder: sessionIndex,
        },
      });

      for (const [speakerIndex, speaker] of session.speakers.entries()) {
        await tx.speaker.create({
          data: {
            sessionId: createdSession.id,
            name: speaker.name.trim(),
            title: asNullable(speaker.title),
            company: asNullable(speaker.company),
            imageUrl: asNullable(speaker.imageUrl),
            alt: asNullable(speaker.alt),
            sortOrder: speakerIndex,
          },
        });
      }
    }
  });

  revalidatePublic("/", "/admin", "/admin/speakers");

  return { ok: true as const };
}
