import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/lib/context/ThemeContext";
import { DeviseProvider } from "@/lib/context/DeviseContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "BudGest — L'Observatoire de l'Équilibre",
  description: "Gérez votre budget personnel avec précision et clarté.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${manrope.variable}`}>
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