import { NextRequest, NextResponse } from "next/server";

import { dataRepository } from "@/lib/data/repository";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  if (!env.sectorsPagePublished) {
    return NextResponse.redirect(new URL("/", request.url), 308);
  }

  const sectorSlug = request.nextUrl.searchParams.get("sector")?.toLowerCase();

  if (!sectorSlug) {
    return NextResponse.redirect(new URL("/sectors", request.url), 308);
  }

  const sector = await dataRepository.findSectorBySlugAny(sectorSlug);

  return NextResponse.redirect(
    new URL(sector ? `/sectors/${sector.slug}` : "/sectors", request.url),
    308,
  );
}
