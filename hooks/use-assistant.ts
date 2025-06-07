"use client"

import React from "react"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAssistantStore } from "@/stores/ai-assistant-store"
import { aiAssistantApi, teamApi, type TeamMember, type TeamMemberPublic } from "@/lib/api"

export const useAiMessage = () => {
    const {
        data,
        isLoading,
        isError,
        error,
        isSuccess,
    } = useQuery({
        queryKey: ["aiMessage"],
        queryFn: aiAssistantApi.chatWithAI,
        staleTime: 5 * 60 * 1000,
    })

    const createTasksMutation = useMutation({
        mutationFn: (tasks: Partial<any>) => tasksApi.createTask(tasks),
        onSuccess: (savedTasks) => {
            setTasks([savedTasks])
            queryClient.invalidateQueries({ queryKey: ["tasks"] })
        },
    })

    return {
        message: data,
        isLoading,
        isError,
        error,
        isSuccess,
        createMessage: createMessageMutation.mutate,
        isSavingMessage: createMessageMutation.isPending,
    }
}


