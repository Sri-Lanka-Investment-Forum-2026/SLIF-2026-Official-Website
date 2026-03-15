import { DatabaseSync } from "node:sqlite";
import path from "node:path";

import { env } from "@/lib/env";
import { createPocketBaseSuperuserClient } from "@/lib/pocketbase";
import { applyPocketBaseSchema } from "@/lib/pocketbase-schema";

type MediaAssetRow = {
  id: string;
  publicUrl: string;
  objectKey: string | null;
  bucket: string | null;
  mimeType: string | null;
  size: number | null;
  altText: string | null;
  source: string;
};

type SectorRow = {
  id: string;
  slug: string;
  sortOrder: number;
  published: number;
  name: string;
  tagline: string | null;
  heroImageUrl: string | null;
  imageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ctaTitle: string | null;
  ctaDescription: string | null;
  officerName: string | null;
  officerTitle: string | null;
  officerSpecialization: string | null;
  officerPhone: string | null;
  officerEmail: string | null;
  officerImageUrl: string | null;
  consultationLink: string | null;
  reportLink: string | null;
  officerDescription: string | null;
};

type ValueRow = {
  id: string;
  value: string;
  sortOrder: number;
};

type StatRow = {
  id: string;
  label: string;
  value: string;
  sortOrder: number;
};

type ProjectRow = {
  id: string;
  legacyId: string;
  slug: string;
  sectorId: string;
  sortOrder: number;
  published: number;
  type: string | null;
  title: string;
  subTitle: string | null;
  description: string | null;
  brochureUrl: string | null;
  moreInfoUrl: string | null;
  videoUrl: string | null;
  heroVideoUrl: string | null;
};

type ProjectMediaRow = {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
};

type SpeakerSectionSettingsRow = {
  id: string;
  title: string;
  subtitle: string | null;
};

type SpeakerSessionRow = {
  id: string;
  name: string;
  sortOrder: number;
};

type SpeakerRow = {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  imageUrl: string | null;
  alt: string | null;
  sortOrder: number;
};

const parseSqliteFilePath = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed.startsWith("file:")) {
    throw new Error("SQLITE_IMPORT_URL must be a SQLite file URL.");
  }

  const rawPath = trimmed.slice("file:".length);
  return path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
};

const openImportDatabase = () => new DatabaseSync(parseSqliteFilePath(env.sqliteImportUrl));

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

