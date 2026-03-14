import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const sessionCookieNames = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

const hasSessionCookie = (request: NextRequest) =>
  sessionCookieNames.some((name) => Boolean(request.cookies.get(name)?.value));

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const isLoginPage = nextUrl.pathname === "/admin/login";
  const hasSession = hasSessionCookie(request);

  if (!hasSession && !isLoginPage) {
    const loginUrl = new URL("/admin/login", request.url);
    const callbackUrl = `${nextUrl.pathname}${nextUrl.search}`;

    loginUrl.searchParams.set("callbackUrl", callbackUrl);

    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
