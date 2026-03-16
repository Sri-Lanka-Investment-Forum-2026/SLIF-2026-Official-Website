import sharp from "sharp";

const IMAGE_CONTENT_TYPE_PREFIX = "image/";
const MAX_IMAGE_DIMENSION = 2400;
const MAX_IMAGE_PIXELS = 64 * 1000 * 1000;
const WEBP_QUALITY = 82;
const WEBP_ALPHA_QUALITY = 80;
const WEBP_EFFORT = 6;

type PreparedUpload = {
  body: Buffer;
  contentType: string;
  extension: string;
  size: number;
};

const normalizeMimeType = (value: string) => value.trim().toLowerCase();

const getFileExtension = (fileName: string) => {
  const trimmed = fileName.trim().toLowerCase();
  const match = trimmed.match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "";
};

const getAnimatedInputOptions = (mimeType: string) => {
  const normalizedMimeType = normalizeMimeType(mimeType);

  if (normalizedMimeType === "image/gif" || normalizedMimeType === "image/webp") {
    return {
      animated: true,
      limitInputPixels: MAX_IMAGE_PIXELS,
    } as const;
  }

  return {
    limitInputPixels: MAX_IMAGE_PIXELS,
  } as const;
};

export const prepareUploadAsset = async (file: File): Promise<PreparedUpload> => {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = normalizeMimeType(file.type);
  const originalExtension = getFileExtension(file.name);

  if (!mimeType.startsWith(IMAGE_CONTENT_TYPE_PREFIX)) {
    return {
      body: buffer,
      contentType: mimeType || "application/octet-stream",
      extension: originalExtension,
      size: buffer.byteLength,
    };
  }

  try {
    const image = sharp(buffer, getAnimatedInputOptions(mimeType)).rotate();
    const optimized = await image
      .resize({
        width: MAX_IMAGE_DIMENSION,
        height: MAX_IMAGE_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: WEBP_QUALITY,
        alphaQuality: WEBP_ALPHA_QUALITY,
        effort: WEBP_EFFORT,
        smartSubsample: true,
      })
      .toBuffer();

    return {
      body: optimized,
      contentType: "image/webp",
      extension: "webp",
      size: optimized.byteLength,
    };
  } catch (error) {
    console.error("Image optimization failed.", error);
    throw new Error("Failed to optimize the uploaded image.");
  }
};
