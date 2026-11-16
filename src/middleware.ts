import { NextResponse, NextRequest } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  // ── Protect all /dashboard/*, /admin/*, /history/*, and /borrow/* routes ───
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/borrow")
  ) {
    if (!session) {
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }

    // Admin-only routes: strictly protect /admin/* and /dashboard/admin
    if (
      (pathname.startsWith("/dashboard/admin") || pathname.startsWith("/admin")) &&
      session.role !== "admin"
    ) {
      const url = new URL("/dashboard/student", request.url);
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }

    // Student-only: prevent admin from accessing student dashboard
    if (pathname.startsWith("/dashboard/student") && session.role !== "siswa") {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/history/:path*",
    "/borrow/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
