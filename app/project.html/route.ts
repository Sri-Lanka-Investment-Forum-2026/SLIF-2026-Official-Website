import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const legacyId = request.nextUrl.searchParams.get("id");

  if (!legacyId) {
    return NextResponse.redirect(new URL("/projects", request.url), 308);
  }

  const project = await prisma.project.findUnique({
    where: {
      legacyId,
    },
    select: {
      slug: true,
    },
  });

  return NextResponse.redirect(
    new URL(project ? `/projects/${project.slug}` : "/projects", request.url),
    308,
  );
}
