export const EXAMPLES = [
  "Design WhatsApp",
  "Design Twitter's feed",
  "Design Netflix",
  "Design Uber",
  "Design YouTube",
];

export const MODEL_GROUPS = [
  {
    group: "Claude",
    options: [
      { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
      { value: "claude-opus-4-8", label: "Claude Opus 4.8" },
      { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
    ],
  },
  {
    group: "OpenAI",
    options: [
      { value: "gpt-4o", label: "GPT-4o" },
      { value: "gpt-4o-mini", label: "GPT-4o mini" },
    ],
  },
  {
    group: "Google",
    options: [
      { value: "gemini/gemini-2.0-flash", label: "Gemini 2.0 Flash" },
      { value: "gemini/gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    ],
  },
  {
    group: "xAI",
    options: [{ value: "xai/grok-2", label: "Grok 2" }],
  },
  {
    group: "Groq",
    options: [
      { value: "groq/llama-3.3-70b-versatile", label: "Llama 3.3 70B (Groq)" },
      { value: "groq/mixtral-8x7b-32768", label: "Mixtral 8x7B (Groq)" },
    ],
  },
  {
    group: "Ollama (Local)",
    options: [], // populated dynamically by ModelSelect
  },
];

export const DEFAULT_MODEL = "claude-sonnet-4-6";
