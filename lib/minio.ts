import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { env } from "@/lib/env";

let cachedClient: S3Client | null = null;

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

  await client.send(
    new PutObjectCommand({
      Bucket: env.minioBucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
    }),
  );

  return `${env.mediaPublicBaseUrl.replace(/\/$/, "")}/${params.key.replace(/^\/+/, "")}`;
};
