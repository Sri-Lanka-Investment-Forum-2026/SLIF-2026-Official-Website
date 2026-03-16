import type PocketBase from "pocketbase";

import {
  createPocketBaseClient,
  createPocketBaseServerClient,
  createPocketBaseSuperuserClient,
} from "@/lib/pocketbase";
import type { MediaAssetUpsertInput } from "@/lib/data/repository";

const asNullable = (value?: string | null) => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

const getReadClient = async () => {
  try {
    return await createPocketBaseServerClient();
  } catch {
    return createPocketBaseClient();
  }
};

const getWriteClient = async () => {
  try {
    const pb = await createPocketBaseServerClient();

    if (pb.authStore.isValid) {
      return pb;
    }
  } catch {}

  return createPocketBaseSuperuserClient();
};

const mapValueItem = (item: any) => ({
  id: item.id,
  value: item.value,
  sortOrder: item.sortOrder ?? 0,
});

const mapStatItem = (item: any) => ({
  id: item.id,
  label: item.label,
  value: item.value,
  sortOrder: item.sortOrder ?? 0,
});

const mapSectorBase = (sector: any) => ({
  id: sector.id,
  slug: sector.slug,
  sortOrder: sector.sortOrder ?? 0,
  published: Boolean(sector.published),
  name: sector.name,
  tagline: sector.tagline ?? null,
  heroImageUrl: sector.heroImageUrl ?? null,
  imageUrl: sector.imageUrl ?? null,
  seoTitle: sector.seoTitle ?? null,
  seoDescription: sector.seoDescription ?? null,
  ctaTitle: sector.ctaTitle ?? null,
  ctaDescription: sector.ctaDescription ?? null,
  officerName: sector.officerName ?? null,
  officerTitle: sector.officerTitle ?? null,
  officerSpecialization: sector.officerSpecialization ?? null,
  officerPhone: sector.officerPhone ?? null,
  officerEmail: sector.officerEmail ?? null,
  officerImageUrl: sector.officerImageUrl ?? null,
  consultationLink: sector.consultationLink ?? null,
  reportLink: sector.reportLink ?? null,
  officerDescription: sector.officerDescription ?? null,
});

const uniqueIds = (records: any[]) => [...new Set(records.map((record) => record.id))];

const createIdMap = (records: any[]) => new Map(records.map((record) => [record.id, record]));

const quoteFilterValue = (value: string) => `"${value.replace(/"/g, '\\"')}"`;

const buildRelationOrFilter = (field: string, ids: string[]) =>
  ids.map((id) => `${field} = ${quoteFilterValue(id)}`).join(" || ");

async function getFullList(pb: PocketBase, collection: string, options: Record<string, unknown> = {}) {
  return pb.collection(collection).getFullList({
    requestKey: null,
    ...options,
  });
}

async function getSectorChildren(pb: PocketBase, sectorIds: string[]) {
  if (!sectorIds.length) {
    return {
      overviewBySector: new Map<string, any[]>(),
      statsBySector: new Map<string, any[]>(),
      whyInvestBySector: new Map<string, any[]>(),
      advantagesBySector: new Map<string, any[]>(),
    };
  }

  const filter = buildRelationOrFilter("sector", sectorIds);

  const [overviewParagraphs, stats, whyInvestItems, advantages] = await Promise.all([
    getFullList(pb, "sector_overview_paragraphs", { filter, sort: "sortOrder" }),
    getFullList(pb, "sector_stats", { filter, sort: "sortOrder" }),
    getFullList(pb, "sector_why_invest", { filter, sort: "sortOrder" }),
    getFullList(pb, "sector_advantages", { filter, sort: "sortOrder" }),
  ]);

  const toGroupedMap = (records: any[]) =>
    records.reduce((map, record) => {
      const key = record.sector;
      const existing = map.get(key) ?? [];
      existing.push(record);
      map.set(key, existing);
      return map;
    }, new Map<string, any[]>());

  return {
    overviewBySector: toGroupedMap(overviewParagraphs),
    statsBySector: toGroupedMap(stats),
    whyInvestBySector: toGroupedMap(whyInvestItems),
    advantagesBySector: toGroupedMap(advantages),
  };
}

