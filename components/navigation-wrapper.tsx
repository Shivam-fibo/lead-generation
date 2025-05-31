"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useGlobalLoading } from "@/components/global-loading-provider"

interface NavigationWrapperProps {
  children: React.ReactNode
}

export function NavigationWrapper({ children }: NavigationWrapperProps) {
  const { setIsLoading } = useGlobalLoading()
  const router = useRouter()

  useEffect(() => {
    // Override router.push to show loading
    const originalPush = router.push
    const originalReplace = router.replace

    router.push = (...args) => {
      setIsLoading(true)
      return originalPush.apply(router, args)
    }

    router.replace = (...args) => {
      setIsLoading(true)
      return originalReplace.apply(router, args)
    }

    return () => {
      router.push = originalPush
      router.replace = originalReplace
    }
  }, [router, setIsLoading])

  return <>{children}</>
}
