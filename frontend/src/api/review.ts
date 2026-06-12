import { post } from "@/lib/api";
import type { Review } from "@/types";

export function reviewDesign(sessionId: string): Promise<Review> {
  return post(`/sessions/${sessionId}/review`);
}
