import { redirect } from "next/navigation";

import { env } from "@/lib/env";

export default function ProjectsIndexPage() {
  redirect(env.sectorsPagePublished ? "/sectors" : "/");
}
