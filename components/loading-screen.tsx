"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Target } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <Card className="w-96">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground animate-pulse">
                <Target className="h-6 w-6" />
              </div>
              <div className="absolute inset-0 rounded-lg bg-primary/20 animate-ping"></div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">PhlexiLeads</h3>
              <p className="text-sm text-muted-foreground">Loading your workspace...</p>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
        <div className="h-4 bg-muted rounded w-96 animate-pulse"></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                <div className="h-8 bg-muted rounded w-16 animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-32 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
              <div className="h-64 bg-muted rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
              <div className="h-64 bg-muted rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function TeamSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded">
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-48 animate-pulse"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-muted rounded w-16 animate-pulse"></div>
                  <div className="h-8 bg-muted rounded w-16 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function TasksSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded w-32 animate-pulse"></div>
        <div className="h-4 bg-muted rounded w-48 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                <div className="h-8 bg-muted rounded w-16 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-muted rounded w-64 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-96 animate-pulse"></div>
                    <div className="h-3 bg-muted rounded w-48 animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-6 bg-muted rounded w-16 animate-pulse"></div>
                    <div className="h-6 bg-muted rounded w-20 animate-pulse"></div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
                  <div className="h-10 bg-muted rounded w-48 animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function GoalsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
        </div>
        <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                <div className="h-8 bg-muted rounded w-16 animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-32 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-6 bg-muted rounded w-64 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-96 animate-pulse"></div>
                  </div>
                  <div className="h-6 bg-muted rounded w-16 animate-pulse"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-muted rounded w-48 animate-pulse"></div>
                  <div className="flex space-x-2">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="h-8 bg-muted rounded w-20 animate-pulse"></div>
                    ))}
                  </div>
                </div>
                <div className="h-2 bg-muted rounded w-full animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function ProgressSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
        <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
                <div className="h-8 bg-muted rounded w-16 animate-pulse"></div>
                <div className="h-2 bg-muted rounded w-full animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-24 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
              <div className="h-64 bg-muted rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
              <div className="h-64 bg-muted rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-8 bg-muted rounded w-16 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded w-full animate-pulse"></div>
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="text-center space-y-1">
                      <div className="h-6 bg-muted rounded w-8 mx-auto animate-pulse"></div>
                      <div className="h-3 bg-muted rounded w-16 mx-auto animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