async function main() {
  const pb = await createPocketBaseSuperuserClient();
  const sqlite = openImportDatabase();
  try {
    await applyPocketBaseSchema(pb);

    for (const collection of resetCollectionOrder) {
      await deleteCollectionRecords(pb, collection);
    }

    const mediaAssets = sqlite
      .prepare('SELECT "id", "publicUrl", "objectKey", "bucket", "mimeType", "size", "altText", "source" FROM "MediaAsset" ORDER BY "createdAt" ASC')
      .all() as MediaAssetRow[];
    const sectors = sqlite
      .prepare(
        'SELECT "id", "slug", "sortOrder", "published", "name", "tagline", "heroImageUrl", "imageUrl", "seoTitle", "seoDescription", "ctaTitle", "ctaDescription", "officerName", "officerTitle", "officerSpecialization", "officerPhone", "officerEmail", "officerImageUrl", "consultationLink", "reportLink", "officerDescription" FROM "Sector" ORDER BY "sortOrder" ASC',
      )
      .all() as SectorRow[];
    const speakerSettings = sqlite
      .prepare('SELECT "id", "title", "subtitle" FROM "SpeakerSectionSettings" WHERE "id" = ? LIMIT 1')
      .get("singleton") as SpeakerSectionSettingsRow | undefined;
    const speakerSessions = sqlite
      .prepare('SELECT "id", "name", "sortOrder" FROM "SpeakerSession" ORDER BY "sortOrder" ASC')
      .all() as SpeakerSessionRow[];
    const projects = sqlite
      .prepare(
        'SELECT "id", "legacyId", "slug", "sectorId", "sortOrder", "published", "type", "title", "subTitle", "description", "brochureUrl", "moreInfoUrl", "videoUrl", "heroVideoUrl" FROM "Project" ORDER BY "sortOrder" ASC',
      )
      .all() as ProjectRow[];

    const loadSectorValues = (table: string, sectorId: string) =>
      sqlite
        .prepare(`SELECT "id", "value", "sortOrder" FROM "${table}" WHERE "sectorId" = ? ORDER BY "sortOrder" ASC`)
        .all(sectorId) as ValueRow[];
    const loadSectorStats = (sectorId: string) =>
      sqlite
        .prepare('SELECT "id", "label", "value", "sortOrder" FROM "SectorStat" WHERE "sectorId" = ? ORDER BY "sortOrder" ASC')
        .all(sectorId) as StatRow[];
    const loadProjectValues = (table: string, projectId: string) =>
      sqlite
        .prepare(`SELECT "id", "value", "sortOrder" FROM "${table}" WHERE "projectId" = ? ORDER BY "sortOrder" ASC`)
        .all(projectId) as ValueRow[];
    const loadProjectStats = (projectId: string) =>
      sqlite
        .prepare('SELECT "id", "label", "value", "sortOrder" FROM "ProjectStat" WHERE "projectId" = ? ORDER BY "sortOrder" ASC')
        .all(projectId) as StatRow[];
    const loadProjectMedia = (projectId: string) =>
      sqlite
        .prepare('SELECT "id", "url", "altText", "sortOrder" FROM "ProjectMedia" WHERE "projectId" = ? ORDER BY "sortOrder" ASC')
        .all(projectId) as ProjectMediaRow[];
    const loadSessionSpeakers = (sessionId: string) =>
      sqlite
        .prepare(
          'SELECT "id", "name", "title", "company", "imageUrl", "alt", "sortOrder" FROM "Speaker" WHERE "sessionId" = ? ORDER BY "sortOrder" ASC',
        )
        .all(sessionId) as SpeakerRow[];

    const sectorIdMap = new Map<string, string>();
    let speakerCount = 0;

    for (const asset of mediaAssets) {
      await pb.collection("media_assets").create(
        {
          publicUrl: asset.publicUrl,
          objectKey: asset.objectKey,
          bucket: asset.bucket,
          mimeType: asset.mimeType,
          size: asset.size,
          altText: asset.altText,
          source: asset.source,
        },
        { requestKey: null },
      );
    }

    for (const sector of sectors) {
      const createdSector = await pb.collection("sectors").create(
        {
          slug: sector.slug,
          sortOrder: sector.sortOrder,
          published: Boolean(sector.published),
          name: sector.name,
          tagline: sector.tagline,
          heroImageUrl: sector.heroImageUrl,
          imageUrl: sector.imageUrl,
          seoTitle: sector.seoTitle,
          seoDescription: sector.seoDescription,
          ctaTitle: sector.ctaTitle,
          ctaDescription: sector.ctaDescription,
          officerName: sector.officerName,
          officerTitle: sector.officerTitle,
          officerSpecialization: sector.officerSpecialization,
          officerPhone: sector.officerPhone,
          officerEmail: sector.officerEmail,
          officerImageUrl: sector.officerImageUrl,
          consultationLink: sector.consultationLink,
          reportLink: sector.reportLink,
          officerDescription: sector.officerDescription,
        },
        { requestKey: null },
      );

      sectorIdMap.set(sector.id, createdSector.id);

      await Promise.all([
        ...loadSectorValues("SectorOverviewParagraph", sector.id).map((item) =>
          pb.collection("sector_overview_paragraphs").create(
            { sector: createdSector.id, value: item.value, sortOrder: item.sortOrder },
            { requestKey: null },
          ),
        ),
        ...loadSectorStats(sector.id).map((item) =>
          pb.collection("sector_stats").create(
            { sector: createdSector.id, label: item.label, value: item.value, sortOrder: item.sortOrder },
            { requestKey: null },
          ),
        ),
        ...loadSectorValues("SectorWhyInvest", sector.id).map((item) =>
          pb.collection("sector_why_invest").create(
            { sector: createdSector.id, value: item.value, sortOrder: item.sortOrder },
            { requestKey: null },
          ),
        ),
        ...loadSectorValues("SectorAdvantage", sector.id).map((item) =>
          pb.collection("sector_advantages").create(
            { sector: createdSector.id, value: item.value, sortOrder: item.sortOrder },
            { requestKey: null },
          ),
        ),
      ]);
    }

    for (const project of projects) {
      const sectorId = sectorIdMap.get(project.sectorId);

      if (!sectorId) {
        throw new Error(`Missing sector mapping for project ${project.id}`);
      }

      const createdProject = await pb.collection("projects").create(
        {
          legacyId: project.legacyId,
          slug: project.slug,
          sector: sectorId,
          sortOrder: project.sortOrder,
          published: Boolean(project.published),
          type: project.type,
          title: project.title,
          subTitle: project.subTitle,
          description: project.description,
          brochureUrl: project.brochureUrl,
          moreInfoUrl: project.moreInfoUrl,
          videoUrl: project.videoUrl,
          heroVideoUrl: project.heroVideoUrl,
        },
        { requestKey: null },
      );

      await Promise.all([
        ...loadProjectMedia(project.id).map((item) =>
          pb.collection("project_media").create(
            { project: createdProject.id, url: item.url, altText: item.altText, sortOrder: item.sortOrder },
            { requestKey: null },
          ),
        ),
        ...loadProjectStats(project.id).map((item) =>
          pb.collection("project_stats").create(
            { project: createdProject.id, label: item.label, value: item.value, sortOrder: item.sortOrder },
            { requestKey: null },
          ),
        ),
        ...loadProjectValues("ProjectHighlight", project.id).map((item) =>
          pb.collection("project_highlights").create(
            { project: createdProject.id, value: item.value, sortOrder: item.sortOrder },
            { requestKey: null },
          ),
        ),
        ...loadProjectValues("ProjectFinancialItem", project.id).map((item) =>
          pb.collection("project_financial_items").create(
            { project: createdProject.id, value: item.value, sortOrder: item.sortOrder },
            { requestKey: null },
          ),
        ),
      ]);
    }

    if (speakerSettings) {
      await pb.collection("speaker_section_settings").create(
        {
          key: "singleton",
          title: speakerSettings.title,
          subtitle: speakerSettings.subtitle,
        },
        { requestKey: null },
      );
    }

    for (const session of speakerSessions) {
      const createdSession = await pb.collection("speaker_sessions").create(
        {
          name: session.name,
          sortOrder: session.sortOrder,
        },
        { requestKey: null },
      );

      const speakers = loadSessionSpeakers(session.id);
      speakerCount += speakers.length;

      for (const speaker of speakers) {
        await pb.collection("speakers").create(
          {
            session: createdSession.id,
            name: speaker.name,
            title: speaker.title,
            company: speaker.company,
            imageUrl: speaker.imageUrl,
            alt: speaker.alt,
            sortOrder: speaker.sortOrder,
          },
          { requestKey: null },
        );
      }
    }

    console.log(
      JSON.stringify(
        {
          imported: {
            mediaAssets: mediaAssets.length,
            sectors: sectors.length,
            projects: projects.length,
            speakerSessions: speakerSessions.length,
            speakers: speakerCount,
          },
        },
        null,
        2,
      ),
    );
  } finally {
    sqlite.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
