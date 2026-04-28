import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // On retourne true pour laisser le middleware.ts gérer les redirections complexes
      return true;
    },
  },
  providers: [],
};