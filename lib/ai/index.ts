// Point d'entrée unique de la couche IA. Le reste de l'app importe
// uniquement depuis "@/lib/ai" — jamais directement "@/lib/ai/gemini" —
// pour pouvoir changer de fournisseur (ex. migrer vers Anthropic) en ne
// modifiant que ce fichier et gemini.ts, sans toucher aux routes /api/ai/*.
export { generateText } from "./gemini";
export type { GenerateOptions } from "./gemini";
export { AiNotConfiguredError, AiQuotaExceededError } from "./errors";
