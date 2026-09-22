import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import { DeviseProvider } from "@/lib/context/DeviseContext";

// Une seule famille sans-serif géométrique pour toute l'application
// (titres et corps de texte) — design system "Bento Neutre".
const geist = Geist({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "BudGest — Votre budget, simplifié",
  description: "Gérez votre budget personnel avec clarté : transactions, budgets, objectifs et un assistant IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={geist.variable}>
      <body>
        <NextAuthProvider>
          <ThemeProvider>
            <DeviseProvider>
              {children}
            </DeviseProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}