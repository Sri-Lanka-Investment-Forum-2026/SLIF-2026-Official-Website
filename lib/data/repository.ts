import { pocketbaseRepository } from "@/lib/data/pocketbase-repository";

export type MediaAssetUpsertInput = {
  publicUrl: string;
  objectKey: string | null;
  bucket: string | null;
  source: string;
  altText?: string | null;
  mimeType?: string | null;
  size?: number | null;
};

export type DataRepository = {
  getPublishedSectors: () => Promise<any[]>;
  getSectorBySlug: (slug: string) => Promise<any | null>;
  getProjectBySlugOrLegacyId: (value: string) => Promise<any | null>;
  getSpeakerContent: () => Promise<any>;
  getAdminDashboardSummary: () => Promise<any>;
  getAllSectorsForAdmin: () => Promise<any[]>;
  getSectorForAdmin: (id: string) => Promise<any | null>;
  getAllProjectsForAdmin: () => Promise<any[]>;
  getProjectForAdmin: (id: string) => Promise<any | null>;
  getSpeakerSettingsForAdmin: () => Promise<any>;
  getSectorSlugById: (id: string) => Promise<string>;
  findSectorBySlugAny: (slug: string) => Promise<{ slug: string } | null>;
  findProjectByLegacyIdAny: (legacyId: string) => Promise<{ slug: string } | null>;
  saveSector: (input: any) => Promise<{ id: string }>;
  deleteSector: (id: string) => Promise<void>;
  saveProject: (input: any) => Promise<{ id: string; sectorSlug: string }>;
  deleteProject: (id: string) => Promise<void>;
  saveSpeakerSettings: (input: any) => Promise<void>;
  upsertMediaAsset: (input: MediaAssetUpsertInput) => Promise<any>;
  listMediaAssets: () => Promise<Array<{ id: string; publicUrl: string }>>;
};

export const dataRepository: DataRepository = pocketbaseRepository;
