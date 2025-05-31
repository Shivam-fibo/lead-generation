import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { Goal } from "@/lib/api"

interface GoalsState {
  goals: Goal[]
  isLoading: boolean
  setGoals: (goals: Goal[]) => void
  addGoal: (goal: Goal) => void
  updateGoal: (id: number, goal: Partial<Goal>) => void
  removeGoal: (id: number) => void
  setLoading: (loading: boolean) => void
}

export const useGoalsStore = create<GoalsState>()(
  devtools(
    (set) => ({
      goals: [],
      isLoading: false,
      setGoals: (goals) => set({ goals }),
      addGoal: (goal) =>
        set((state) => ({
          goals: [...state.goals, goal],
        })),
      updateGoal: (id, goalUpdate) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...goalUpdate } : g)),
        })),
      removeGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "goals-store",
    },
  ),
)
