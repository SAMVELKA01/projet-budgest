import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("authjs.session-token") || req.cookies.get("__Secure-authjs.session-token");
  const isAuth = !!token;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");
  const isProtected = ["/dashboard", "/transactions", "/budgets", "/objectifs", "/analytique", "/statistiques", "/categories", "/parametres"].some(p => req.nextUrl.pathname.startsWith(p));

  if (isProtected && !isAuth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

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