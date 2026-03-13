import { redirect } from "next/navigation";

import { auth } from "@/auth";

export const requireAdmin = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return session.user;
};
