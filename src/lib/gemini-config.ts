import { AppError } from "@/lib/errors";

export function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new AppError(
      "GEMINI_API_KEY is not configured. Add it to .env to import Word documents.",
      503,
    );
  }
  return apiKey;
}

export function getGeminiModel() {
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
}
