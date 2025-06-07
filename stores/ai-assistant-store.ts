import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { TeamMember } from "@/lib/api"


export const useAssistantStore = create<any>()(
  devtools(
    (set) => ({
      message: [],
      isLoading: false,
      setMessages: (messages) => set({ messages }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "assistant-store",
    },
  ),
)
