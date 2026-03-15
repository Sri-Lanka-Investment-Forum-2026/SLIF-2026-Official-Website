import { redirect } from "next/navigation";

import type { AdminSession } from "@/lib/admin-session";
import { getPocketBaseAdminSession, signInWithPocketBase, signOutFromPocketBase } from "@/lib/pocketbase";

type SignInOptions = {
  email: string;
  password: string;
  redirectTo?: string;
};

type SignOutOptions = {
  redirectTo?: string;
};

const notFoundHandler = async () => new Response("Not Found", { status: 404 });

export const handlers = { GET: notFoundHandler, POST: notFoundHandler };

export async function auth(): Promise<AdminSession | null> {
  return getPocketBaseAdminSession();
}

export async function signIn(provider: string, options: SignInOptions) {
  if (provider !== "credentials") {
    throw new Error(`Unsupported provider: ${provider}`);
  }

  await signInWithPocketBase(options.email, options.password);

  if (options.redirectTo) {
    redirect(options.redirectTo as any);
  }
}

export async function signOut(options?: SignOutOptions) {
  await signOutFromPocketBase();

  if (options?.redirectTo) {
    redirect(options.redirectTo as any);
  }
}
