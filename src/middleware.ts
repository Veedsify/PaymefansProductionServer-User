import axios from "axios";
import { NextResponse, type NextRequest } from "next/server";
import { postRegex, profileRegex } from "./constants/regex";

const predefinedInnerRoutes = [
  "/analytics",
  "/chats",
  "/groups",
  "/hookup",
  "/live",
  "/messages",
  "/models",
  "/notifications",
  "/points",
  "/profile",
  "/referrals",
  "/search",
  "/settings",
  "/store",
  "/story",
  "/stream",
  "/subscribe",
  "/transactions",
  "/verification",
  "/wallet",
]

// middleware is applied to all routes, use conditionals to select
export function middleware(req: NextRequest) {
  const cookies = req.cookies;
  const token = cookies.get("token")?.value;
  req.headers.set("Authorization", `Bearer ${token}`);
  const location = req.nextUrl.clone();
  const isPostPage = postRegex.test(location.pathname);
  const isProfilePage = !isPostPage && profileRegex.test(location.pathname);

  const isProtectedRoute = predefinedInnerRoutes.some(route =>
    location.pathname === route || location.pathname.startsWith(route + "/")
  );

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/hookup/:path*",
    "/profile/:path*",
    "/models/:path*",
    "/subscribe/:path*",
    "/settings/:path*",
    "/posts/:path*/new",
    "/posts/:path*/edit/:path*",
    "/verification/:path*",
    "/wallet/:path*",
    "/search/:path*",
    "/notifications/:path*",
    "/messages/:path*",
    "/support/:path*",
    "/terms/:path*",
    "/chats/:path*",
    "/live/:path*",
    "/points/:path*",
    "/story/:path*",
    "/stream/:path*",
    "/analytics/:path*",
    "/referrals/:path*",
    "/transactions/:path*",
    "/store/:path*",
    "/groups/:path*",
  ],
};
