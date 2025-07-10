"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { siteVisitsApi } from "@/lib/api"

export const useSiteVisits = () => {
  const {
    data,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["getSiteVisits"],
    queryFn: siteVisitsApi.getSiteVisits,
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
