import fs from "node:fs/promises";
import path from "node:path";

import { env } from "@/lib/env";
import { createPocketBaseSuperuserClient, POCKETBASE_ADMIN_COLLECTION } from "@/lib/pocketbase";
import { applyPocketBaseSchema } from "@/lib/pocketbase-schema";
import { registerMediaUrl } from "@/lib/media";
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

const deleteCollectionRecords = async (pb: any, collection: string) => {
  const records = await pb.collection(collection).getFullList({
    requestKey: null,
    fields: "id",
  });

  for (const record of records) {
    try {
      await pb.collection(collection).delete(record.id, { requestKey: null });
    } catch (error: any) {
      if (error?.status !== 404) {
        throw error;
      }
    }
  }
};

const resetCollectionOrder = [
  "project_financial_items",
  "project_highlights",
  "project_stats",
  "project_media",
  "projects",
  "sector_advantages",
  "sector_why_invest",
  "sector_stats",
  "sector_overview_paragraphs",
  "speakers",
  "speaker_sessions",
  "speaker_section_settings",
  "sectors",
  "media_assets",
] as const;

const resetContent = async (pb: any) => {
  for (const collection of resetCollectionOrder) {
    await deleteCollectionRecords(pb, collection);
  }
};

const ensureAdminUser = async (pb: any) => {
  if (!env.initialAdminEmail || !env.initialAdminPassword) {
    return;
  }

  const email = env.initialAdminEmail.toLowerCase();
  const payload = {
    email,
    password: env.initialAdminPassword,
    passwordConfirm: env.initialAdminPassword,
    name: env.initialAdminName,
    active: true,
    verified: true,
  };

  try {
    const existing = await pb.collection(POCKETBASE_ADMIN_COLLECTION).getFirstListItem(`email = "${email}"`, {
      requestKey: null,
    });

    await pb.collection(POCKETBASE_ADMIN_COLLECTION).update(existing.id, payload, {
      requestKey: null,
    });
  } catch {
    await pb.collection(POCKETBASE_ADMIN_COLLECTION).create(payload, {
      requestKey: null,
    });
  }
};

const importSectors = async (pb: any, sectors: Record<string, RawSector>) => {
  const sectorEntries = Object.entries(sectors);
  const sectorIdByKey = new Map<string, string>();

  for (const [index, [key, sector]] of sectorEntries.entries()) {
    await Promise.all([
      registerMediaUrl(sector.heroImage),
      registerMediaUrl(sector.image),
      registerMediaUrl(sector.officer?.image),
      registerMediaUrl(sector.officer?.reportLink),
    ]);

    const created = await pb.collection("sectors").create(
      {
        slug: key,
        sortOrder: index,
        published: true,
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
      },
      { requestKey: null },
    );

    sectorIdByKey.set(key, created.id);

    await Promise.all([
      ...(sector.overview ?? []).map((value, itemIndex) =>
        pb.collection("sector_overview_paragraphs").create(
          { sector: created.id, value, sortOrder: itemIndex },
          { requestKey: null },
        ),
      ),
      ...(sector.stats ?? []).map((item, itemIndex) =>
        pb.collection("sector_stats").create(
          { sector: created.id, label: item.label, value: item.value, sortOrder: itemIndex },
          { requestKey: null },
        ),
      ),
      ...(sector.whyInvest ?? []).map((value, itemIndex) =>
        pb.collection("sector_why_invest").create(
          { sector: created.id, value, sortOrder: itemIndex },
          { requestKey: null },
        ),
      ),
      ...(sector.advantages ?? []).map((value, itemIndex) =>
        pb.collection("sector_advantages").create(
          { sector: created.id, value, sortOrder: itemIndex },
          { requestKey: null },
        ),
      ),
    ]);
  }

  return sectorIdByKey;
};

const importProjects = async (
  pb: any,
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

      const created = await pb.collection("projects").create(
        {
          legacyId: project.id,
          slug,
          sector: sectorId,
          sortOrder: index,
          published: true,
          type: asNullable(project.type),
          title: project.title,
          subTitle: asNullable(project.subTitle),
          description: asNullable(project.description),
          brochureUrl: asNullable(project.brochure),
          moreInfoUrl: asNullable(project.moreInfo),
          videoUrl: asNullable(project.video),
          heroVideoUrl: asNullable(project.heroVideo),
        },
        { requestKey: null },
      );

      await Promise.all([
        ...(project.images ?? []).map((url, itemIndex) =>
          pb.collection("project_media").create(
            { project: created.id, url, altText: project.title, sortOrder: itemIndex },
            { requestKey: null },
          ),
        ),
        ...(project.stats ?? []).map((item, itemIndex) =>
          pb.collection("project_stats").create(
            { project: created.id, label: item.label, value: item.value, sortOrder: itemIndex },
            { requestKey: null },
          ),
        ),
        ...(project.keyHighlights ?? []).map((value, itemIndex) =>
          pb.collection("project_highlights").create(
            { project: created.id, value, sortOrder: itemIndex },
            { requestKey: null },
          ),
        ),
        ...(project.financialSnapshot ?? []).map((value, itemIndex) =>
          pb.collection("project_financial_items").create(
            { project: created.id, value, sortOrder: itemIndex },
            { requestKey: null },
          ),
        ),
      ]);
    }
  }
};

const importSpeakers = async (pb: any, speakerContent: RawSpeakers) => {
  await pb.collection("speaker_section_settings").create(
    {
      key: "singleton",
      title: speakerContent.title,
      subtitle: asNullable(speakerContent.subtitle),
    },
    { requestKey: null },
  );

  for (const [sessionIndex, session] of speakerContent.sessions.entries()) {
    const createdSession = await pb.collection("speaker_sessions").create(
      {
        name: session.name,
        sortOrder: sessionIndex,
      },
      { requestKey: null },
    );

    for (const [speakerIndex, speaker] of session.speakers.entries()) {
      await registerMediaUrl(speaker.image, { altText: speaker.alt || speaker.name });

      await pb.collection("speakers").create(
        {
          session: createdSession.id,
          name: speaker.name,
          title: asNullable(speaker.title),
          company: asNullable(speaker.company),
          imageUrl: asNullable(speaker.image),
          alt: asNullable(speaker.alt),
          sortOrder: speakerIndex,
        },
        { requestKey: null },
      );
    }
  }
};

async function main() {
  const pb = await createPocketBaseSuperuserClient();
  const [sectors, projects, speakers] = await Promise.all([
    readJson<Record<string, RawSector>>("data/sectors.json"),
    readJson<Record<string, RawProject[]>>("data/projects.json"),
    readJson<RawSpeakers>("data/speakers.json"),
  ]);

  await applyPocketBaseSchema(pb);
  await resetContent(pb);
  await ensureAdminUser(pb);
  const sectorIdByKey = await importSectors(pb, sectors);
  await importProjects(pb, projects, sectorIdByKey);
  await importSpeakers(pb, speakers);

  console.log(
    JSON.stringify(
      {
        sectors: Object.keys(sectors).length,
        projectSectors: Object.keys(projects).length,
        sessions: speakers.sessions.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
