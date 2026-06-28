export interface ChatModel {
  id: string;
  label: string;
  description: string;
}

export const FREE_OLLAMA_MODELS: ChatModel[] = [
  {
    id: "gpt-oss:20b",
    label: "GPT-OSS 20B",
    description: "Fast, lightweight",
  },
  {
    id: "gpt-oss:120b",
    label: "GPT-OSS 120B",
    description: "Balanced",
  },
  {
    id: "qwen3-coder:480b",
    label: "Qwen3 Coder 480B",
    description: "Code-focused",
  },
  {
    id: "deepseek-v3.1:671b",
    label: "DeepSeek V3.1",
    description: "Strong reasoning",
  },
  {
    id: "kimi-k2:1t",
    label: "Kimi K2 1T",
    description: "Largest, slowest",
  },
];

export const DEFAULT_MODEL_ID = "gpt-oss:120b";

export function isValidModelId(id: string): boolean {
  return FREE_OLLAMA_MODELS.some((m) => m.id === id);
}
