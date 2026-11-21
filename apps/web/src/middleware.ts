import { NextRequest, NextResponse } from "next/server";
import { readSessionToken } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/session-cookie";

// This is the fix for the old app's biggest security gap: it had a login
// form, but nothing stopped a browser from skipping it and opening /home
// directly. This middleware runs before any matched page renders and
// bounces anyone without a valid session to /login.
async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await readSessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export default middleware;

// Add new protected pages here as they're built, e.g. "/settings/:path*".
export const config = {
  matcher: ["/dashboard/:path*"],
};
