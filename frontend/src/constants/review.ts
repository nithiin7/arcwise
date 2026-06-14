import type { Scores } from "@/types";

export const SCORE_KEYS: { key: keyof Scores; label: string }[] = [
  { key: "functional_coverage", label: "Functional" },
  { key: "nfr_handling", label: "NFR Handling" },
  { key: "component_justification", label: "Component" },
  { key: "tradeoff_awareness", label: "Tradeoffs" },
  { key: "overall", label: "Overall" },
];

export const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  high: { bg: "rgba(239,68,68,0.12)", text: "#ef4444" },
  medium: { bg: "rgba(245,158,11,0.12)", text: "#f59e0b" },
  low: { bg: "rgba(34,197,94,0.12)", text: "#22c55e" },
};
