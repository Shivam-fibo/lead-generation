"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function FormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-40" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">
            <Skeleton className="h-4 w-20" />
          </Label>
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            <Skeleton className="h-4 w-20" />
          </Label>
          <Skeleton className="h-24 w-full" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file-upload">
            <Skeleton className="h-4 w-20" />
          </Label>
          <Skeleton className="h-32 w-full" />
        </div>

        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return <label htmlFor={htmlFor}>{children}</label>
}
