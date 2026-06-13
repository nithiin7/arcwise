export const EXAMPLES = [
  "Design WhatsApp",
  "Design Twitter's feed",
  "Design Netflix",
  "Design Uber",
  "Design YouTube",
  "Design Slack",
  "Design Dropbox",
  "Design Stripe",
  "Design GitHub",
  "Design Reddit",
];

export const MODEL_GROUPS = [
  {
    group: "Claude",
    options: [
      { value: "claude-fable-5", label: "Claude Fable 5" },
      { value: "claude-opus-4-8", label: "Claude Opus 4.8" },
      { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
      { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
    ],
  },
  {
    group: "OpenAI",
    options: [
      { value: "gpt-5.5", label: "GPT-5.5" },
      { value: "gpt-5.5-pro", label: "GPT-5.5 Pro" },
      { value: "gpt-5.4", label: "GPT-5.4" },
      { value: "gpt-5.4-mini", label: "GPT-5.4 Mini" },
      { value: "gpt-4o", label: "GPT-4o" },
      { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    ],
  },
  {
    group: "Google",
    options: [
      { value: "gemini/gemini-3.5-flash", label: "Gemini 3.5 Flash" },
      { value: "gemini/gemini-3-pro-preview", label: "Gemini 3 Pro" },
      { value: "gemini/gemini-2.0-flash", label: "Gemini 2.0 Flash" },
      { value: "gemini/gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    ],
  },
  {
    group: "xAI",
    options: [
      { value: "xai/grok-4.3", label: "Grok 4.3" },
      { value: "xai/grok-3-beta", label: "Grok 3" },
      { value: "xai/grok-3-mini-beta", label: "Grok 3 Mini" },
    ],
  },
  {
    group: "Groq",
    options: [
      { value: "groq/compound", label: "Groq Compound" },
      { value: "groq/llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
      { value: "groq/deepseek-r1-distill-llama-70b", label: "DeepSeek R1 70B" },
      { value: "groq/llama-3.1-8b-instant", label: "Llama 3.1 8B" },
    ],
  },
  {
    group: "Ollama (Local)",
    options: [], // populated dynamically by ModelSelect
  },
];
