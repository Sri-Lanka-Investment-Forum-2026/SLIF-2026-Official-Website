import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import fs from "node:fs/promises";
import path from "node:path";

import { env } from "@/lib/env";
import { registerMediaUrl } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

type RawSector = {
  name: string;
  tagline?: string;
  heroImage?: string;
  image?: string;
  overview?: string[];
  stats?: Array<{ label: string; value: string }>;
  whyInvest?: string[];
  advantages?: string[];
  cta?: { title?: string; description?: string };
  seo?: { title?: string; description?: string };
  officer?: {
    name?: string;
    title?: string;
    specialization?: string;
    phone?: string;
    email?: string;
    image?: string;
    consultationLink?: string;
    reportLink?: string;
    description?: string;
  };
};

type RawProject = {
  id: string;
  type?: string;
  title: string;
  subTitle?: string;
  description?: string;
  images?: string[];
  video?: string;
  heroVideo?: string;
  stats?: Array<{ label: string; value: string }>;
  keyHighlights?: string[];
  financialSnapshot?: string[];
  brochure?: string;
  moreInfo?: string;
};

type RawSpeakers = {
  title: string;
  subtitle?: string;
  sessions: Array<{
    name: string;
    speakers: Array<{
      name: string;
      title?: string;
      company?: string;
      image?: string;
      alt?: string;
    }>;
  }>;
};

const root = process.cwd();

const readJson = async <T>(relativePath: string) => {
  const file = path.join(root, relativePath);
  const content = await fs.readFile(file, "utf8");
  return JSON.parse(content) as T;
};

const asNullable = (value?: string | null) => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

const resetContent = async () => {
  await prisma.$transaction([
    prisma.projectFinancialItem.deleteMany(),
    prisma.projectHighlight.deleteMany(),
    prisma.projectStat.deleteMany(),
    prisma.projectMedia.deleteMany(),
    prisma.project.deleteMany(),
    prisma.sectorAdvantage.deleteMany(),
    prisma.sectorWhyInvest.deleteMany(),
    prisma.sectorStat.deleteMany(),
    prisma.sectorOverviewParagraph.deleteMany(),
    prisma.speaker.deleteMany(),
    prisma.speakerSession.deleteMany(),
    prisma.speakerSectionSettings.deleteMany(),
    prisma.sector.deleteMany(),
    prisma.mediaAsset.deleteMany(),
  ]);
};

const ensureAdminUser = async () => {
  if (!env.initialAdminEmail || !env.initialAdminPassword) {
    return;
  }

  const passwordHash = await bcrypt.hash(env.initialAdminPassword, 10);

  await prisma.adminUser.upsert({
    where: {
      email: env.initialAdminEmail.toLowerCase(),
    },
    update: {
      name: env.initialAdminName,
      passwordHash,
      active: true,
    },
    create: {
      email: env.initialAdminEmail.toLowerCase(),
      name: env.initialAdminName,
      passwordHash,
      active: true,
    },
  });
};

const importSectors = async (sectors: Record<string, RawSector>) => {
  const sectorEntries = Object.entries(sectors);
  const sectorIdByKey = new Map<string, string>();

  for (const [index, [key, sector]] of sectorEntries.entries()) {
    await Promise.all([
      registerMediaUrl(sector.heroImage),
      registerMediaUrl(sector.image),
      registerMediaUrl(sector.officer?.image),
      registerMediaUrl(sector.officer?.reportLink),
    ]);

    const created = await prisma.sector.create({
      data: {
        slug: key,
        sortOrder: index,
        name: sector.name,
        tagline: asNullable(sector.tagline),
        heroImageUrl: asNullable(sector.heroImage),
        imageUrl: asNullable(sector.image),
        seoTitle: asNullable(sector.seo?.title),
        seoDescription: asNullable(sector.seo?.description),
        ctaTitle: asNullable(sector.cta?.title),
        ctaDescription: asNullable(sector.cta?.description),
        officerName: asNullable(sector.officer?.name),
        officerTitle: asNullable(sector.officer?.title),
        officerSpecialization: asNullable(sector.officer?.specialization),
        officerPhone: asNullable(sector.officer?.phone),
        officerEmail: asNullable(sector.officer?.email),
        officerImageUrl: asNullable(sector.officer?.image),
        consultationLink: asNullable(sector.officer?.consultationLink),
        reportLink: asNullable(sector.officer?.reportLink),
        officerDescription: asNullable(sector.officer?.description),
        overviewParagraphs: {
          create: (sector.overview ?? []).map((value, itemIndex) => ({
            value,
            sortOrder: itemIndex,
          })),
        },
        stats: {
          create: (sector.stats ?? []).map((item, itemIndex) => ({
            label: item.label,
            value: item.value,
            sortOrder: itemIndex,
          })),
        },
        whyInvestItems: {
          create: (sector.whyInvest ?? []).map((value, itemIndex) => ({
            value,
            sortOrder: itemIndex,
          })),
        },
        advantages: {
          create: (sector.advantages ?? []).map((value, itemIndex) => ({
            value,
            sortOrder: itemIndex,
          })),
        },
      },
    });

    sectorIdByKey.set(key, created.id);
  }

  return sectorIdByKey;
};

