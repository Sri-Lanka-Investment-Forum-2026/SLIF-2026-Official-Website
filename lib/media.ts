import { MediaSource } from "@prisma/client";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const normalizeUrl = (value: string) => value.trim();

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

  return prisma.mediaAsset.upsert({
    where: {
      publicUrl: info.publicUrl,
    },
    update: {
      objectKey: info.objectKey,
      source: info.source,
      bucket: info.source === MediaSource.MINIO ? env.minioBucket ?? null : null,
      altText: options?.altText ?? undefined,
      mimeType: options?.mimeType ?? undefined,
      size: options?.size ?? undefined,
    },
    create: {
      publicUrl: info.publicUrl,
      objectKey: info.objectKey,
      bucket: info.source === MediaSource.MINIO ? env.minioBucket ?? null : null,
      source: info.source,
      altText: options?.altText ?? null,
      mimeType: options?.mimeType ?? null,
      size: options?.size ?? null,
    },
  });
};
