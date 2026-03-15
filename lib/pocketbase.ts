import PocketBase, { cookieParse } from "pocketbase";
import { cookies } from "next/headers";

import { env } from "@/lib/env";
import type { AdminSession, AdminSessionUser } from "@/lib/admin-session";

export const POCKETBASE_AUTH_COOKIE = "pb_auth";
export const POCKETBASE_ADMIN_COLLECTION = "admins";

const cookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

const isPocketBaseAdminRecord = (record: any) =>
  Boolean(
    record &&
      typeof record === "object" &&
      record.collectionName === POCKETBASE_ADMIN_COLLECTION &&
      typeof record.id === "string" &&
      record.id &&
      record.active !== false,
  );

const toAdminSessionUser = (record: any): AdminSessionUser => ({
  id: record.id,
  email: typeof record.email === "string" ? record.email : null,
  name:
    typeof record.name === "string" && record.name.trim()
      ? record.name
      : typeof record.email === "string"
        ? record.email
        : "Admin",
});

export const createPocketBaseClient = () => {
  const pb = new PocketBase(env.pocketbaseUrl);
  pb.autoCancellation(false);
  return pb;
};

export const createPocketBaseServerClient = async () => {
  const pb = createPocketBaseClient();
  const cookieStore = await cookies();
  pb.authStore.loadFromCookie(cookieStore.toString(), POCKETBASE_AUTH_COOKIE);
  return pb;
};

export const persistPocketBaseAuthCookie = async (pb: PocketBase) => {
  const cookieStore = await cookies();
  const serialized = pb.authStore.exportToCookie(cookieOptions, POCKETBASE_AUTH_COOKIE);
  const parsed = cookieParse(serialized);
  const value = parsed[POCKETBASE_AUTH_COOKIE] ?? "";

  if (!value) {
    cookieStore.set(POCKETBASE_AUTH_COOKIE, "", {
      ...cookieOptions,
      expires: new Date(0),
    });
    return;
  }

  cookieStore.set(POCKETBASE_AUTH_COOKIE, value, cookieOptions);
};

export const clearPocketBaseAuthCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.set(POCKETBASE_AUTH_COOKIE, "", {
    ...cookieOptions,
    expires: new Date(0),
  });
};

export const getPocketBaseAdminSession = async (): Promise<AdminSession | null> => {
  const pb = await createPocketBaseServerClient();
  const authRecord = pb.authStore.record;

  if (!pb.authStore.isValid || !isPocketBaseAdminRecord(authRecord)) {
    return null;
  }

  const adminRecord = authRecord as { id: string };

  try {
    const record = await pb.collection(POCKETBASE_ADMIN_COLLECTION).getOne(adminRecord.id, {
      fields: "id,email,name,active,collectionName",
      requestKey: null,
    });

    if (!isPocketBaseAdminRecord(record)) {
      return null;
    }

    return {
      user: toAdminSessionUser(record),
    };
  } catch {
    return null;
  }
};

export const signInWithPocketBase = async (email: string, password: string) => {
  const pb = createPocketBaseClient();
  const result = await pb.collection(POCKETBASE_ADMIN_COLLECTION).authWithPassword(email, password, {
    requestKey: null,
  });

  if (!isPocketBaseAdminRecord(result.record)) {
    pb.authStore.clear();
    throw new Error("Inactive login credentials.");
  }

  await persistPocketBaseAuthCookie(pb);

  return {
    user: toAdminSessionUser(result.record),
  };
};

export const signOutFromPocketBase = async () => {
  await clearPocketBaseAuthCookie();
};

export const createPocketBaseSuperuserClient = async () => {
  if (!env.pocketbaseSuperuserEmail || !env.pocketbaseSuperuserPassword) {
    throw new Error(
      "POCKETBASE_SUPERUSER_EMAIL and POCKETBASE_SUPERUSER_PASSWORD must be configured.",
    );
  }

  const pb = createPocketBaseClient();
  await pb
    .collection("_superusers")
    .authWithPassword(env.pocketbaseSuperuserEmail, env.pocketbaseSuperuserPassword, {
      requestKey: null,
    });

  return pb;
};
