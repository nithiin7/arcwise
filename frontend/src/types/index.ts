export interface ClarificationQA {
  question: string;
  answer: string;
}

export interface Revision {
  user_message: string;
  updated_mermaid: string;
  diff_summary: string;
  timestamp: string;
}

export interface Architecture {
  llm_suggested_mermaid: string;
  llm_explanation: string;
  component_justifications: Record<string, string>;
  scale_assumption: string;
  revisions: Revision[];
  final_mermaid: string;
  user_description?: string;
}

export interface Scores {
  functional_coverage: number;
  nfr_handling: number;
  component_justification: number;
  tradeoff_awareness: number;
  overall: number;
}

export interface Improvement {
  priority: "high" | "medium" | "low";
  gap: string;
  fix: string;
  components: string[];
}

export interface Review {
  scores: Scores;
  feedback: string;
  strengths: string[];
  gaps: string[];
  improvements: Improvement[];
  reference_architecture_note: string;
  scale_verified: boolean;
}

export type SessionStatus = "clarifying" | "designing" | "reviewing" | "complete";

export interface Session {
  id: string;
  problem: string;
  user_scale?: string;
  clarifications: ClarificationQA[];
  architecture: Architecture;
  status: SessionStatus;
  review?: Review;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  diff_summary?: string;
  timestamp: Date;
}
