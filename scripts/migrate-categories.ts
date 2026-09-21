/**
 * Migration : relie les Transactions et Budgets existants (qui n'avaient
 * qu'un nom de catégorie en texte libre) à de vraies entrées Categorie
 * via categorieId. Crée les catégories manquantes au passage.
 *
 * Usage : pnpm dlx tsx scripts/migrate-categories.ts
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

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function main() {
  loadEnvLocal();

  const { connectDB } = await import("../lib/db/mongoose");
  const { default: Transaction } = await import("../lib/models/Transaction");
  const { default: Budget } = await import("../lib/models/Budget");
  const { default: Categorie } = await import("../lib/models/Categorie");
  const mongooseModule = await import("mongoose");
  const mongoose = mongooseModule.default;

  await connectDB();
  console.log("Connecté à MongoDB.\n");

  interface CategorieLike {
    _id: InstanceType<typeof mongoose.Types.ObjectId>;
    name: string;
  }
  const categorieCache = new Map<string, CategorieLike>();

  async function resolveCategorie(userId: string, rawName: string) {
    const name = (rawName || "Autre").trim();
    const key = `${userId}:${name.toLowerCase()}`;
    if (categorieCache.has(key)) return categorieCache.get(key);

    let cat = await Categorie.findOne({
      userId,
      name: new RegExp(`^${escapeRegex(name)}$`, "i"),
    });

    if (!cat) {
      cat = await Categorie.create({
        userId,
        name,
        icon: "🏷️",
        colorHex: "#64748B",
      });
      console.log(`  + Catégorie créée : "${cat.name}" (user ${userId})`);
    }

    categorieCache.set(key, cat);
    return cat;
  }

  const txs = await Transaction.find({ categorieId: { $exists: false } });
  console.log(`Transactions à migrer : ${txs.length}`);
  let txCount = 0;
  for (const t of txs) {
    const cat = await resolveCategorie(t.userId.toString(), t.category);
    t.categorieId = cat._id;
    t.category = cat.name;
    await t.save();
    txCount++;
  }
  console.log(`✅ ${txCount} transaction(s) migrée(s)\n`);

  const budgets = await Budget.find({ categorieId: { $exists: false } });
  console.log(`Budgets à migrer : ${budgets.length}`);
  let budgetCount = 0;
  for (const b of budgets) {
    const cat = await resolveCategorie(b.userId.toString(), b.category);
    b.categorieId = cat._id;
    b.category = cat.name;
    await b.save();
    budgetCount++;
  }
  console.log(`✅ ${budgetCount} budget(s) migré(s)\n`);

  await mongoose.connection.close();
  console.log("Migration terminée.");
}

main().catch((err) => {
  console.error("Erreur pendant la migration :", err);
  process.exit(1);
});
