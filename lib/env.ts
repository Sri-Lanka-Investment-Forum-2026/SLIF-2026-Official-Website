import path from "node:path";

const requiredInProduction = (value: string | undefined, key: string) => {
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const defaultDatabaseUrl = `file:${path.resolve(process.cwd(), "prisma", "dev.db")}`;

export const env = {
  databaseUrl: process.env.DATABASE_URL ?? defaultDatabaseUrl,
  authSecret: requiredInProduction(process.env.AUTH_SECRET, "AUTH_SECRET") ?? "development-secret",
  mediaPublicBaseUrl:
    process.env.MEDIA_PUBLIC_BASE_URL ?? "https://media.srilankainvestmentforum.com",
  minioEndpoint: process.env.MINIO_ENDPOINT,
  minioRegion: process.env.MINIO_REGION ?? "us-east-1",
  minioBucket: process.env.MINIO_BUCKET,
  minioAccessKey: process.env.MINIO_ACCESS_KEY,
  minioSecretKey: process.env.MINIO_SECRET_KEY,
  initialAdminEmail: process.env.ADMIN_EMAIL,
  initialAdminPassword: process.env.ADMIN_PASSWORD,
  initialAdminName: process.env.ADMIN_NAME ?? "SLIF Admin",
};
