"use client"

import type React from "react"

import { useEffect } from "react"
import { useGlobalLoading } from "@/components/global-loading-provider"

interface PageWrapperProps {
  children: React.ReactNode
  loadingDelay?: number
}

export function PageWrapper({ children, loadingDelay = 200 }: PageWrapperProps) {
  const { setIsLoading } = useGlobalLoading()

  useEffect(() => {
    // Hide loading when page is ready
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, loadingDelay)

    return () => clearTimeout(timer)
  }, [setIsLoading, loadingDelay])

  return <>{children}</>
}
