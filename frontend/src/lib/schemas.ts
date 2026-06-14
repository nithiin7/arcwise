import { z } from "zod";

export const createSessionSchema = z.object({
  problem: z.string().trim().min(1),
});
export type CreateSessionForm = z.infer<typeof createSessionSchema>;

export const clarifyStepSchema = z.object({
  answer: z.string().trim().min(1),
});
export type ClarifyStepForm = z.infer<typeof clarifyStepSchema>;

export const chatMessageSchema = z.object({
  message: z.string().trim().min(1),
});
export type ChatMessageForm = z.infer<typeof chatMessageSchema>;
