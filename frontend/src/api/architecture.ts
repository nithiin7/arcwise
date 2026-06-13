import { post, patch } from "@/lib/api";

export interface SuggestArchitectureResponse {
  explanation: string;
  mermaid_dsl: string;
  component_justifications: Record<string, string>;
  scale_assumption: string;
}

export interface RefineArchitectureResponse {
  updated_mermaid: string;
  diff_summary: string;
  revision_index: number;
}

export interface RevertRevisionResponse {
  mermaid: string;
}

export function suggestArchitecture(sessionId: string, diagramDirection?: string): Promise<SuggestArchitectureResponse> {
  return post(`/sessions/${sessionId}/architecture/suggest`, diagramDirection ? { diagram_direction: diagramDirection } : undefined);
}

export function refineArchitecture(
  sessionId: string,
  message: string,
): Promise<RefineArchitectureResponse> {
  return post(`/sessions/${sessionId}/refine`, { message });
}

export function revertRevision(
  sessionId: string,
  revisionIndex: number,
): Promise<RevertRevisionResponse> {
  return post(`/sessions/${sessionId}/refine/revert/${revisionIndex}`);
}

export function updateMermaid(sessionId: string, mermaid: string): Promise<{ ok: boolean }> {
  return patch(`/sessions/${sessionId}/architecture/mermaid`, { mermaid });
}

export function submitArchitecture(sessionId: string, userDescription?: string): Promise<void> {
  return post(`/sessions/${sessionId}/architecture/submit`, {
    user_description: userDescription,
  });
}
