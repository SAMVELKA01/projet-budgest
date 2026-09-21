import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/User";

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

export default auth(async (req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const isAuth = !!req.auth;
  let role = req.auth?.user?.role;

  const isProtected = protectedRoutes.some((p) => pathname.startsWith(p));
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAdminRoute = pathname.startsWith("/admin");
  const isApiRoute = pathname.startsWith("/api/");
  const isAuthApiRoute = pathname.startsWith("/api/auth/");

  if (isProtected && !isAuth) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Avec la stratégie JWT, un compte désactivé par un admin ou supprimé
  // garde par défaut un token valide jusqu'à son expiration (30 jours) :
  // rien ne relit la base automatiquement à chaque requête. proxy.ts
  // s'exécute lui sur chaque requête protégée (page ou API) : c'est le seul
  // endroit fiable pour revalider contre la base et couper l'accès
  // immédiatement plutôt que d'attendre l'expiration du token.
  if (isAuth && (isProtected || (isApiRoute && !isAuthApiRoute))) {
    await connectDB();
    const dbUser = await User.findById(req.auth!.user.id).select("active role").lean();
    if (!dbUser || !dbUser.active) {
      if (isApiRoute) {
        return NextResponse.json({ error: "Compte désactivé ou introuvable" }, { status: 401 });
      }
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    role = dbUser.role;
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
    "/api/:path*",
  ],
};
