import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/mongoose";
import Transaction from "@/lib/models/Transaction";
import Categorie from "@/lib/models/Categorie";
import Budget from "@/lib/models/Budget";
import { generateText } from "@/lib/ai";
import { aiErrorResponse } from "@/lib/ai/http";

const SYSTEM_PROMPT = `Tu es l'assistant financier de BudGest.
On te donne une liste de faits déjà calculés sur les habitudes de dépense d'un utilisateur (jamais de données brutes à recalculer toi-même).
À partir de CES FAITS UNIQUEMENT, génère 2 à 4 suggestions ou alertes courtes et actionnables, en français, pour aider l'utilisateur à mieux gérer son budget.
Chaque suggestion : un titre court (5 mots max) et un message d'une phrase. N'invente aucun chiffre qui ne soit pas dans les faits fournis.
Réponds en JSON strict conforme au schéma.`;

const INSIGHTS_SCHEMA = {
  type: "object",
  properties: {
    insights: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          message: { type: "string" },
          severity: { type: "string", enum: ["info", "warning", "success"] },
        },
        required: ["title", "message", "severity"],
      },
    },
  },
  required: ["insights"],
};

interface Insight {
  title: string;
  message: string;
  severity: "info" | "warning" | "success";
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();
    const userId = session.user.id;
    const now = new Date();
    const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [thisMonthTx, lastMonthTx, categories, budgets] = await Promise.all([
      Transaction.find({ userId, date: { $gte: startThisMonth } }),
      Transaction.find({ userId, date: { $gte: startLastMonth, $lt: startThisMonth } }),
      Categorie.find({ userId }),
      Budget.find({ userId, mois: now.getMonth() + 1, annee: now.getFullYear() }),
    ]);

    const categoryNameById = new Map(categories.map((c) => [c._id.toString(), c.name]));
    const resolveCategory = (t: (typeof thisMonthTx)[number]) =>
      (t.categorieId && categoryNameById.get(t.categorieId.toString())) || t.category;

    const sumByCategory = (txs: typeof thisMonthTx) => {
      const map = new Map<string, number>();
      for (const t of txs) {
        if (t.amount >= 0) continue;
        const cat = resolveCategory(t);
        map.set(cat, (map.get(cat) || 0) + Math.abs(t.amount));
      }
      return map;
    };

    const thisMonthByCategory = sumByCategory(thisMonthTx);
    const lastMonthByCategory = sumByCategory(lastMonthTx);

    const facts: string[] = [];

    for (const [cat, amount] of thisMonthByCategory) {
      const previous = lastMonthByCategory.get(cat) || 0;
      if (previous > 0) {
        const change = Math.round(((amount - previous) / previous) * 100);
        if (Math.abs(change) >= 25) {
          facts.push(
            `Dépenses en "${cat}" ce mois-ci : ${amount.toFixed(2)} (${change > 0 ? "+" : ""}${change}% vs mois dernier : ${previous.toFixed(2)})`,
          );
        }
      } else if (amount > 0) {
        facts.push(`Nouvelle catégorie de dépense ce mois-ci : "${cat}" (${amount.toFixed(2)}), rien le mois dernier.`);
      }
    }

    for (const b of budgets) {
      const spent = thisMonthByCategory.get(b.category) || 0;
      const pct = b.allocated > 0 ? Math.round((spent / b.allocated) * 100) : 0;
      if (pct >= 100) {
        facts.push(`Budget "${b.category}" dépassé : ${spent.toFixed(2)} dépensés pour un plafond de ${b.allocated.toFixed(2)} (${pct}%).`);
      } else if (pct >= b.alertAt) {
        facts.push(`Budget "${b.category}" proche du plafond : ${pct}% utilisé (${spent.toFixed(2)} / ${b.allocated.toFixed(2)}).`);
      }
    }

    const totalThisMonth = [...thisMonthByCategory.values()].reduce((s, v) => s + v, 0);
    const totalLastMonth = [...lastMonthByCategory.values()].reduce((s, v) => s + v, 0);
    if (totalLastMonth > 0) {
      const change = Math.round(((totalThisMonth - totalLastMonth) / totalLastMonth) * 100);
      facts.push(`Dépenses totales ce mois-ci : ${totalThisMonth.toFixed(2)} (${change > 0 ? "+" : ""}${change}% vs mois dernier : ${totalLastMonth.toFixed(2)})`);
    }

    if (facts.length === 0) {
      return NextResponse.json({
        insights: [
          {
            title: "Pas assez de données",
            message: "Ajoutez quelques transactions et budgets pour recevoir des suggestions personnalisées.",
            severity: "info",
          },
        ] satisfies Insight[],
      });
    }

    const raw = await generateText(`Faits calculés :\n${facts.map((f) => `- ${f}`).join("\n")}`, {
      system: SYSTEM_PROMPT,
      jsonSchema: INSIGHTS_SCHEMA,
    });

    const parsed = JSON.parse(raw) as { insights: Insight[] };
    return NextResponse.json({ insights: parsed.insights });
  } catch (err) {
    return aiErrorResponse(err);
  }
}
