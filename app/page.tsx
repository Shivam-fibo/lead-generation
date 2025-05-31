"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LoginForm from "@/components/login-form"
import { LoadingScreen } from "@/components/loading-screen"
import { useAuthStore } from "@/stores/auth-store"

export default function HomePage() {
  const { user, isAuthenticated } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (user && isAuthenticated) {
      router.push("/dashboard")
    } 
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => setIsLoading(false), 100)
    return () => clearTimeout(timer)
  }, [router, user, isAuthenticated])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (user) {
    return null 
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoginForm />
    </div>
  )
}
