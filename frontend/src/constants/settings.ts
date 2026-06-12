import type { Provider } from "@/types";

export const PROVIDERS: Provider[] = [
  {
    label: "Claude (Anthropic)",
    field: "anthropicKey",
    models: "claude-sonnet-4-6, claude-opus-4-8, claude-haiku-4-5",
    docsUrl: "https://console.anthropic.com/settings/keys",
    docsLabel: "console.anthropic.com",
  },
  {
    label: "OpenAI",
    field: "openaiKey",
    models: "gpt-4o, gpt-4o-mini",
    docsUrl: "https://platform.openai.com/api-keys",
    docsLabel: "platform.openai.com/api-keys",
  },
  {
    label: "Google Gemini",
    field: "geminiKey",
    models: "gemini-2.0-flash, gemini-1.5-pro",
    docsUrl: "https://aistudio.google.com/apikey",
    docsLabel: "aistudio.google.com/apikey",
  },
  {
    label: "xAI",
    field: "xaiKey",
    models: "grok-2",
    docsUrl: "https://console.x.ai",
    docsLabel: "console.x.ai",
  },
  {
    label: "Groq",
    field: "groqKey",
    models: "llama-3.3-70b-versatile, mixtral-8x7b",
    docsUrl: "https://console.groq.com/keys",
    docsLabel: "console.groq.com/keys",
  },
];
