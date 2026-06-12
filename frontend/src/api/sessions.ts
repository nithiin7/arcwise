import { get, post } from "@/lib/api";

export interface CreateSessionResponse {
  session_id: string;
  problem: string;
  model: string;
  questions: Array<{ question: string; options: string[] }>;
}

export interface SessionSummary {
  id: string;
  problem: string;
  model: string;
  status: "clarifying" | "designing" | "reviewing" | "complete";
  overall_score: number | null;
  created_at: string;
}

export function createSession(
  problem: string,
  model: string,
  apiKey?: string,
): Promise<CreateSessionResponse> {
  return post("/sessions", { problem, model, api_key: apiKey || null });
}

export function submitClarifications(
  sessionId: string,
  answers: string[],
  userScale?: string,
): Promise<void> {
  return post(`/sessions/${sessionId}/clarify`, { answers, user_scale: userScale });
}

export function listSessions(): Promise<SessionSummary[]> {
  return get("/sessions");
}
