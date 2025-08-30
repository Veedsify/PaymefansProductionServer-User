import axios from "axios";
import { NextResponse, type NextRequest } from "next/server";
import { postRegex, profileRegex } from "./constants/regex";

// middleware is applied to all routes, use conditionals to select
export function middleware(req: NextRequest) {
  const cookies = req.cookies;
  const token = cookies.get("token")?.value;
  req.headers.set("Authorization", `Bearer ${token}`);
  const location = req.nextUrl.clone();
  const isPostPage = postRegex.test(location.pathname);
  const isProfilePage = !isPostPage && profileRegex.test(location.pathname);
  if (!token && !isProfilePage && !isPostPage) {
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
    "/:path*",
    "/posts/:path*",
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
  ],
};
