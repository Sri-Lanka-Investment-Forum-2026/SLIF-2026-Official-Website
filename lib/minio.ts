import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { env } from "@/lib/env";

let cachedClient: S3Client | null = null;

type ErrorWithCause = Error & {
  cause?: unknown;
  code?: string;
  Code?: string;
  name?: string;
  $metadata?: {
    httpStatusCode?: number;
    requestId?: string;
    attempts?: number;
    totalRetryDelay?: number;
  };
};

const getStorageErrorChain = (error: unknown) => {
  const chain: ErrorWithCause[] = [];
  let current = error;

  while (current instanceof Error) {
    chain.push(current as ErrorWithCause);
    current = (current as ErrorWithCause).cause;
  }

  return chain;
};

const getStorageErrorCode = (error: unknown) => {
  for (const item of getStorageErrorChain(error)) {
    if (typeof item.code === "string" && item.code) {
      return item.code;
    }

    if (typeof item.Code === "string" && item.Code) {
      return item.Code;
    }
  }

  return null;
};

const getStorageErrorMessage = (error: unknown) => {
  for (const item of getStorageErrorChain(error)) {
    if (typeof item.message === "string" && item.message.trim()) {
      return item.message.trim();
    }
  }

  return "Upload failed.";
};

const getStorageErrorMetadata = (error: unknown) => {
  for (const item of getStorageErrorChain(error)) {
    if (item.$metadata) {
      return item.$metadata;
    }
  }

  return null;
};

const getMinioHost = () => {
  try {
    return env.minioEndpoint ? new URL(env.minioEndpoint).host : null;
  } catch {
    return null;
  }
};

export const formatStorageError = (error: unknown) => {
  const code = getStorageErrorCode(error);
  const message = getStorageErrorMessage(error);
  const metadata = getStorageErrorMetadata(error);
  const minioHost = getMinioHost();

  if (code === "EAI_AGAIN" || code === "ENOTFOUND") {
    return minioHost
      ? `Could not resolve the MinIO host (${minioHost}). Check MINIO_ENDPOINT and server DNS/network access.`
      : "Could not resolve the MinIO host. Check MINIO_ENDPOINT and server DNS/network access.";
  }

  if (code === "ECONNREFUSED") {
    return minioHost
      ? `Could not connect to the MinIO host (${minioHost}). Check that the MinIO endpoint is reachable from this server.`
      : "Could not connect to the MinIO endpoint.";
  }

  if (code === "ETIMEDOUT") {
    return minioHost
      ? `Timed out while connecting to the MinIO host (${minioHost}).`
      : "Timed out while connecting to the MinIO endpoint.";
  }

  if (code === "DEPTH_ZERO_SELF_SIGNED_CERT" || message.toLowerCase().includes("self-signed certificate")) {
    return "The MinIO TLS certificate could not be verified. Check the HTTPS certificate chain for MINIO_ENDPOINT.";
  }

  if (metadata?.httpStatusCode) {
    const requestIdSuffix = metadata.requestId ? ` Request ID: ${metadata.requestId}.` : "";
    return `MinIO upload failed with HTTP ${metadata.httpStatusCode}.${requestIdSuffix}`;
  }

  if (message === "UnknownError" || message === "Unknown: UnknownError") {
    return "MinIO returned an unrecognized response. Check the endpoint, reverse proxy, bucket permissions, and server logs.";
  }

  return message;
};

export const getMinioClient = () => {
  if (cachedClient) {
    return cachedClient;
  }

  if (!env.minioEndpoint || !env.minioAccessKey || !env.minioSecretKey || !env.minioBucket) {
    throw new Error("MinIO is not fully configured.");
  }

  cachedClient = new S3Client({
    region: env.minioRegion,
    endpoint: env.minioEndpoint,
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
    credentials: {
      accessKeyId: env.minioAccessKey,
      secretAccessKey: env.minioSecretKey,
    },
  });

  return cachedClient;
};

export const uploadToMinio = async (params: {
  body: Buffer;
  key: string;
  contentType: string;
}) => {
  const client = getMinioClient();

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: env.minioBucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
        ContentLength: params.body.byteLength,
      }),
    );
  } catch (error) {
    throw new Error(formatStorageError(error), { cause: error });
  }

  return `${env.mediaPublicBaseUrl.replace(/\/$/, "")}/${params.key.replace(/^\/+/, "")}`;
};
