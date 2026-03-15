import { cache } from "react";

import { dataRepository } from "@/lib/data/repository";

export const getPublishedSectors = cache(async () => dataRepository.getPublishedSectors());

export const getSectorBySlug = cache(async (slug: string) => dataRepository.getSectorBySlug(slug));

export const getProjectBySlugOrLegacyId = cache(async (value: string) =>
  dataRepository.getProjectBySlugOrLegacyId(value),
);

export const getSpeakerContent = cache(async () => dataRepository.getSpeakerContent());

export const getAdminDashboardSummary = cache(async () => dataRepository.getAdminDashboardSummary());

export const getAllSectorsForAdmin = cache(async () => dataRepository.getAllSectorsForAdmin());

export const getSectorForAdmin = cache(async (id: string) => dataRepository.getSectorForAdmin(id));

export const getAllProjectsForAdmin = cache(async () => dataRepository.getAllProjectsForAdmin());

export const getProjectForAdmin = cache(async (id: string) => dataRepository.getProjectForAdmin(id));

export const getSpeakerSettingsForAdmin = cache(async () =>
  dataRepository.getSpeakerSettingsForAdmin(),
);
