import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("authjs.session-token") ||
    req.cookies.get("__Secure-authjs.session-token") ||
    req.cookies.get("next-auth.session-token");

  const isAuth = !!token;
  const pathname = req.nextUrl.pathname;

  // Liste des routes protégées
  const protectedRoutes = [
    "/dashboard",
    "/transactions",
    "/budgets",
    "/objectifs",
    "/analytique",
    "/statistiques",
    "/categories",
    "/parametres"
  ];

  const isProtected = protectedRoutes.some(p => pathname.startsWith(p));
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // 1. Si on accède à une route protégée sans être connecté -> Login
  if (isProtected && !isAuth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. Si on est connecté et qu'on tente d'accéder aux pages /login ou /register -> Dashboard
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Dans tous les autres cas (notamment si on est déconnecté et qu'on veut aller sur /login) -> Suivant
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/budgets/:path*",
    "/objectifs/:path*",
    "/analytique/:path*",
    "/statistiques/:path*",
    "/categories/:path*",
    "/parametres/:path*",
    "/login",
    "/register",
  ],
};