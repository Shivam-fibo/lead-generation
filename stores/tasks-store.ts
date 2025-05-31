import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { Task } from "@/lib/api"

interface TasksState {
  tasks: Task[]
  isLoading: boolean
  setTasks: (tasks: Task[]) => void
  updateTask: (id: number, task: Partial<Task>) => void
  addTasks: (tasks: Task[]) => void
  setLoading: (loading: boolean) => void
}

export const useTasksStore = create<TasksState>()(
  devtools(
    (set) => ({
      tasks: [],
      isLoading: false,
      setTasks: (tasks) => set({ tasks }),
      updateTask: (id, taskUpdate) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...taskUpdate } : t)),
        })),
      addTasks: (newTasks) =>
        set((state) => ({
          tasks: [...state.tasks, ...newTasks],
        })),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "tasks-store",
    },
  ),
)
