import { post } from "@/lib/api";

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

export function suggestArchitecture(sessionId: string): Promise<SuggestArchitectureResponse> {
  return post(`/sessions/${sessionId}/architecture/suggest`);
}

export function refineArchitecture(
  sessionId: string,
  message: string,
): Promise<RefineArchitectureResponse> {
  return post(`/sessions/${sessionId}/architecture/refine`, { message });
}

export function revertRevision(
  sessionId: string,
  revisionIndex: number,
): Promise<RevertRevisionResponse> {
  return post(`/sessions/${sessionId}/architecture/revert`, { revision_index: revisionIndex });
}

export function submitArchitecture(sessionId: string, userDescription?: string): Promise<void> {
  return post(`/sessions/${sessionId}/architecture/submit`, {
    user_description: userDescription,
  });
}
