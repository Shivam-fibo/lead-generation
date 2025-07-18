"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { dashboardApi } from "@/lib/api"

interface UseDashboardOptions {
  projectId?: string
  enabled?: boolean
  enabledOnlyWithProject?: boolean
}

export const useDashboard = (options: UseDashboardOptions = {}) => {
  const { 
    projectId, 
    enabled = true, 
    enabledOnlyWithProject = false 
  } = options

  // Determine if the query should be enabled
  const shouldEnable = enabled && (enabledOnlyWithProject ? !!projectId : true)

  const {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch
  } = useQuery({
    queryKey: ["getDashboardData", projectId],
    queryFn: () => dashboardApi.getDashboardData(projectId), // Pass projectId to API
    staleTime: 5 * 60 * 1000,
    enabled: shouldEnable,
  })
  
  return {
    data: data?.data || null,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch
  }
}