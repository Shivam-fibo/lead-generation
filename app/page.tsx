"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LoginForm from "@/components/login-form"
import { LoadingScreen } from "@/components/loading-screen"

export default function HomePage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simple check for current user without complex hooks
    const checkUser = () => {
      try {
        const currentUser = localStorage.getItem("currentUser")
        if (currentUser) {
          const userData = JSON.parse(currentUser)
          setUser(userData)
          router.push("/dashboard")
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Error checking user:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(checkUser, 100)
    return () => clearTimeout(timer)
  }, [router])

  if (isLoading) {
    return <LoadingScreen />
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoginForm />
    </div>
  )
}
