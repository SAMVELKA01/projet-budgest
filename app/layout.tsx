import type { Metadata } from "next";
import { Inter, Manrope, Newsreader, Public_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import { DeviseProvider } from "@/lib/context/DeviseContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
// Polices dédiées à la landing page (identité "banque privée")
const newsreader = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-serif-display" });
const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-grotesk" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-ledger-mono" });

export const metadata: Metadata = {
  title: "BudGest — L'Observatoire de l'Équilibre",
  description: "Gérez votre budget personnel avec précision et clarté.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${manrope.variable} ${newsreader.variable} ${publicSans.variable} ${plexMono.variable}`}>
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