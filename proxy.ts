import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";

// Next.js 16 : "middleware" est déprécié au profit de "proxy", qui tourne
// exclusivement sur le runtime Node.js (plus de edge). On peut donc utiliser
// directement `auth()` pour décoder la session (y compris le rôle), au lieu
// de deviner à partir du seul nom du cookie comme le faisait l'ancien
// middleware.ts sur le runtime edge.
const protectedRoutes = [
  "/dashboard",
  "/assistant",
  "/transactions",
  "/budgets",
  "/objectifs",
  "/statistiques",
  "/categories",
  "/parametres",
  "/admin",
];

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const isAuth = !!req.auth;
  const role = req.auth?.user?.role;

  const isProtected = protectedRoutes.some((p) => pathname.startsWith(p));
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAdminRoute = pathname.startsWith("/admin");

  if (isProtected && !isAuth) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && isAuth && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL(role === "admin" ? "/admin" : "/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/assistant/:path*",
    "/transactions/:path*",
    "/budgets/:path*",
    "/objectifs/:path*",
    "/statistiques/:path*",
    "/categories/:path*",
    "/parametres/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
