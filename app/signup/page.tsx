"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import SignUpForm from "@/components/signup-form"

export default function SignUpPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (user) {
      setIsAuthenticated(true)
      router.push("/dashboard")
    }
  }, [router])

  if (isAuthenticated) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SignUpForm />
    </div>
  )
}
