"use client"

import React from "react"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useGoalsStore } from "@/stores/goals-store"
import { goalsApi, type Goal } from "@/lib/api"

export function useGoals() {
  const { goals, setGoals, addGoal, updateGoal, removeGoal } = useGoalsStore()
  const queryClient = useQueryClient()

  const { data: goalsData, isLoading } = useQuery({
    queryKey: ["goals"],
    queryFn: goalsApi.getGoals,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const createGoalMutation = useMutation({
    mutationFn: (goal: Omit<Goal, "id">) => goalsApi.createGoal(goal),
    onSuccess: (newGoal) => {
      addGoal(newGoal)
      queryClient.invalidateQueries({ queryKey: ["goals"] })
    },
  })

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, goal }: { id: number; goal: Partial<Goal> }) => goalsApi.updateGoal(id, goal),
    onSuccess: (updatedGoal) => {
      updateGoal(updatedGoal.id, updatedGoal)
      queryClient.invalidateQueries({ queryKey: ["goals"] })
    },
  })

  const deleteGoalMutation = useMutation({
    mutationFn: (id: number) => goalsApi.deleteGoal(id),
    onSuccess: (_, id) => {
      removeGoal(id)
      queryClient.invalidateQueries({ queryKey: ["goals"] })
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
  }
}
