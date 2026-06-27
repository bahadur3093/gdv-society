import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set");
}

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const telegramModel = groq(
  process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
);

export const openrouter = createOpenAI({
  baseURL: "https://ollama.com/v1",
  apiKey: process.env.OLLAMA_API_KEY,
});

export const MODEL =
  process.env.OLLAMA_MODEL ?? "meta-llama/llama-3.3-70b-instruct:free";
