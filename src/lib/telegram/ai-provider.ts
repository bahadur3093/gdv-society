import { createGroq } from "@ai-sdk/groq";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set");
}

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const telegramModel = groq(
  process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
);
