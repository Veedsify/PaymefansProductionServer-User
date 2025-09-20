import { type NextRequest, NextResponse } from "next/server";

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
  "/new",
];

// middleware is applied to all routes, use conditionals to select
export function middleware(req: NextRequest) {
  const cookies = req.cookies;
  const token = cookies.get("token")?.value;
  const location = req.nextUrl.clone();

  const isProtectedRoute = predefinedInnerRoutes.some(
    (route) =>
      location.pathname === route || location.pathname.startsWith(route + "/"),
  );

  // Simple token-based protection for protected routes
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If user has token but tries to access login/signup, redirect to home
  // Let the UserContext handle the actual token validation
  if (
    token &&
    (location.pathname === "/login" || location.pathname === "/signup")
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Set the authorization header for downstream requests
  const response = NextResponse.next();
  if (token) {
    response.headers.set("Authorization", `Bearer ${token}`);
  }

  return response;
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
    "/new/:path*",
  ],
};
