"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { LoadingScreen } from "@/components/loading-screen"

interface GlobalLoadingContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const GlobalLoadingContext = createContext<GlobalLoadingContextType>({
  isLoading: false,
  setIsLoading: () => {},
})

export const useGlobalLoading = () => useContext(GlobalLoadingContext)

export function GlobalLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const pathname = usePathname()
  const prevPathnameRef = useRef(pathname)
  const loadingTimeoutRef = useRef<NodeJS.Timeout>()

  // Handle route changes using pathname changes
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      // Route change detected
      setIsNavigating(true)
      setIsLoading(true)

      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }

      // Auto-hide loading after reasonable time
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false)
        setIsNavigating(false)
      }, 2000)

      prevPathnameRef.current = pathname
    }
  }, [pathname])

  // Handle programmatic navigation clicks
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const link = target.closest("a[href]") as HTMLAnchorElement

      if (link && link.href) {
        const url = new URL(link.href)
        const currentUrl = new URL(window.location.href)

        // Check if it's an internal navigation
        if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
          setIsLoading(true)
          setIsNavigating(true)
        }
      }
    }

    // Handle button clicks that might trigger navigation
    const handleButtonClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const button = target.closest("button")

      if (
        button &&
        (button.textContent?.includes("Create") ||
          button.textContent?.includes("Manage") ||
          button.textContent?.includes("View"))
      ) {
        // Small delay to catch router.push calls
        setTimeout(() => {
          setIsLoading(true)
          setIsNavigating(true)
        }, 10)
      }
    }

    document.addEventListener("click", handleClick, true)
    document.addEventListener("click", handleButtonClick, true)

    return () => {
      document.removeEventListener("click", handleClick, true)
      document.removeEventListener("click", handleButtonClick, true)
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [])

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      setIsLoading(true)
      setIsNavigating(true)
    }

    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [])

  // Cleanup loading state
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false)
        setIsNavigating(false)
      }, 3000) // Max 3 seconds

      return () => clearTimeout(timeout)
    }
  }, [isLoading])

  return (
    <GlobalLoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-background">
          <LoadingScreen />
        </div>
      )}
      <div className={isLoading ? "opacity-0 pointer-events-none" : "opacity-100"}>{children}</div>
    </GlobalLoadingContext.Provider>
  )
}
