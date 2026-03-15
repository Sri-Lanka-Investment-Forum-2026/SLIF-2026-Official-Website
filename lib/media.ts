import { env } from "@/lib/env";
import { dataRepository } from "@/lib/data/repository";

const normalizeUrl = (value: string) => value.trim();

export const MediaSource = {
  EXTERNAL: "EXTERNAL",
  MINIO: "MINIO",
} as const;

export const getMediaUrlInfo = (url: string) => {
  const normalized = normalizeUrl(url);

  try {
    const mediaBase = new URL(env.mediaPublicBaseUrl);
    const parsed = new URL(normalized);

    if (parsed.host !== mediaBase.host) {
      return {
        publicUrl: normalized,
        objectKey: null,
        source: MediaSource.EXTERNAL,
      };
    }

    return {
      publicUrl: normalized,
      objectKey: parsed.pathname.replace(/^\/+/, "") || null,
      source: MediaSource.MINIO,
    };
  } catch {
    return {
      publicUrl: normalized,
      objectKey: null,
      source: MediaSource.EXTERNAL,
    };
  }
};

export const registerMediaUrl = async (
  url?: string | null,
  options?: {
    altText?: string | null;
    mimeType?: string | null;
    size?: number | null;
  },
) => {
  if (!url) {
    return null;
  }

  const info = getMediaUrlInfo(url);

  return dataRepository.upsertMediaAsset({
    publicUrl: info.publicUrl,
    objectKey: info.objectKey,
    bucket: info.source === MediaSource.MINIO ? env.minioBucket ?? null : null,
    source: info.source,
    altText: options?.altText ?? null,
    mimeType: options?.mimeType ?? null,
    size: options?.size ?? null,
  });
};