const importProjects = async (
  projectsBySector: Record<string, RawProject[]>,
  sectorIdByKey: Map<string, string>,
) => {
  const usedSlugs = new Set<string>();

  for (const [sectorKey, projects] of Object.entries(projectsBySector)) {
    const sectorId = sectorIdByKey.get(sectorKey);

    if (!sectorId) {
      continue;
    }

    for (const [index, project] of projects.entries()) {
      const candidate = slugify(project.title) || project.id.toLowerCase();
      const slug = usedSlugs.has(candidate) ? `${candidate}-${project.id.toLowerCase()}` : candidate;
      usedSlugs.add(slug);

      await Promise.all([
        ...(project.images ?? []).map((url) => registerMediaUrl(url, { altText: project.title })),
        registerMediaUrl(project.video),
        registerMediaUrl(project.heroVideo),
        registerMediaUrl(project.brochure),
      ]);

      await prisma.project.create({
        data: {
          legacyId: project.id,
          slug,
          sectorId,
          sortOrder: index,
          type: asNullable(project.type),
          title: project.title,
          subTitle: asNullable(project.subTitle),
          description: asNullable(project.description),
          brochureUrl: asNullable(project.brochure),
          moreInfoUrl: asNullable(project.moreInfo),
          videoUrl: asNullable(project.video),
          heroVideoUrl: asNullable(project.heroVideo),
          media: {
            create: (project.images ?? []).map((url, itemIndex) => ({
              url,
              altText: project.title,
              sortOrder: itemIndex,
            })),
          },
          stats: {
            create: (project.stats ?? []).map((item, itemIndex) => ({
              label: item.label,
              value: item.value,
              sortOrder: itemIndex,
            })),
          },
          highlights: {
            create: (project.keyHighlights ?? []).map((value, itemIndex) => ({
              value,
              sortOrder: itemIndex,
            })),
          },
          financialItems: {
            create: (project.financialSnapshot ?? []).map((value, itemIndex) => ({
              value,
              sortOrder: itemIndex,
            })),
          },
        },
      });
    }
  }
};

const importSpeakers = async (raw: RawSpeakers) => {
  await prisma.speakerSectionSettings.create({
    data: {
      id: "singleton",
      title: raw.title,
      subtitle: asNullable(raw.subtitle),
    },
  });

  for (const [sessionIndex, session] of raw.sessions.entries()) {
    const createdSession = await prisma.speakerSession.create({
      data: {
        name: session.name,
        sortOrder: sessionIndex,
      },
    });

    for (const [speakerIndex, speaker] of session.speakers.entries()) {
      await registerMediaUrl(speaker.image, { altText: speaker.alt ?? speaker.name });

      await prisma.speaker.create({
        data: {
          sessionId: createdSession.id,
          name: speaker.name,
          title: asNullable(speaker.title),
          company: asNullable(speaker.company),
          imageUrl: asNullable(speaker.image),
          alt: asNullable(speaker.alt),
          sortOrder: speakerIndex,
        },
      });
    }
  }
};

const main = async () => {
  const [sectors, projects, speakers] = await Promise.all([
    readJson<Record<string, RawSector>>("data/sectors.json"),
    readJson<Record<string, RawProject[]>>("data/projects.json"),
    readJson<RawSpeakers>("data/speakers.json"),
  ]);

  await resetContent();
  const sectorIdByKey = await importSectors(sectors);
  await importProjects(projects, sectorIdByKey);
  await importSpeakers(speakers);
  await ensureAdminUser();

  const summary = {
    sectors: Object.keys(sectors).length,
    projects: Object.values(projects).reduce((count, entries) => count + entries.length, 0),
    speakerSessions: speakers.sessions.length,
    speakers: speakers.sessions.reduce((count, session) => count + session.speakers.length, 0),
  } satisfies Prisma.JsonObject;

  console.log(JSON.stringify(summary, null, 2));
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
