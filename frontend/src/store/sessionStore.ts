import { create } from "zustand";
import type { Session, Review, ChatMessage } from "@/types";

interface SessionState {
  session: Session | null;
  review: Review | null;
  chatMessages: ChatMessage[];
  isLoading: boolean;
  setSession: (session: Session) => void;
  updateArchitectureMermaid: (mermaid: string) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setReview: (review: Review) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>()((set) => ({
  session: null,
  review: null,
  chatMessages: [],
  isLoading: false,

  setSession: (session) => set({ session }),

  updateArchitectureMermaid: (mermaid) =>
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          architecture: {
            ...state.session.architecture,
            final_mermaid: mermaid,
          },
        },
      };
    }),

  addChatMessage: (msg) =>
    set((state) => ({ chatMessages: [...state.chatMessages, msg] })),

  setReview: (review) => set({ review }),

  setLoading: (loading) => set({ isLoading: loading }),

  reset: () =>
    set({ session: null, review: null, chatMessages: [], isLoading: false }),
}));
