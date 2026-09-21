import { GoogleGenAI, ApiError } from "@google/genai";
import { AiNotConfiguredError, AiQuotaExceededError } from "./errors";

const MODEL = "gemini-2.5-flash";

export interface GenerateOptions {
  system?: string;
  /** JSON Schema (subset) pour forcer une réponse structurée plutôt que du texte libre. */
  jsonSchema?: Record<string, unknown>;
  temperature?: number;
}

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new AiNotConfiguredError();
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

/**
 * Couche d'abstraction volontairement minimale (un seul appel, texte in /
 * texte ou JSON out) pour pouvoir remplacer Gemini par un autre fournisseur
 * (ex. Anthropic) plus tard sans toucher à la logique métier des routes
 * /api/ai/*, qui ne dépendent que de cette fonction.
 */
export async function generateText(prompt: string, options: GenerateOptions = {}): Promise<string> {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction: options.system,
        temperature: options.temperature ?? 0.4,
        ...(options.jsonSchema
          ? { responseMimeType: "application/json", responseJsonSchema: options.jsonSchema }
          : {}),
      },
    });
    const text = response.text;
    if (!text) throw new Error("Réponse vide du modèle IA");
    return text;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 429 || err.status === 503)) {
      throw new AiQuotaExceededError();
    }
    throw err;
  }
}
