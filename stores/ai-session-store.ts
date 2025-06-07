import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { aiSessionApi } from "@/lib/api"


interface SessionState {
  message: string[];
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
}

export const useSessionStore = create<SessionState>()(
  devtools(
    (set) => ({
      message: [],
      isLoading: false,
      setLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: "assistant-store",
    }
  )
);
