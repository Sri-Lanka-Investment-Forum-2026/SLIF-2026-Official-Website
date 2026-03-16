import { NextResponse } from "next/server";

import { env } from "@/lib/env";

export async function GET(request: Request) {
  return NextResponse.redirect(new URL(env.sectorsPagePublished ? "/sectors" : "/", request.url), 308);
}
