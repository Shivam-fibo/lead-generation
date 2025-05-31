"use client"

import React from "react"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/stores/auth-store"
import { authApi } from "@/lib/api"

export function useAuth() {
  const { user, isAuthenticated, setUser, setLoading, logout: logoutStore } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: authApi.getCurrentUser,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => authApi.login(email, password),
    onSuccess: (user) => {
      setUser(user)
      queryClient.setQueryData(["currentUser"], user)
    },
  })

  const registerMutation = useMutation({
    mutationFn: (userData: Parameters<typeof authApi.register>[0]) => authApi.register(userData),
    onSuccess: (user) => {
      setUser(user)
      queryClient.setQueryData(["currentUser"], user)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logoutStore()
      queryClient.clear()
    },
  })

  // Update store when query data changes
  React.useEffect(() => {
    if (currentUser !== undefined) {
      setUser(currentUser)
    }
  }, [currentUser, setUser])

  return {
    user: user || currentUser,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    loginError: loginMutation.error?.message,
    registerError: registerMutation.error?.message,
    isInitialLoading: isLoading, // Add this to distinguish initial load
  }
}
