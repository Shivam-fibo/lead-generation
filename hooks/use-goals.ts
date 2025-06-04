"use client"

import React from "react"
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from "@tanstack/react-query"
import { useGoalsStore } from "@/stores/goals-store"
import { goalsApi, type Goal } from "@/lib/api"


export const useGoal = (id: string, options?: Partial<UseQueryOptions<Goal, Error>>) => {
  const {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
    isFetched,
    isRefetching 
  } = useQuery({
    queryKey: ["goalWithId", id],
    queryFn: () => goalsApi.getGoalsById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  })

  return {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
    isFetched,
    isRefetching
  }
}

export function useGoals() {
  const { goals, setGoals, addGoal, updateGoal, removeGoal } = useGoalsStore()
  const queryClient = useQueryClient()

  const { data: goalsData, isLoading } = useQuery({
    queryKey: ["goal"],
    queryFn: goalsApi.getGoals,
    staleTime: 5 * 60 * 1000,
  })

  const createGoalMutation = useMutation({
    mutationFn: (goal: Partial<Goal>) => goalsApi.createGoal(goal),
    onSuccess: (newGoal) => {
      // addGoal(newGoal)
      queryClient.invalidateQueries({ queryKey: ["goal"] })
    },
  })

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, goal }: { id: number; goal: Partial<Goal> }) => goalsApi.updateGoal(id, goal),
    onSuccess: (updatedGoal) => {
      updateGoal(updatedGoal.id, updatedGoal)
      queryClient.invalidateQueries({ queryKey: ["goal"] })
    },
  })

  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => goalsApi.deleteGoal(id),
    onSuccess: (_, id) => {
      removeGoal(id)
      queryClient.invalidateQueries({ queryKey: ["goal"] })
    },
  })

  // Update store when query data changes
  React.useEffect(() => {
    if (goalsData) {
      setGoals(goalsData)
    }
  }, [goalsData, setGoals])

  return {
    goals: goals.length > 0 ? goals : goalsData || [],
    isLoading,
    createGoal: createGoalMutation.mutate,
    updateGoal: (id: number, goal: Partial<Goal>) => updateGoalMutation.mutate({ id, goal }),
    deleteGoal: deleteGoalMutation.mutate,
    isCreatingGoal: createGoalMutation.isPending,
    isUpdatingGoal: updateGoalMutation.isPending,
    isDeletingGoal: deleteGoalMutation.isPending,
    // useGoal,
  }
}