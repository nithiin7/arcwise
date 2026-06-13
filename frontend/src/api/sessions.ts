import { del, get, patch, post } from "@/lib/api";
import type { Session } from "@/types";

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
  tags: string[];
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

export function getSession(sessionId: string): Promise<Session> {
  return get(`/sessions/${sessionId}`);
}

export function listSessions(): Promise<SessionSummary[]> {
  return get("/sessions");
}

export function deleteSession(sessionId: string): Promise<void> {
  return del(`/sessions/${sessionId}`);
}

export function updateSessionTags(
  sessionId: string,
  tags: string[],
): Promise<{ id: string; tags: string[] }> {
  return patch(`/sessions/${sessionId}/tags`, { tags });
}

export function createShareLink(sessionId: string): Promise<{ share_token: string }> {
  return post(`/sessions/${sessionId}/share`);
}

export function getSharedSession(token: string): Promise<Session> {
  return get(`/share/${token}`);
}
