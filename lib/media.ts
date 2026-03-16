import { env } from "@/lib/env";
import { dataRepository } from "@/lib/data/repository";

const normalizeUrl = (value: string) => value.trim();
const normalizePathSegments = (value: string) =>
  value
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

const getMediaBase = () => new URL(env.mediaPublicBaseUrl);

const getMediaBasePathSegments = () => normalizePathSegments(getMediaBase().pathname);

const getPublicMediaPathPrefix = () => {
  const segments = getMediaBasePathSegments();
  const bucket = env.minioBucket?.trim();

  if (bucket && segments[segments.length - 1] !== bucket) {
    segments.push(bucket);
  }

  return segments;
};

const stripMatchingPrefix = (segments: string[], prefix: string[]) => {
  if (prefix.length > segments.length) {
    return segments;
  }

  for (let index = 0; index < prefix.length; index += 1) {
    if (segments[index] !== prefix[index]) {
      return segments;
    }
  }

  return segments.slice(prefix.length);
};

export const MediaSource = {
  EXTERNAL: "EXTERNAL",
  MINIO: "MINIO",
} as const;

export const buildPublicMediaUrl = (objectKey: string) => {
  const keySegments = normalizePathSegments(objectKey);
  const base = getMediaBase();
  const publicPath = [...getPublicMediaPathPrefix(), ...keySegments].join("/");
  const normalizedPath = publicPath ? `/${publicPath}` : "/";

  return new URL(normalizedPath, base.origin).toString();
};

export const getMediaUrlInfo = (url: string) => {
  const normalized = normalizeUrl(url);

  try {
    const mediaBase = getMediaBase();
    const parsed = new URL(normalized);

    if (parsed.host !== mediaBase.host) {
      return {
        publicUrl: normalized,
        objectKey: null,
        source: MediaSource.EXTERNAL,
      };
    }

    let objectPathSegments = normalizePathSegments(parsed.pathname);
    objectPathSegments = stripMatchingPrefix(objectPathSegments, getMediaBasePathSegments());

    const bucket = env.minioBucket?.trim();

    if (bucket && objectPathSegments[0] === bucket) {
      objectPathSegments = objectPathSegments.slice(1);
    }

    return {
      publicUrl: normalized,
      objectKey: objectPathSegments.join("/") || null,
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
