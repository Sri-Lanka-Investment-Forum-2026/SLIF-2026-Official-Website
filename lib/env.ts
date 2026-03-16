const requiredInProduction = (value: string | undefined, key: string) => {
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};
const defaultPocketBaseUrl = "http://127.0.0.1:8090";

const parseBooleanEnv = (value: string | undefined, fallback: boolean) => {
  const normalized = value?.trim().toLowerCase();

  if (normalized === undefined || normalized === "") {
    return fallback;
  }

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
};

export const env = {
  pocketbaseUrl: process.env.POCKETBASE_URL ?? defaultPocketBaseUrl,
  pocketbaseSuperuserEmail: process.env.POCKETBASE_SUPERUSER_EMAIL,
  pocketbaseSuperuserPassword: process.env.POCKETBASE_SUPERUSER_PASSWORD,
  sectorsPagePublished: parseBooleanEnv(process.env.SECTORS_PAGE_PUBLISHED, true),
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