async function getProjectChildren(pb: PocketBase, projectIds: string[]) {
  if (!projectIds.length) {
    return {
      mediaByProject: new Map<string, any[]>(),
      statsByProject: new Map<string, any[]>(),
      highlightsByProject: new Map<string, any[]>(),
      financialsByProject: new Map<string, any[]>(),
    };
  }

  const filter = buildRelationOrFilter("project", projectIds);

  const [media, stats, highlights, financialItems] = await Promise.all([
    getFullList(pb, "project_media", { filter, sort: "sortOrder" }),
    getFullList(pb, "project_stats", { filter, sort: "sortOrder" }),
    getFullList(pb, "project_highlights", { filter, sort: "sortOrder" }),
    getFullList(pb, "project_financial_items", { filter, sort: "sortOrder" }),
  ]);

  const toGroupedMap = (records: any[]) =>
    records.reduce((map, record) => {
      const key = record.project;
      const existing = map.get(key) ?? [];
      existing.push(record);
      map.set(key, existing);
      return map;
    }, new Map<string, any[]>());

  return {
    mediaByProject: toGroupedMap(media),
    statsByProject: toGroupedMap(stats),
    highlightsByProject: toGroupedMap(highlights),
    financialsByProject: toGroupedMap(financialItems),
  };
}

async function hydrateProjects(pb: PocketBase, projects: any[], sectorMap: Map<string, any>) {
  const projectIds = uniqueIds(projects);
  const { mediaByProject, statsByProject, highlightsByProject, financialsByProject } =
    await getProjectChildren(pb, projectIds);

  return projects.map((project) => ({
    id: project.id,
    legacyId: project.legacyId,
    slug: project.slug,
    sectorId: project.sector,
    sortOrder: project.sortOrder ?? 0,
    published: Boolean(project.published),
    type: project.type ?? null,
    title: project.title,
    subTitle: project.subTitle ?? null,
    description: project.description ?? null,
    brochureUrl: project.brochureUrl ?? null,
    moreInfoUrl: project.moreInfoUrl ?? null,
    videoUrl: project.videoUrl ?? null,
    heroVideoUrl: project.heroVideoUrl ?? null,
    sector: sectorMap.get(project.sector),
    media: (mediaByProject.get(project.id) ?? []).map((item: any) => ({
      id: item.id,
      url: item.url,
      altText: item.altText ?? null,
      sortOrder: item.sortOrder ?? 0,
    })),
    stats: (statsByProject.get(project.id) ?? []).map(mapStatItem),
    highlights: (highlightsByProject.get(project.id) ?? []).map(mapValueItem),
    financialItems: (financialsByProject.get(project.id) ?? []).map(mapValueItem),
  }));
}

async function hydrateSectors(pb: PocketBase, sectors: any[], options?: { includeProjects?: boolean }) {
  const sectorIds = uniqueIds(sectors);
  const { overviewBySector, statsBySector, whyInvestBySector, advantagesBySector } =
    await getSectorChildren(pb, sectorIds);

  const baseSectors = sectors.map((sector) => ({
    ...mapSectorBase(sector),
    overviewParagraphs: (overviewBySector.get(sector.id) ?? []).map(mapValueItem),
    stats: (statsBySector.get(sector.id) ?? []).map(mapStatItem),
    whyInvestItems: (whyInvestBySector.get(sector.id) ?? []).map(mapValueItem),
    advantages: (advantagesBySector.get(sector.id) ?? []).map(mapValueItem),
  }));

  if (!options?.includeProjects) {
    return baseSectors;
  }

  const projects = await getFullList(pb, "projects", {
    filter: `(${buildRelationOrFilter("sector", sectorIds)}) && published = true`,
    sort: "sortOrder",
  });
  const sectorMap = createIdMap(baseSectors);
  const hydratedProjects = await hydrateProjects(pb, projects, sectorMap);
  const projectsBySector = hydratedProjects.reduce((map, project) => {
    const existing = map.get(project.sectorId) ?? [];
    existing.push(project);
    map.set(project.sectorId, existing);
    return map;
  }, new Map<string, any[]>());

  return baseSectors.map((sector) => ({
    ...sector,
    projects: projectsBySector.get(sector.id) ?? [],
  }));
}

async function deleteChildren(pb: PocketBase, collection: string, relationField: string, relationId: string) {
  const records = await getFullList(pb, collection, {
    filter: `${relationField} = "${relationId}"`,
  });

  await Promise.all(records.map((record) => pb.collection(collection).delete(record.id, { requestKey: null })));
}

