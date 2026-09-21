import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Épingle explicitement la racine du workspace : évite que Turbopack ne
  // remonte par erreur jusqu'à un pnpm-lock.yaml sans rapport présent dans
  // le dossier utilisateur parent (projet non lié à Bugest).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
