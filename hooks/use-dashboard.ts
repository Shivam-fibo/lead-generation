"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { dashboardApi } from "@/lib/api"

export const useDashboard = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["getDashboardData"],
    queryFn: dashboardApi.getDashboardData,
    staleTime: 5 * 60 * 1000,
  })
  
  return {
    data: data?.data || null,
    isLoading,
    isError,
    error,
    isSuccess,
  }
}
