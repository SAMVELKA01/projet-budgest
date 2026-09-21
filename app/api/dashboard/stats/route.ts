import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/mongoose";
import Transaction from "@/lib/models/Transaction";
import Categorie from "@/lib/models/Categorie";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const monthsParam = parseInt(searchParams.get("months") || "6", 10);
    const monthsCount = [3, 6, 12].includes(monthsParam) ? monthsParam : 6;

    await connectDB();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [thisMoth, lastMonth, recentTransactions, allTransactions, categories] = await Promise.all([
      Transaction.find({
        userId: session.user.id,
        date: { $gte: startOfMonth },
      }),
      Transaction.find({
        userId: session.user.id,
        date: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
      Transaction.find({ userId: session.user.id })
        .sort({ date: -1 })
        .limit(5),
      Transaction.find({ userId: session.user.id }),
      Categorie.find({ userId: session.user.id }),
    ]);

    // Nom à jour de chaque catégorie (source de vérité = Categorie, pas le nom en cache
    // sur la transaction, qui peut être obsolète si la catégorie a été renommée depuis).
    const categoryNameById: Record<string, string> = {};
    categories.forEach((c) => { categoryNameById[c._id.toString()] = c.name; });
    const resolveCategoryName = (t: { categorieId?: unknown; category: string }): string => {
      if (t.categorieId) {
        const name = categoryNameById[String(t.categorieId)];
        if (name) return name;
      }
      return t.category;
    };

    const revenus = thisMoth.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const depenses = thisMoth.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const solde = allTransactions.reduce((s, t) => s + t.amount, 0);

    const revenusLastMonth = lastMonth.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const depensesLastMonth = lastMonth.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

    const depensesByCategory = thisMoth
      .filter(t => t.amount < 0)
      .reduce<Record<string, number>>((acc, t) => {
        const name = resolveCategoryName(t);
        acc[name] = (acc[name] || 0) + Math.abs(t.amount);
        return acc;
      }, {});

    // Dépenses par catégorie sur toute la période sélectionnée (3/6/12 mois),
    // utilisé par la page Analytique — distinct de depensesByCategory (mois en cours),
    // utilisé par le Dashboard.
    const periodStart = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1), 1);
    const periodDepensesByCategory = allTransactions
      .filter(t => t.amount < 0 && new Date(t.date) >= periodStart)
      .reduce<Record<string, number>>((acc, t) => {
        const name = resolveCategoryName(t);
        acc[name] = (acc[name] || 0) + Math.abs(t.amount);
        return acc;
      }, {});


    const monthlyEvolution = Array.from({ length: monthsCount }, (_, i) => {
      const month = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 1) + i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - (monthsCount - 2) + i, 0);
      const monthTransactions = allTransactions.filter(t => {
        const d = new Date(t.date);
        return d >= month && d <= end;
      });
      return {
        month: month.toLocaleDateString("fr-FR", { month: "short" }),
        revenus: monthTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0),
        depenses: monthTransactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0),
      };
    });

    return NextResponse.json({
      solde: Math.round(solde * 100) / 100,
      revenus: Math.round(revenus * 100) / 100,
      depenses: Math.round(depenses * 100) / 100,
      evolutionRevenus: revenusLastMonth > 0 ? Math.round(((revenus - revenusLastMonth) / revenusLastMonth) * 100) : 0,
      evolutionDepenses: depensesLastMonth > 0 ? Math.round(((depenses - depensesLastMonth) / depensesLastMonth) * 100) : 0,
      depensesByCategory,
      periodDepensesByCategory,
      monthlyEvolution,
      recentTransactions,
    });
  } catch (err) {
    console.error("Erreur API dashboard/stats:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}