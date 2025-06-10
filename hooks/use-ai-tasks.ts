"use client"

import React from "react"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTasksStore } from "@/stores/tasks-store"
import { TaskAssign, AITasksApi, type Task } from "@/lib/api"

export function useAITasks() {
  const createTasksMutation = useMutation({
    mutationFn: (tasks: Partial<Task>) => AITasksApi.AIcreateTask(tasks)
  })

  const assignTaskMutation = useMutation({
    mutationFn: (taskAssignment: Partial<TaskAssign>) =>
      AITasksApi.AItaskAssign(taskAssignment)
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, task }: { taskId: string; task: Partial<Task> }) =>
      AITasksApi.AIupdateTask(taskId, task)
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => AITasksApi.AIdeleteTask(taskId)
  })

  return {
    createAiTask: createTasksMutation.mutate,
    updateAiTask: updateTaskMutation.mutate,
    deleteAiTask: deleteTaskMutation.mutate,
    isUpdatingAiTask: updateTaskMutation.isPending,
    isSavingAiTasks: createTasksMutation.isPending,
    isDeletingAiTask: deleteTaskMutation.isPending,
    assignAiTask: assignTaskMutation.mutate,
    isAssigningAiTask: assignTaskMutation.isPending,
  }
}
