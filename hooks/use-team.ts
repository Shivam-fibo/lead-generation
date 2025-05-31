"use client"

import React from "react"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTeamStore } from "@/stores/team-store"
import { teamApi, type TeamMember } from "@/lib/api"

export function useTeam() {
  const { members, setMembers, addMember, updateMember, removeMember } = useTeamStore()
  const queryClient = useQueryClient()

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: teamApi.getTeamMembers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const addMemberMutation = useMutation({
    mutationFn: (member: Omit<TeamMember, "id">) => teamApi.addTeamMember(member),
    onSuccess: (newMember) => {
      addMember(newMember)
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] })
    },
  })

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, member }: { id: number; member: Omit<TeamMember, "id"> }) =>
      teamApi.updateTeamMember(id, member),
    onSuccess: (updatedMember) => {
      updateMember(updatedMember.id, updatedMember)
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] })
    },
  })

  const deleteMemberMutation = useMutation({
    mutationFn: (id: number) => teamApi.deleteTeamMember(id),
    onSuccess: (_, id) => {
      removeMember(id)
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] })
    },
  })

  // Update store when query data changes
  React.useEffect(() => {
    if (teamMembers) {
      setMembers(teamMembers)
    }
  }, [teamMembers, setMembers])

  return {
    members: members.length > 0 ? members : teamMembers || [],
    isLoading,
    addMember: addMemberMutation.mutate,
    updateMember: (id: number, member: Omit<TeamMember, "id">) => updateMemberMutation.mutate({ id, member }),
    deleteMember: deleteMemberMutation.mutate,
    isAddingMember: addMemberMutation.isPending,
    isUpdatingMember: updateMemberMutation.isPending,
    isDeletingMember: deleteMemberMutation.isPending,
  }
}
