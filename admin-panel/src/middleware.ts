import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_PATHS = [
  "/dashboard",
  "/users",
  "/colleges",
  "/communities",
  "/posts",
  "/comments",
  "/attachments",
];

function isAdminPath(pathname: string): boolean {
  return ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/" || pathname === "/login") {
    return NextResponse.next();
  }
  if (isAdminPath(pathname)) {
    const cookie = request.cookies.get("admin_authenticated");
    if (!cookie?.value) {
      const login = new URL("/login", request.url);
      login.searchParams.set("from", pathname);
      return NextResponse.redirect(login);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/dashboard", "/dashboard/:path*", "/users", "/colleges", "/colleges/:path*", "/communities", "/communities/:path*", "/posts", "/posts/:path*", "/comments", "/attachments"],
};
