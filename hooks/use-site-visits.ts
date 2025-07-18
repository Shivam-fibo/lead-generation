"use client"

import { useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useDashboardStore } from "@/stores/dashboard-store"
import { siteVisitsApi } from "@/lib/api"

export const useSiteVisits = () => {
  const { selectedProjectId } = useDashboardStore()
  const queryClient = useQueryClient()

  // Effect to refetch site visits when project changes
  useEffect(() => {
    if (selectedProjectId) {
      queryClient.invalidateQueries({ queryKey: ["getSiteVisits", selectedProjectId] })
    }
  }, [selectedProjectId, queryClient])

  const {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["getSiteVisits", selectedProjectId],
    queryFn: () => siteVisitsApi.getSiteVisits(selectedProjectId || undefined),
    staleTime: 5 * 60 * 1000,
    enabled: true, // Only fetch when a project is selected
  })
  
  return {
    data: data?.data || null,
    isLoading,
    isError,
    error,
    isSuccess,
  }
}