async function replaceSectorChildren(pb: PocketBase, sectorId: string, input: any) {
  await Promise.all([
    deleteChildren(pb, "sector_overview_paragraphs", "sector", sectorId),
    deleteChildren(pb, "sector_stats", "sector", sectorId),
    deleteChildren(pb, "sector_why_invest", "sector", sectorId),
    deleteChildren(pb, "sector_advantages", "sector", sectorId),
  ]);

  await Promise.all([
    ...input.overviewParagraphs.map((value: string, index: number) =>
      pb.collection("sector_overview_paragraphs").create(
        {
          sector: sectorId,
          value,
          sortOrder: index,
        },
        { requestKey: null },
      ),
    ),
    ...input.stats.map((item: any, index: number) =>
      pb.collection("sector_stats").create(
        {
          sector: sectorId,
          label: item.label,
          value: item.value,
          sortOrder: index,
        },
        { requestKey: null },
      ),
    ),
    ...input.whyInvestItems.map((value: string, index: number) =>
      pb.collection("sector_why_invest").create(
        {
          sector: sectorId,
          value,
          sortOrder: index,
        },
        { requestKey: null },
      ),
    ),
    ...input.advantages.map((value: string, index: number) =>
      pb.collection("sector_advantages").create(
        {
          sector: sectorId,
          value,
          sortOrder: index,
        },
        { requestKey: null },
      ),
    ),
  ]);
}

async function replaceProjectChildren(pb: PocketBase, projectId: string, input: any) {
  await Promise.all([
    deleteChildren(pb, "project_media", "project", projectId),
    deleteChildren(pb, "project_stats", "project", projectId),
    deleteChildren(pb, "project_highlights", "project", projectId),
    deleteChildren(pb, "project_financial_items", "project", projectId),
  ]);

  await Promise.all([
    ...input.media.map((item: any, index: number) =>
      pb.collection("project_media").create(
        {
          project: projectId,
          url: item.url,
          altText: asNullable(item.altText),
          sortOrder: index,
        },
        { requestKey: null },
      ),
    ),
    ...input.stats.map((item: any, index: number) =>
      pb.collection("project_stats").create(
        {
          project: projectId,
          label: item.label,
          value: item.value,
          sortOrder: index,
        },
        { requestKey: null },
      ),
    ),
    ...input.highlights.map((value: string, index: number) =>
      pb.collection("project_highlights").create(
        {
          project: projectId,
          value,
          sortOrder: index,
        },
        { requestKey: null },
      ),
    ),
    ...input.financialItems.map((value: string, index: number) =>
      pb.collection("project_financial_items").create(
        {
          project: projectId,
          value,
          sortOrder: index,
        },
        { requestKey: null },
      ),
    ),
  ]);
}

