import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { TeamMember } from "@/lib/api"

interface TeamState {
  members: TeamMember[]
  isLoading: boolean
  setMembers: (members: TeamMember[]) => void
  addMember: (member: TeamMember) => void
  updateMember: (id: number, member: TeamMember) => void
  removeMember: (id: number) => void
  setLoading: (loading: boolean) => void
}

export const useTeamStore = create<TeamState>()(
  devtools(
    (set) => ({
      members: [],
      isLoading: false,
      setMembers: (members) => set({ members }),
      addMember: (member) =>
        set((state) => ({
          members: [...state.members, member],
        })),
      updateMember: (id, member) =>
        set((state) => ({
          members: state.members.map((m) => (m.id === id ? member : m)),
        })),
      removeMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        })),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "team-store",
    },
  ),
)
