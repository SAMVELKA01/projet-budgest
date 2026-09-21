export class AiNotConfiguredError extends Error {
  constructor() {
    super("GEMINI_API_KEY n'est pas configurée.");
    this.name = "AiNotConfiguredError";
  }
}

export class AiQuotaExceededError extends Error {
  constructor() {
    super("Quota de requêtes IA dépassé.");
    this.name = "AiQuotaExceededError";
  }
}
