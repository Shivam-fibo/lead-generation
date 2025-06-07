"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { PageWrapper } from "@/components/page-wrapper"
import { DashboardSkeleton } from "@/components/loading-screen"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Target, FileText, BarChart3, TrendingUp, Activity, Bot, Sparkles } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis } from "recharts"
import { useAuthStore } from "@/stores/auth-store"

interface User {
  id: number
  email: string
  role: string
  name: string
}

// Mock data for charts
const chartData = [
  { month: "Jan", completed: 12, assigned: 20 },
  { month: "Feb", completed: 18, assigned: 25 },
  { month: "Mar", completed: 22, assigned: 30 },
  { month: "Apr", completed: 28, assigned: 35 },
  { month: "May", completed: 32, assigned: 40 },
  { month: "Jun", completed: 38, assigned: 45 },
]

const activityData = [
  { day: "Mon", tasks: 12 },
  { day: "Tue", tasks: 19 },
  { day: "Wed", tasks: 15 },
  { day: "Thu", tasks: 25 },
  { day: "Fri", tasks: 22 },
  { day: "Sat", tasks: 8 },
  { day: "Sun", tasks: 5 },
]

const chartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
  assigned: {
    label: "Assigned",
    color: "hsl(var(--chart-2))",
  },
  tasks: {
    label: "Tasks",
    color: "hsl(var(--chart-3))",
  },
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [isPageLoading, setIsPageLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }
  
  }, [router, user])

  if (!user) {
    return null
  }

  const canManageTeam = user.roles[0].name === "Admin"
  const canCreateGoals = user.roles[0].name === "CEO" || user.roles[0].name === "Admin"
  const userRole = user.roles[0].name
  const canUseAI = userRole === "CEO" || userRole === "Admin" || userRole === "Team Leader"

  return (
    <PageWrapper>
      <DashboardLayout>
        {isPageLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.first_name}</h1>
              <p className="text-muted-foreground">Here's what's happening with your team today.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+2 from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">Across 4 departments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">84%</div>
                  <p className="text-xs text-muted-foreground">+5% from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Task Completion Overview</CardTitle>
                  <CardDescription>Monthly task completion vs assignment trends</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ChartContainer config={chartConfig}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="completed" fill="var(--color-completed)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="assigned" fill="var(--color-assigned)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Weekly Activity</CardTitle>
                  <CardDescription>Tasks completed this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig}>
                    <LineChart data={activityData}>
                      <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="tasks"
                        stroke="var(--color-tasks)"
                        strokeWidth={2}
                        dot={{ fill: "var(--color-tasks)" }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div> */}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">

              {canUseAI && (
                <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bot className="h-5 w-5 text-primary" />
                      <span>AI Assistant</span>
                      <Sparkles className="h-4 w-4 text-primary" />
                    </CardTitle>
                    <CardDescription>
                      Chat with AI to create goals, delegate tasks, and manage projects intelligently
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => router.push("/ai-assistant")} className="w-full">
                      <Bot className="mr-2 h-4 w-4" />
                      Open AI Assistant
                    </Button>
                  </CardContent>
                </Card>
              )}

              {canCreateGoals && (
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Goal</CardTitle>
                    <CardDescription>Input a high-level goal and let AI delegate tasks to your team</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => router.push("/goals/create")} className="w-full">
                      Create Goal
                    </Button>
                  </CardContent>
                </Card>
              )}

              {canManageTeam && (
                <Card>
                  <CardHeader>
                    <CardTitle>Team Management</CardTitle>
                    <CardDescription>Manage team members, roles, and skill assignments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => router.push("/team")} className="w-full">
                      Manage Team
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates from your team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="text-sm">
                      <span className="font-medium">Sarah Johnson</span> completed "Q4 Budget Review"
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="text-sm">
                      <span className="font-medium">Mike Davis</span> started "Product Launch Planning"
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="text-sm">
                      <span className="font-medium">Lisa Wilson</span> updated task status
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks for your role</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Activity className="mr-2 h-4 w-4" />
                    View All Tasks
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Team Performance
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DashboardLayout>
    </PageWrapper>
  )
}
