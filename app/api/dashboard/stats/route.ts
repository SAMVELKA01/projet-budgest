import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/mongoose";
import Transaction from "@/lib/models/Transaction";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [thisMoth, lastMonth, recentTransactions, allTransactions] = await Promise.all([
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
    ]);

    const revenus = thisMoth.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const depenses = thisMoth.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const solde = allTransactions.reduce((s, t) => s + t.amount, 0);

    const revenusLastMonth = lastMonth.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const depensesLastMonth = lastMonth.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

    const depensesByCategory = thisMoth
      .filter(t => t.amount < 0)
      .reduce((acc: any, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {});

    const monthlyEvolution = Array.from({ length: 6 }, (_, i) => {
      const month = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - 4 + i, 0);
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
      monthlyEvolution,
      recentTransactions,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}