export const pocketbaseRepository = {
  async getPublishedSectors() {
    const pb = await getReadClient();
    const sectors = await getFullList(pb, "sectors", {
      filter: "published = true",
      sort: "sortOrder",
    });
    const hydrated = await hydrateSectors(pb, sectors);
    const projects = await getFullList(pb, "projects", {
      filter: "published = true",
      fields: "id,sector",
    });
    const projectCounts = projects.reduce((map, project) => {
      map.set(project.sector, (map.get(project.sector) ?? 0) + 1);
      return map;
    }, new Map<string, number>());

    return hydrated.map((sector) => ({
      ...sector,
      projects: Array.from({ length: projectCounts.get(sector.id) ?? 0 }, (_, index) => ({
        id: `${sector.id}-${index}`,
      })),
    }));
  },

  async getSectorBySlug(slug: string) {
    const pb = await getReadClient();
    try {
      const sector = await pb.collection("sectors").getFirstListItem(`published = true && slug = "${slug}"`, {
        requestKey: null,
      });
      const [hydratedSector] = await hydrateSectors(pb, [sector], { includeProjects: true });
      return hydratedSector ?? null;
    } catch {
      return null;
    }
  },

  async getProjectBySlugOrLegacyId(value: string) {
    const pb = await getReadClient();

    try {
      const project = await pb.collection("projects").getFirstListItem(
        `published = true && (slug = "${value}" || legacyId = "${value}")`,
        {
          requestKey: null,
        },
      );
      const sector = await pb.collection("sectors").getOne(project.sector, {
        requestKey: null,
      });
      const [hydratedSector] = await hydrateSectors(pb, [sector]);
      const projects = await hydrateProjects(pb, [project], new Map([[hydratedSector.id, hydratedSector]]));
      return projects[0] ?? null;
    } catch {
      return null;
    }
  },

  async getSpeakerContent() {
    const pb = await getReadClient();
    const [settings, sessions, speakers] = await Promise.all([
      pb
        .collection("speaker_section_settings")
        .getFirstListItem(`key = "singleton"`, { requestKey: null })
        .catch(() => null),
      getFullList(pb, "speaker_sessions", { sort: "sortOrder" }),
      getFullList(pb, "speakers", { sort: "sortOrder" }),
    ]);

    const speakersBySession = speakers.reduce((map, speaker) => {
      const existing = map.get(speaker.session) ?? [];
      existing.push({
        id: speaker.id,
        name: speaker.name,
        title: speaker.title ?? null,
        company: speaker.company ?? null,
        imageUrl: speaker.imageUrl ?? null,
        alt: speaker.alt ?? null,
        sortOrder: speaker.sortOrder ?? 0,
      });
      map.set(speaker.session, existing);
      return map;
    }, new Map<string, any[]>());

    return {
      title: settings?.title ?? "Speakers",
      subtitle: settings?.subtitle ?? "",
      sessions: sessions.map((session) => ({
        id: session.id,
        name: session.name,
        sortOrder: session.sortOrder ?? 0,
        speakers: speakersBySession.get(session.id) ?? [],
      })),
    };
  },

  async getAdminDashboardSummary() {
    const pb = await getReadClient();
    const [sectors, projects, sessions, speakers] = await Promise.all([
      getFullList(pb, "sectors", { fields: "id" }),
      getFullList(pb, "projects", { fields: "id" }),
      getFullList(pb, "speaker_sessions", { fields: "id" }),
      getFullList(pb, "speakers", { fields: "id" }),
    ]);

    return {
      sectorCount: sectors.length,
      projectCount: projects.length,
      sessionCount: sessions.length,
      speakerCount: speakers.length,
    };
  },

  async getAllSectorsForAdmin() {
    const pb = await getReadClient();
    const sectors = await getFullList(pb, "sectors", { sort: "sortOrder" });
    const hydrated = await hydrateSectors(pb, sectors);
    const projects = await getFullList(pb, "projects", { fields: "id,sector" });
    const projectCounts = projects.reduce((map, project) => {
      const existing = map.get(project.sector) ?? [];
      existing.push({ id: project.id });
      map.set(project.sector, existing);
      return map;
    }, new Map<string, any[]>());

    return hydrated.map((sector) => ({
      ...sector,
      projects: projectCounts.get(sector.id) ?? [],
    }));
  },

  async getSectorForAdmin(id: string) {
    const pb = await getReadClient();
    try {
      const sector = await pb.collection("sectors").getOne(id, { requestKey: null });
      const [hydrated] = await hydrateSectors(pb, [sector]);

      return {
        id: hydrated.id,
        slug: hydrated.slug,
        sortOrder: hydrated.sortOrder,
        published: hydrated.published,
        name: hydrated.name,
        tagline: hydrated.tagline ?? "",
        heroImageUrl: hydrated.heroImageUrl ?? "",
        imageUrl: hydrated.imageUrl ?? "",
        seoTitle: hydrated.seoTitle ?? "",
        seoDescription: hydrated.seoDescription ?? "",
        ctaTitle: hydrated.ctaTitle ?? "",
        ctaDescription: hydrated.ctaDescription ?? "",
        officerName: hydrated.officerName ?? "",
        officerTitle: hydrated.officerTitle ?? "",
        officerSpecialization: hydrated.officerSpecialization ?? "",
        officerPhone: hydrated.officerPhone ?? "",
        officerEmail: hydrated.officerEmail ?? "",
        officerImageUrl: hydrated.officerImageUrl ?? "",
        consultationLink: hydrated.consultationLink ?? "",
        reportLink: hydrated.reportLink ?? "",
        officerDescription: hydrated.officerDescription ?? "",
        overviewParagraphs: hydrated.overviewParagraphs.map((item: any) => item.value),
        stats: hydrated.stats.map((item: any) => ({ label: item.label, value: item.value })),
        whyInvestItems: hydrated.whyInvestItems.map((item: any) => item.value),
        advantages: hydrated.advantages.map((item: any) => item.value),
      };
    } catch {
      return null;
    }
  },

  async getAllProjectsForAdmin() {
    const pb = await getReadClient();
    const [projects, sectors] = await Promise.all([
      getFullList(pb, "projects", { sort: "sortOrder" }),
      getFullList(pb, "sectors", { sort: "sortOrder" }),
    ]);
    const hydratedSectors = await hydrateSectors(pb, sectors);
    const sectorMap = createIdMap(hydratedSectors);
    const hydratedProjects = await hydrateProjects(pb, projects, sectorMap);

    return hydratedProjects
      .map((project) => ({
        ...project,
        sectorSortOrder: project.sector?.sortOrder ?? 0,
        sector: {
          name: project.sector?.name ?? "",
          slug: project.sector?.slug ?? "",
        },
      }))
      .sort((left, right) => {
        const leftOrder = left.sectorSortOrder ?? 0;
        const rightOrder = right.sectorSortOrder ?? 0;
        return leftOrder - rightOrder || left.sortOrder - right.sortOrder;
      });
  },

  async getProjectForAdmin(id: string) {
    const pb = await getReadClient();

    try {
      const project = await pb.collection("projects").getOne(id, { requestKey: null });
      const [hydrated] = await hydrateProjects(pb, [project], new Map());

      return {
        id: hydrated.id,
        legacyId: hydrated.legacyId,
        slug: hydrated.slug,
        sectorId: hydrated.sectorId,
        sortOrder: hydrated.sortOrder,
        published: hydrated.published,
        type: hydrated.type ?? "",
        title: hydrated.title,
        subTitle: hydrated.subTitle ?? "",
        description: hydrated.description ?? "",
        brochureUrl: hydrated.brochureUrl ?? "",
        moreInfoUrl: hydrated.moreInfoUrl ?? "",
        videoUrl: hydrated.videoUrl ?? "",
        heroVideoUrl: hydrated.heroVideoUrl ?? "",
        media: hydrated.media.map((item: any) => ({ url: item.url, altText: item.altText ?? "" })),
        stats: hydrated.stats.map((item: any) => ({ label: item.label, value: item.value })),
        highlights: hydrated.highlights.map((item: any) => item.value),
        financialItems: hydrated.financialItems.map((item: any) => item.value),
      };
    } catch {
      return null;
    }
  },

  async getSpeakerSettingsForAdmin() {
    const content = await pocketbaseRepository.getSpeakerContent();

    return {
      title: content.title,
      subtitle: content.subtitle ?? "",
      sessions: content.sessions.map((session: any) => ({
        id: session.id,
        name: session.name,
        speakers: session.speakers.map((speaker: any) => ({
          id: speaker.id,
          name: speaker.name,
          title: speaker.title ?? "",
          company: speaker.company ?? "",
          imageUrl: speaker.imageUrl ?? "",
          alt: speaker.alt ?? "",
        })),
      })),
    };
  },

  async getSectorSlugById(id: string) {
    const pb = await getReadClient();
    const sector = await pb.collection("sectors").getOne(id, {
      requestKey: null,
      fields: "slug",
    });
    return sector.slug;
  },

  async findSectorBySlugAny(slug: string) {
    const pb = await getReadClient();
    try {
      const sector = await pb.collection("sectors").getFirstListItem(`slug = "${slug}"`, {
        requestKey: null,
        fields: "slug",
      });
      return { slug: sector.slug };
    } catch {
      return null;
    }
  },

  async findProjectByLegacyIdAny(legacyId: string) {
    const pb = await getReadClient();
    try {
      const project = await pb.collection("projects").getFirstListItem(`legacyId = "${legacyId}"`, {
        requestKey: null,
        fields: "slug",
      });
      return { slug: project.slug };
    } catch {
      return null;
    }
  },

  async saveSector(input: any) {
    const pb = await getWriteClient();
    const payload = {
      slug: input.slug,
      sortOrder: input.sortOrder,
      published: input.published,
      name: input.name,
      tagline: asNullable(input.tagline),
      heroImageUrl: asNullable(input.heroImageUrl),
      imageUrl: asNullable(input.imageUrl),
      seoTitle: asNullable(input.seoTitle),
      seoDescription: asNullable(input.seoDescription),
      ctaTitle: asNullable(input.ctaTitle),
      ctaDescription: asNullable(input.ctaDescription),
      officerName: asNullable(input.officerName),
      officerTitle: asNullable(input.officerTitle),
      officerSpecialization: asNullable(input.officerSpecialization),
      officerPhone: asNullable(input.officerPhone),
      officerEmail: asNullable(input.officerEmail),
      officerImageUrl: asNullable(input.officerImageUrl),
      consultationLink: asNullable(input.consultationLink),
      reportLink: asNullable(input.reportLink),
      officerDescription: asNullable(input.officerDescription),
    };

    const sector = input.id
      ? await pb.collection("sectors").update(input.id, payload, { requestKey: null })
      : await pb.collection("sectors").create(payload, { requestKey: null });

    await replaceSectorChildren(pb, sector.id, input);

    return { id: sector.id };
  },

  async deleteSector(id: string) {
    const pb = await getWriteClient();
    await pb.collection("sectors").delete(id, { requestKey: null });
  },

  async saveProject(input: any) {
    const pb = await getWriteClient();
    const payload = {
      legacyId: input.legacyId,
      slug: input.slug,
      sector: input.sectorId,
      sortOrder: input.sortOrder,
      published: input.published,
      type: asNullable(input.type),
      title: input.title,
      subTitle: asNullable(input.subTitle),
      description: asNullable(input.description),
      brochureUrl: asNullable(input.brochureUrl),
      moreInfoUrl: asNullable(input.moreInfoUrl),
      videoUrl: asNullable(input.videoUrl),
      heroVideoUrl: asNullable(input.heroVideoUrl),
    };

    const [sectorSlug, project] = await Promise.all([
      pocketbaseRepository.getSectorSlugById(input.sectorId),
      input.id
        ? pb.collection("projects").update(input.id, payload, { requestKey: null })
        : pb.collection("projects").create(payload, { requestKey: null }),
    ]);

    await replaceProjectChildren(pb, project.id, input);

    return { id: project.id, sectorSlug };
  },

  async deleteProject(id: string) {
    const pb = await getWriteClient();
    await pb.collection("projects").delete(id, { requestKey: null });
  },

  async saveSpeakerSettings(input: any) {
    const pb = await getWriteClient();
    const existingSettings = await pb
      .collection("speaker_section_settings")
      .getFirstListItem(`key = "singleton"`, { requestKey: null })
      .catch(() => null);

    if (existingSettings) {
      await pb.collection("speaker_section_settings").update(
        existingSettings.id,
        {
          key: "singleton",
          title: input.title,
          subtitle: asNullable(input.subtitle),
        },
        { requestKey: null },
      );
    } else {
      await pb.collection("speaker_section_settings").create(
        {
          key: "singleton",
          title: input.title,
          subtitle: asNullable(input.subtitle),
        },
        { requestKey: null },
      );
    }

    const [speakers, sessions] = await Promise.all([
      getFullList(pb, "speakers", { fields: "id" }),
      getFullList(pb, "speaker_sessions", { fields: "id" }),
    ]);

    await Promise.all([
      ...speakers.map((speaker) => pb.collection("speakers").delete(speaker.id, { requestKey: null })),
      ...sessions.map((session) =>
        pb.collection("speaker_sessions").delete(session.id, { requestKey: null }),
      ),
    ]);

    for (const [sessionIndex, session] of input.sessions.entries()) {
      const createdSession = await pb.collection("speaker_sessions").create(
        {
          name: session.name,
          sortOrder: sessionIndex,
        },
        { requestKey: null },
      );

      for (const [speakerIndex, speaker] of session.speakers.entries()) {
        await pb.collection("speakers").create(
          {
            session: createdSession.id,
            name: speaker.name.trim(),
            title: asNullable(speaker.title),
            company: asNullable(speaker.company),
            imageUrl: asNullable(speaker.imageUrl),
            alt: asNullable(speaker.alt),
            sortOrder: speakerIndex,
          },
          { requestKey: null },
        );
      }
    }
  },

  async upsertMediaAsset(input: MediaAssetUpsertInput) {
    const pb = await getWriteClient();
    const payload = {
      publicUrl: input.publicUrl,
      objectKey: input.objectKey,
      bucket: input.bucket,
      source: input.source,
      altText: input.altText ?? null,
      mimeType: input.mimeType ?? null,
      size: input.size ?? null,
    };

    try {
      const existing = await pb.collection("media_assets").getFirstListItem(
        `publicUrl = "${input.publicUrl}"`,
        {
          requestKey: null,
        },
      );
      return pb.collection("media_assets").update(existing.id, payload, { requestKey: null });
    } catch {
      return pb.collection("media_assets").create(payload, { requestKey: null });
    }
  },

  async listMediaAssets() {
    const pb = await getWriteClient();
    const assets = await getFullList(pb, "media_assets", {
      sort: "created",
      fields: "id,publicUrl",
    });

    return assets.map((asset) => ({
      id: asset.id,
      publicUrl: asset.publicUrl,
    }));
  },
};
