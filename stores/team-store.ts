import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { TeamMember } from "@/lib/api"

interface TeamState {
  members: TeamMember[]
  isLoading: boolean
  setMembers: (members: TeamMember[]) => void
  addMember: (member: TeamMember) => void
  updateMember: (id: string, member: Partial<TeamMember>) => void 
  removeMember: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useTeamStore = create<TeamState>()(
  devtools(
    (set) => ({
      members: [],
      isLoading: false,
      setMembers: (members) => set({ members }),
      addMember: (member) =>
        set((state) => {
          const updatedMembers = [...state.members, ...(Array.isArray(member) ? member : [member])];
          return {
            members: updatedMembers,
          };
        }),
      updateMember: (id: string, member: Partial<TeamMember>) =>
        set((state) => ({
          members: state.members.map((m) =>
            m._id === id ? { ...m, ...member } : m // Merge the partial update with existing member
          ),
        })),      removeMember: (id: string) =>
        set((state) => ({
          members: state.members.filter((m) => m._id !== id),
        })),
      //     members: state.members.filter((m) => m.id !== id),
      //   })),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "team-store",
    },
  ),
)
