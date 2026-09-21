/**
 * Crée ou promeut le compte administrateur à partir des variables
 * d'environnement ADMIN_EMAIL / ADMIN_PASSWORD. Remplace l'ancien compte
 * admin statique câblé en dur dans lib/auth/options.ts (faille de sécurité :
 * mot de passe en clair dans un commentaire, contournait la base de
 * données). Le rôle admin est désormais un utilisateur normal en base,
 * avec un mot de passe hashé comme les autres.
 *
 * Usage : ADMIN_EMAIL=... ADMIN_PASSWORD=... pnpm dlx tsx scripts/seed-admin.ts
 * (ou définir ADMIN_EMAIL / ADMIN_PASSWORD dans .env.local avant de lancer)
 */
import fs from "node:fs";
import path from "node:path";

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis (dans .env.local ou en variables d'environnement).",
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("ADMIN_PASSWORD doit faire au moins 8 caractères.");
    process.exit(1);
  }

  const { connectDB } = await import("../lib/db/mongoose");
  const { default: User } = await import("../lib/models/User");
  const bcrypt = (await import("bcryptjs")).default;
  const mongoose = (await import("mongoose")).default;

  await connectDB();
  console.log("Connecté à MongoDB.\n");

  const hashed = await bcrypt.hash(password, 12);
  const existing = await User.findOne({ email });

  if (existing) {
    existing.role = "admin";
    existing.active = true;
    existing.password = hashed;
    await existing.save();
    console.log(`✅ Compte existant "${email}" promu administrateur et mot de passe mis à jour.`);
  } else {
    await User.create({
      name: "Administrateur",
      email,
      password: hashed,
      role: "admin",
      devise: "EUR",
    });
    console.log(`✅ Compte administrateur "${email}" créé.`);
  }

  await mongoose.connection.close();
}

main().catch((err) => {
  console.error("Erreur pendant le seed admin :", err);
  process.exit(1);
});
