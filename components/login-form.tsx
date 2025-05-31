"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Target } from "lucide-react"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUsers = [
        { id: 1, email: "ceo@company.com", password: "password", role: "CEO", name: "John Smith" },
        { id: 2, email: "admin@company.com", password: "password", role: "Admin", name: "Sarah Johnson" },
        { id: 3, email: "leader@company.com", password: "password", role: "Team Leader", name: "Mike Davis" },
        { id: 4, email: "member@company.com", password: "password", role: "Team Member", name: "Lisa Wilson" },
      ]

      const user = mockUsers.find((u) => u.email === email && u.password === password)
      if (!user) {
        setError("Invalid credentials")
        setIsLoading(false)
        return
      }

      const { password: _, ...userWithoutPassword } = user
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))
      router.push("/dashboard")
    } catch (err) {
      setError("Login failed. Please try again.")
      setIsLoading(false)
    }
  }

  const handleQuickLogin = async (role: string) => {
    setIsLoading(true)
    setError("")

    const credentials = {
      CEO: { email: "ceo@company.com", password: "password" },
      Admin: { email: "admin@company.com", password: "password" },
      "Team Leader": { email: "leader@company.com", password: "password" },
      "Team Member": { email: "member@company.com", password: "password" },
    }

    const cred = credentials[role as keyof typeof credentials]
    if (cred) {
      setEmail(cred.email)
      setPassword(cred.password)

      // Trigger login with these credentials
      const event = { preventDefault: () => {} } as React.FormEvent
      await handleLogin(event)
    }
  }

  return (
    <div className="mx-auto grid w-[350px] gap-6">
      <div className="grid gap-2 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Target className="h-4 w-4" />
          </div>
          <h1 className="text-2xl font-bold">TaskFlow</h1>
        </div>
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="text-balance text-muted-foreground">Enter your email below to login to your account</p>
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

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => handleQuickLogin("CEO")} disabled={isLoading}>
            CEO Demo
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleQuickLogin("Admin")} disabled={isLoading}>
            Admin Demo
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleQuickLogin("Team Leader")} disabled={isLoading}>
            Leader Demo
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleQuickLogin("Team Member")} disabled={isLoading}>
            Member Demo
          </Button>
        </div>
      </div>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </div>

      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Demo Credentials</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>CEO:</strong> ceo@company.com / password
          </p>
          <p>
            <strong>Admin:</strong> admin@company.com / password
          </p>
          <p>
            <strong>Team Leader:</strong> leader@company.com / password
          </p>
          <p>
            <strong>Team Member:</strong> member@company.com / password
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
