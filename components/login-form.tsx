"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Target } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const { login, isLoading, loginError: error, user, isAuthenticated } = useAuth()
  
  // Debug current auth state
  useEffect(() => {
    console.log('Current auth state:', { user, isAuthenticated })
   
  }, [user, isAuthenticated])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(
        { username_or_email: email, password },
        {
          onSuccess: (data) => {
            console.log('Login successful:', data)
            if (data) {
              router.push("/dashboard")
            } else {
              console.error('No user data received after login')
            }
          },
          onError: (err) => {
            console.error('Login error:', err)
          },
        }
      )
    } catch (err) {
      console.error('Login error:', err)
    }
  }

  const handleQuickLogin = async (role: string) => {
    const credentials = {
      CEO: { email: "john_phlexi@yopmail.com", password: "john_phlexi" },
      Admin: { email: "admin_phlex1@yopmail.com", password: "admin@1234" },
      "Team Leader": { email: "bean_phlexi@yopmail.com", password: "bean_phlexi" },
      "Team Member": { email: "danny_phlexi@yopmail.com", password: "danny_phlexi" },
    }

    const cred = credentials[role as keyof typeof credentials]
    
    if (cred) {
      try {
        login(
          { username_or_email: cred.email, password: cred.password },
          {
            onSuccess: () => router.push("/dashboard"),
            onError: (err) => console.error(err),
          }
        )
      } catch (err) {
        console.error('Quick login error:', err)
      }
    }
  }

  return (
    <div className="mx-auto grid w-[350px] gap-6">
      <div className="grid gap-2 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Target className="h-4 w-4" />
          </div>
          <h1 className="text-2xl font-bold">PhlexiLeads</h1>
        </div>
        <h1 className="text-3xl font-bold">Login</h1>
        {/* <p className="text-balance text-muted-foreground">Enter your email below to login to your account</p> */}
      </div>
      <div className="grid gap-4">
        <form onSubmit={handleLogin} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                Forgot your password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Login"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        {/* <div className="grid grid-cols-2 gap-2"> */}
        <div className="flex justify-center items-center">
          {/* <Button variant="outline" size="sm" onClick={() => handleQuickLogin("CEO")} disabled={isLoading}>
            CEO Demo
          </Button> */}
          <Button variant="outline" size="sm" onClick={() => handleQuickLogin("Admin")} disabled={isLoading}>
            Quick Login
          </Button>
          {/* <Button variant="outline" size="sm" onClick={() => handleQuickLogin("Team Leader")} disabled={isLoading}>
            Leader Demo
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleQuickLogin("Team Member")} disabled={isLoading}>
            Member Demo
          </Button> */}
        </div>
      </div>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </div>

      {/* <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Demo Credentials</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>CEO:</strong> john_phlexi@yopmail.com / john_phlexi
          </p>
          <p>
            <strong>Admin:</strong> admin_phlex1@yopmail.com / admin@1234
          </p>
          <p>
            <strong>Team Leader:</strong> bean_phlexi@yopmail.com / bean_phlexi
          </p>
          <p>
            <strong>Team Member:</strong> danny_phlexi@yopmail.com / danny_phlexi
          </p>
        </CardContent>
      </Card> */}
    </div>
  )
}
