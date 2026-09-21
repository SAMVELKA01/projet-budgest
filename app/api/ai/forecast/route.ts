import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/mongoose";
import Transaction from "@/lib/models/Transaction";
import { generateText } from "@/lib/ai";
import { aiErrorResponse } from "@/lib/ai/http";

const HISTORY_MONTHS = 6;
const PROJECTED_MONTHS = 3;

const SYSTEM_PROMPT = `Tu es l'assistant financier de BudGest.
On te donne un historique mensuel de revenus/dépenses déjà calculé, et une projection déjà calculée par une méthode statistique simple (moyenne mobile).
Écris un court paragraphe en français (3-4 phrases) qui explique cette projection à l'utilisateur en langage clair, et donne éventuellement un conseil.
N'invente aucun chiffre : reformule uniquement ceux fournis. Ne recalcule rien.`;

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    await connectDB();
    const userId = session.user.id;
    const now = new Date();

    const historyStart = new Date(now.getFullYear(), now.getMonth() - (HISTORY_MONTHS - 1), 1);
    const transactions = await Transaction.find({ userId, date: { $gte: historyStart } });

    const monthly = Array.from({ length: HISTORY_MONTHS }, (_, i) => {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - (HISTORY_MONTHS - 1) + i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - (HISTORY_MONTHS - 2) + i, 0);
      const inMonth = transactions.filter((t) => {
        const d = new Date(t.date);
        return d >= monthStart && d <= monthEnd;
      });
      return {
        month: monthStart.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
        revenus: Math.round(inMonth.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0) * 100) / 100,
        depenses: Math.round(inMonth.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0) * 100) / 100,
      };
    });

    // Projection simple par moyenne mobile sur les 3 derniers mois d'historique
    // (déterministe, calculée en code — pas par le modèle IA, pour éviter les
    // montants hallucinés).
    const recentWindow = monthly.slice(-3);
    const avg = (key: "revenus" | "depenses") =>
      recentWindow.reduce((s, m) => s + m[key], 0) / (recentWindow.length || 1);
    const avgRevenus = avg("revenus");
    const avgDepenses = avg("depenses");

    const projected = Array.from({ length: PROJECTED_MONTHS }, (_, i) => {
      const monthStart = new Date(now.getFullYear(), now.getMonth() + 1 + i, 1);
      return {
        month: monthStart.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
        projectedRevenus: Math.round(avgRevenus * 100) / 100,
        projectedDepenses: Math.round(avgDepenses * 100) / 100,
      };
    });

    const hasData = monthly.some((m) => m.revenus > 0 || m.depenses > 0);
    if (!hasData) {
      return NextResponse.json({
        history: monthly,
        projected,
        narrative: "Pas encore assez de transactions pour établir une prévision fiable. Ajoutez vos revenus et dépenses des prochaines semaines pour affiner cette estimation.",
      });
    }

    const narrative = await generateText(
      `Historique mensuel (revenus/dépenses) :\n${monthly.map((m) => `${m.month} : revenus ${m.revenus}, dépenses ${m.depenses}`).join("\n")}\n\n` +
        `Projection sur les ${PROJECTED_MONTHS} prochains mois (moyenne mobile des 3 derniers mois) :\n${projected.map((p) => `${p.month} : revenus estimés ${p.projectedRevenus}, dépenses estimées ${p.projectedDepenses}`).join("\n")}`,
      { system: SYSTEM_PROMPT },
    );

    return NextResponse.json({ history: monthly, projected, narrative });
  } catch (err) {
    return aiErrorResponse(err);
  }
}
