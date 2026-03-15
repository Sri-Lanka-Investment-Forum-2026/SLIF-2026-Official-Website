import { NextRequest, NextResponse } from "next/server";

import { dataRepository } from "@/lib/data/repository";

export async function GET(request: NextRequest) {
  const legacyId = request.nextUrl.searchParams.get("id");

  if (!legacyId) {
    return NextResponse.redirect(new URL("/projects", request.url), 308);
  }

  const project = await dataRepository.findProjectByLegacyIdAny(legacyId);

  return NextResponse.redirect(
    new URL(project ? `/projects/${project.slug}` : "/projects", request.url),
    308,
  );
}
