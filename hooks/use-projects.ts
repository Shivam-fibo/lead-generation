"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { projectsApi } from "@/lib/api"

export const useProjects = (userId?: string) => {
  const {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["getProjects", userId],
    queryFn: () => projectsApi.getProjects(userId!),
    staleTime: 5 * 60 * 1000,
    enabled: !!userId, // Only run the query if userId is provided
  })
  
  return {
    data: data?.data || null,
    isLoading,
    isError,
    error,
    isSuccess,
  }
}