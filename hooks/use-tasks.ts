"use client"

import React from "react"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTasksStore } from "@/stores/tasks-store"
import { tasksApi, type Task } from "@/lib/api"

export function useTasks(userId?: number, goalId?: number) {
  const { tasks, setTasks, updateTask, addTasks } = useTasksStore()
  const queryClient = useQueryClient()

  const { data: tasksData, isLoading } = useQuery({
    queryKey: userId ? ["tasks", "user", userId] : goalId ? ["tasks", "goal", goalId] : ["tasks"],
    queryFn: () => {
      if (userId) return tasksApi.getTasksByUser(userId)
      if (goalId) return tasksApi.getTasksByGoal(goalId)
      return tasksApi.getTasks()
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: Task["status"] }) =>
      tasksApi.updateTaskStatus(taskId, status),
    onSuccess: (updatedTask) => {
      updateTask(updatedTask.id, updatedTask)
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })

  const saveTasksMutation = useMutation({
    mutationFn: (tasks: Task[]) => tasksApi.saveTasks(tasks),
    onSuccess: (savedTasks) => {
      setTasks(savedTasks)
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })

  // Update store when query data changes
  React.useEffect(() => {
    if (tasksData) {
      setTasks(tasksData)
    }
  }, [tasksData, setTasks])

  return {
    tasks: tasksData || tasks,
    isLoading,
    updateTaskStatus: (taskId: number, status: Task["status"]) => updateTaskStatusMutation.mutate({ taskId, status }),
    saveTasks: saveTasksMutation.mutate,
    isUpdatingTask: updateTaskStatusMutation.isPending,
    isSavingTasks: saveTasksMutation.isPending,
  }
}
