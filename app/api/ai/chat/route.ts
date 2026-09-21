import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";
import { generateText } from "@/lib/ai";
import { aiErrorResponse } from "@/lib/ai/http";
import { getFinancialContextText } from "@/lib/ai/financialContext";

const SYSTEM_PROMPT = `Tu es l'assistant financier de BudGest, une application de gestion de budget personnel.
Réponds en français, de façon brève et concrète (quelques phrases, chiffres à l'appui quand c'est pertinent).
Tu ne dois utiliser QUE les données fournies dans le contexte ci-dessous : n'invente jamais de montant, de catégorie ou de transaction.
Si les données fournies ne permettent pas de répondre à la question, dis-le clairement plutôt que de deviner.
Tu n'as accès qu'aux données de l'utilisateur qui pose la question — ne fais jamais référence à d'autres utilisateurs.`;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { question } = await req.json();
    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ error: "Question requise" }, { status: 400 });
    }
    if (question.length > 500) {
      return NextResponse.json({ error: "Question trop longue (500 caractères max)" }, { status: 400 });
    }

    const context = await getFinancialContextText(session.user.id, 3);

    const answer = await generateText(
      `Contexte financier de l'utilisateur :\n\n${context}\n\nQuestion : ${question.trim()}`,
      { system: SYSTEM_PROMPT },
    );

    return NextResponse.json({ answer });
  } catch (err) {
    return aiErrorResponse(err);
  }
}
