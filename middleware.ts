import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { POCKETBASE_AUTH_COOKIE } from "@/lib/pocketbase";

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const isLoginPage = nextUrl.pathname === "/admin/login";
  const hasSession = Boolean(request.cookies.get(POCKETBASE_AUTH_COOKIE)?.value);

  if (!hasSession && !isLoginPage) {
    const loginUrl = new URL("/admin/login", request.url);
    const callbackUrl = `${nextUrl.pathname}${nextUrl.search}`;

    loginUrl.searchParams.set("callbackUrl", callbackUrl);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
