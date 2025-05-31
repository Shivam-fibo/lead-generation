import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { User } from "@/lib/api"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('currentUser') || "null") : null,
      isAuthenticated: typeof window !== 'undefined' && !!localStorage.getItem('authToken'),
      isLoading: true,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken')
          localStorage.removeItem('currentUser')
        }
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },
    }),
    {
      name: "auth-store",
    },
  ),
)
