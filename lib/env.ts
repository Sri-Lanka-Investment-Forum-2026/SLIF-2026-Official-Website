import { existsSync } from "node:fs";
import path from "node:path";

const requiredInProduction = (value: string | undefined, key: string) => {
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const defaultSqliteImportPath = path.resolve(process.cwd(), "prisma", "dev.db");
const defaultSqliteImportUrl = `file:${defaultSqliteImportPath}`;
const defaultPocketBaseUrl = "http://127.0.0.1:8090";

const normalizeSqliteDatabaseUrl = (value: string | undefined) => {
  const rawValue = value?.trim();

  if (!rawValue) {
    return defaultSqliteImportUrl;
  }

  if (!rawValue.startsWith("file:")) {
    return rawValue;
  }

  const databasePath = rawValue.slice("file:".length);

  if (!databasePath) {
    return defaultSqliteImportUrl;
  }

  const resolvedCandidates = path.isAbsolute(databasePath)
    ? [databasePath, path.resolve(process.cwd(), databasePath.replace(/^[/\\]+/, ""))]
    : [path.resolve(process.cwd(), databasePath)];

  const existingPath = resolvedCandidates.find((candidate) => existsSync(candidate));

  if (existingPath) {
    return `file:${existingPath}`;
  }

  return rawValue;
};

export const env = {
  sqliteImportUrl: normalizeSqliteDatabaseUrl(process.env.SQLITE_IMPORT_URL),
  pocketbaseUrl: process.env.POCKETBASE_URL ?? defaultPocketBaseUrl,
  pocketbaseSuperuserEmail: process.env.POCKETBASE_SUPERUSER_EMAIL,
  pocketbaseSuperuserPassword: process.env.POCKETBASE_SUPERUSER_PASSWORD,
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
