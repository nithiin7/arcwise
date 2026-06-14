export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

export interface ClarificationQA {
  question: string;
  answer: string;
  options?: string[];
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

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
}

export interface Session {
  id: string;
  problem: string;
  model: string;
  user_scale?: string;
  clarifications: ClarificationQA[];
  architecture: Architecture;
  status: SessionStatus;
  review?: Review;
  token_usage?: TokenUsage;
  share_token?: string;
  created_at?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  diff_summary?: string;
  timestamp: Date;
}

export interface Provider {
  label: string;
  field: "anthropicKey" | "openaiKey" | "geminiKey" | "xaiKey" | "groqKey";
  models: string;
  docsUrl: string;
  docsLabel: string;
}

export interface ModelOption {
  value: string;
  label: string;
  size?: string;
}

export interface ModelGroup {
  group: string;
  options: ModelOption[];
}

export interface OllamaModel {
  name: string;
  paramSize: string;
}

export interface ModelSelectProps {
  groups: ModelGroup[];
  value: string;
  onChange: (value: string) => void;
  direction?: "up" | "down";
}

export interface ErrorViewProps {
  title?: string;
  message?: string;
  reset?: () => void;
  backHref?: string;
  backLabel?: string;
}

export interface ArchitectureCanvasProps {
  mermaid: string;
  isLoading: boolean;
  scaleAssumption?: string;
  onEditCode?: () => void;
  onExportJson?: () => void;
}

export interface ComponentJustificationsProps {
  justifications: Record<string, string>;
}

export interface RevisionTimelineProps {
  revisions: Revision[];
  onRevert: (index: number) => void;
  onView: (index: number) => void;
  viewingIndex: number | null;
  initialMermaid?: string;
}

export type RevisionEntry = { index: number; label: string; canRevert: boolean };
