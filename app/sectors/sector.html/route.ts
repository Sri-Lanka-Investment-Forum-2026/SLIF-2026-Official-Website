import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const sectorSlug = request.nextUrl.searchParams.get("sector")?.toLowerCase();

  if (!sectorSlug) {
    return NextResponse.redirect(new URL("/sectors", request.url), 308);
  }

  const sector = await prisma.sector.findUnique({
    where: {
      slug: sectorSlug,
    },
    select: {
      slug: true,
    },
  });

  return NextResponse.redirect(
    new URL(sector ? `/sectors/${sector.slug}` : "/sectors", request.url),
    308,
  );
}
