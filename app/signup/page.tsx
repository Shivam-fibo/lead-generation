"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import SignUpForm from "@/components/signup-form"
import { useAuthStore } from "@/stores/auth-store"

export default function SignUpPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (user && isAuthenticated) {
      router.push("/dashboard")
    }
  }, [router, user, isAuthenticated])

  if (isAuthenticated) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignUpForm />
    </div>
  )
}
