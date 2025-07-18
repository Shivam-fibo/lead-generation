"use client"

import React from "react"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTeamStore } from "@/stores/team-store"
import { teamApi, type TeamMember, type TeamMemberPublic } from "@/lib/api"
import { toast } from "sonner"

export const useTeamMemberList = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["teamMemberList"],
    queryFn: teamApi.getMemberListPublic,
    staleTime: 5 * 60 * 1000,
  })
  return {
    members: data || [],
    isLoading,
    isError,
    error,
    isSuccess,
  }
}

export function useTeam() {
  const { members, setMembers, addMember, updateMember, removeMember } = useTeamStore()
  const queryClient = useQueryClient()

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: teamApi.getTeamMembers,
    staleTime: 5 * 60 * 1000,
  })

  const addMemberMutation = useMutation({
    mutationFn: (member: Omit<TeamMember, "_id">) => teamApi.addTeamMember(member),
    onSuccess: (newMember) => {
      toast.success(`User '${newMember[0].firstName || ""}' created successfully!`)
      // addMember(newMember)
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] })
      queryClient.invalidateQueries({ queryKey: ["teamMemberList"] })
    },
    onError: (error: any) => {
      toast.error('Error creating user', {
        description: error?.message ? error?.message : error,
      })
    }
  })

  const updateMemberMutation = useMutation({
    mutationFn: ({ id, member }: { id: string; member: Partial<TeamMember> }) =>
      teamApi.updateTeamMember(id, member),
    onSuccess: (updatedMember) => {
      toast.success(`User '${updatedMember[0].firstName || ""}' updated successfully!`)
      // updateMember(updatedMember._id, updatedMember)
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] })
      queryClient.invalidateQueries({ queryKey: ["teamMemberList"] })

    },
    onError: (error: any) => {
      toast.error('Error creating user', {
        description: error?.message ? error?.message : error,
      })
    }
  })

  const deleteMemberMutation = useMutation({
    mutationFn: (id: string) => teamApi.deleteTeamMember(id),
    onSuccess: (_, id) => {
      toast.success(`User deleted successfully!`)
      // removeMember(id)
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] })
      queryClient.invalidateQueries({ queryKey: ["teamMemberList"] })

    },
    onError: (error: any) => {
      toast.error('Error deleting user', {
        description: error?.message ? error?.message : error,
      })
    }
  })

  const addMembersCsvMutation = useMutation({
    mutationFn: (members: Omit<TeamMember, "_id">[]) => teamApi.addTeamMembersCsv(members),
    onSuccess: (newMembers) => {
      toast.success(`Users added successfully!`)
      // Add all new members to the store
      // newMembers.forEach(member => addMember(member));
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
    },
    onError: (error: any) => {
      toast.error('Error deleting user', {
        description: error?.message ? error?.message : error,
      })
    }
  });

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
    addMembersCsv: addMembersCsvMutation.mutate,
    updateMember: (id: string, member: Partial<TeamMember>) => updateMemberMutation.mutate({ id, member }),
    deleteMember: deleteMemberMutation.mutate,
    isAddingMember: addMemberMutation.isPending,
    isAddingMembersCsv: addMembersCsvMutation.isPending,
    isUpdatingMember: updateMemberMutation.isPending,
    // isDeletingMember: deleteMemberMutation.isPending,
  }
}
