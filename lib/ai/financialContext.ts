import { connectDB } from "@/lib/db/mongoose";
import Transaction from "@/lib/models/Transaction";
import Categorie from "@/lib/models/Categorie";
import Budget from "@/lib/models/Budget";

/**
 * Rassemble les données financières d'UN utilisateur (jamais plus — tout ici
 * est filtré par userId) et les met en forme en texte compact pour un
 * prompt IA. Centralise l'accès aux données consommées par /api/ai/*, pour
 * garder la scoping par utilisateur à un seul endroit auditable.
 */
export async function getFinancialContextText(userId: string, months = 3): Promise<string> {
  await connectDB();
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const [transactions, categories, budgets] = await Promise.all([
    Transaction.find({ userId, date: { $gte: start } }).sort({ date: -1 }).limit(400),
    Categorie.find({ userId }),
    Budget.find({ userId, mois: now.getMonth() + 1, annee: now.getFullYear() }),
  ]);

  const categoryNameById = new Map(categories.map((c) => [c._id.toString(), c.name]));
  const resolveCategory = (t: (typeof transactions)[number]) =>
    (t.categorieId && categoryNameById.get(t.categorieId.toString())) || t.category;

  const txLines = transactions.map((t) => {
    const d = new Date(t.date).toISOString().split("T")[0];
    const sign = t.amount >= 0 ? "+" : "-";
    return `${d} | ${resolveCategory(t)} | ${t.name} | ${sign}${Math.abs(t.amount).toFixed(2)}`;
  });

  const budgetLines = budgets.map((b) => `${b.category} | plafond ${b.allocated.toFixed(2)}`);

  return [
    `Transactions des ${months} derniers mois (date | catégorie | description | montant signé) :`,
    txLines.length ? txLines.join("\n") : "(aucune transaction)",
    "",
    "Budgets du mois en cours (catégorie | plafond alloué) :",
    budgetLines.length ? budgetLines.join("\n") : "(aucun budget défini)",
  ].join("\n");
}
