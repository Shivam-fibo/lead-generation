"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Crosshair, Goal } from "lucide-react"
import Image from "next/image"

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <Card className="w-96">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg  text-primary-foreground animate-pulse">
                {/* <Goal className="h-6 w-6" /> */}
                <Image
                  src="/phlexi-logo.png"
                  alt="Phlexi Logo"
                  width={40}
                  height={40}
                  priority
                  className="rounded-lg"
                />
              </div>
              <div className="absolute inset-0 rounded-lg bg-primary/20 animate-ping"></div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">PhlexiLeads</h3>
              <p className="text-sm text-muted-foreground">Initializing your workspace...</p>
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

export function LeadSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-28 animate-pulse"></div>
        </div>
      </div>

      {/* Leads List Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-muted rounded w-4 animate-pulse"></div>
            <div className="h-10 bg-muted rounded w-64 animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="grid grid-cols-7 gap-4 border-b pb-3 mb-4">
              <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
            </div>

            {/* Table Rows */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-7 gap-4 py-4 ">
                <div className="h-5 bg-muted rounded w-20 animate-pulse"></div>
                <div className="h-5 bg-muted rounded w-28 animate-pulse"></div>
                <div className="h-6 bg-muted rounded w-16 animate-pulse"></div>
                <div className="h-6 bg-muted rounded w-20 animate-pulse"></div>
                <div className="h-6 bg-muted rounded w-16 animate-pulse"></div>
                <div className="h-5 bg-muted rounded w-32 animate-pulse"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-muted rounded w-8 animate-pulse"></div>
                  <div className="h-8 bg-muted rounded w-8 animate-pulse"></div>
                  <div className="h-8 bg-muted rounded w-8 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}