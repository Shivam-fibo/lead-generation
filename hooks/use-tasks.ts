"use client"

import React from "react"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTasksStore } from "@/stores/tasks-store"
import { TaskAssign, tasksApi, type Task } from "@/lib/api"

export function useTasks(userId?: number, goalId?: number) {
  const { tasks, setTasks, updateTask, addTasks } = useTasksStore()
  const queryClient = useQueryClient()

  const { data: tasksData, isLoading, isSuccess, isError } = useQuery({
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

  const createTasksMutation = useMutation({
    mutationFn: (tasks: Partial<Task>) => tasksApi.createTask(tasks),
    onSuccess: (savedTasks) => {
      setTasks([savedTasks])
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })

  const assignTaskMutation = useMutation({
    mutationFn: (taskAssignment: Partial<TaskAssign>) =>
      tasksApi.taskAssign(taskAssignment),
    onSuccess: (assignedTask) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({
        queryKey: ["goalWithId", goalId]
      })
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, task }: { taskId: string; task: Partial<Task> }) =>
      tasksApi.updateTask(taskId, task),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({
        queryKey: ["goalWithId", goalId]
      })
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => tasksApi.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({
        queryKey: ["goalWithId", goalId]
      })
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
    isSuccess,
    isError,
    updateTaskStatus: (taskId: number, status: Task["status"]) => updateTaskStatusMutation.mutate({ taskId, status }),
    createTask: createTasksMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isUpdatingTask: updateTaskMutation.isPending,
    isSavingTasks: createTasksMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending,
    assignTask: assignTaskMutation.mutate,
    isAssigningTask: assignTaskMutation.isPending,
  }
}
