import { NextResponse } from "next/server";
import { AiNotConfiguredError, AiQuotaExceededError } from "./errors";

export function aiErrorResponse(err: unknown) {
  if (err instanceof AiNotConfiguredError) {
    return NextResponse.json(
      { error: "L'assistant IA n'est pas encore configuré. Ajoutez GEMINI_API_KEY dans les variables d'environnement du serveur." },
      { status: 503 },
    );
  }
  if (err instanceof AiQuotaExceededError) {
    return NextResponse.json(
      { error: "Le service IA a atteint sa limite de requêtes gratuites pour le moment. Réessayez dans quelques minutes." },
      { status: 429 },
    );
  }
  console.error("Erreur IA:", err);
  return NextResponse.json({ error: "Erreur du service IA" }, { status: 500 });
}
