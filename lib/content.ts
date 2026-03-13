import { cache } from "react";

import { prisma } from "@/lib/prisma";
import type { ProjectInput, SectorInput, SpeakerSettingsInput } from "@/lib/validation";

const sectorInclude = {
  overviewParagraphs: {
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
  stats: {
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
  whyInvestItems: {
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
  advantages: {
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
} as const;

const projectInclude = {
  media: {
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
  stats: {
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
  highlights: {
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
  financialItems: {
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
  sector: {
    include: sectorInclude,
  },
} as const;

export const getPublishedSectors = cache(async () => {
  return prisma.sector.findMany({
    where: {
      published: true,
    },
    include: {
      ...sectorInclude,
      projects: {
        where: {
          published: true,
        },
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
});

export const getSectorBySlug = cache(async (slug: string) => {
  return prisma.sector.findFirst({
    where: {
      published: true,
      slug,
    },
    include: {
      ...sectorInclude,
      projects: {
        where: {
          published: true,
        },
        include: {
          media: {
            orderBy: {
              sortOrder: "asc",
            },
          },
          stats: {
            orderBy: {
              sortOrder: "asc",
            },
          },
          highlights: {
            orderBy: {
              sortOrder: "asc",
            },
          },
          financialItems: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });
});

export const getProjectBySlugOrLegacyId = cache(async (value: string) => {
  return prisma.project.findFirst({
    where: {
      published: true,
      OR: [{ slug: value }, { legacyId: value }],
    },
    include: projectInclude,
  });
});

export const getSpeakerContent = cache(async () => {
  const [settings, sessions] = await Promise.all([
    prisma.speakerSectionSettings.findUnique({
      where: {
        id: "singleton",
      },
    }),
    prisma.speakerSession.findMany({
      include: {
        speakers: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    }),
  ]);

  return {
    title: settings?.title ?? "Speakers",
    subtitle: settings?.subtitle ?? "",
    sessions,
  };
});

export const getAdminDashboardSummary = cache(async () => {
  const [sectorCount, projectCount, sessionCount, speakerCount] = await Promise.all([
    prisma.sector.count(),
    prisma.project.count(),
    prisma.speakerSession.count(),
    prisma.speaker.count(),
  ]);

  return { sectorCount, projectCount, sessionCount, speakerCount };
});

export const getAllSectorsForAdmin = cache(async () => {
  return prisma.sector.findMany({
    include: {
      projects: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
});

export const getSectorForAdmin = cache(async (id: string): Promise<SectorInput | null> => {
  const sector = await prisma.sector.findUnique({
    where: { id },
    include: sectorInclude,
  });

  if (!sector) {
    return null;
  }

  return {
    id: sector.id,
    slug: sector.slug,
    sortOrder: sector.sortOrder,
    published: sector.published,
    name: sector.name,
    tagline: sector.tagline ?? "",
    heroImageUrl: sector.heroImageUrl ?? "",
    imageUrl: sector.imageUrl ?? "",
    seoTitle: sector.seoTitle ?? "",
    seoDescription: sector.seoDescription ?? "",
    ctaTitle: sector.ctaTitle ?? "",
    ctaDescription: sector.ctaDescription ?? "",
    officerName: sector.officerName ?? "",
    officerTitle: sector.officerTitle ?? "",
    officerSpecialization: sector.officerSpecialization ?? "",
    officerPhone: sector.officerPhone ?? "",
    officerEmail: sector.officerEmail ?? "",
    officerImageUrl: sector.officerImageUrl ?? "",
    consultationLink: sector.consultationLink ?? "",
    reportLink: sector.reportLink ?? "",
    officerDescription: sector.officerDescription ?? "",
    overviewParagraphs: sector.overviewParagraphs.map((item) => item.value),
    stats: sector.stats.map((item) => ({ label: item.label, value: item.value })),
    whyInvestItems: sector.whyInvestItems.map((item) => item.value),
    advantages: sector.advantages.map((item) => item.value),
  };
});

export const getAllProjectsForAdmin = cache(async () => {
  return prisma.project.findMany({
    include: {
      sector: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: [{ sector: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });
});

export const getProjectForAdmin = cache(async (id: string): Promise<ProjectInput | null> => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      media: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      stats: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      highlights: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      financialItems: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!project) {
    return null;
  }

  return {
    id: project.id,
    legacyId: project.legacyId,
    slug: project.slug,
    sectorId: project.sectorId,
    sortOrder: project.sortOrder,
    published: project.published,
    type: project.type ?? "",
    title: project.title,
    subTitle: project.subTitle ?? "",
    description: project.description ?? "",
    brochureUrl: project.brochureUrl ?? "",
    moreInfoUrl: project.moreInfoUrl ?? "",
    videoUrl: project.videoUrl ?? "",
    heroVideoUrl: project.heroVideoUrl ?? "",
    media: project.media.map((item) => ({ url: item.url, altText: item.altText ?? "" })),
    stats: project.stats.map((item) => ({ label: item.label, value: item.value })),
    highlights: project.highlights.map((item) => item.value),
    financialItems: project.financialItems.map((item) => item.value),
  };
});

export const getSpeakerSettingsForAdmin = cache(async (): Promise<SpeakerSettingsInput> => {
  const content = await getSpeakerContent();

  return {
    title: content.title,
    subtitle: content.subtitle ?? "",
    sessions: content.sessions.map((session) => ({
      id: session.id,
      name: session.name,
      speakers: session.speakers.map((speaker) => ({
        id: speaker.id,
        name: speaker.name,
        title: speaker.title ?? "",
        company: speaker.company ?? "",
        imageUrl: speaker.imageUrl ?? "",
        alt: speaker.alt ?? "",
      })),
    })),
  };
});
