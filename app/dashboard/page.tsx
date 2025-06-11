"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { PageWrapper } from "@/components/page-wrapper"
import { DashboardSkeleton } from "@/components/loading-screen"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  Target,
  FileText,
  BarChart3,
  TrendingUp,
  Activity,
  Bot,
  Sparkles,
  MapPin,
  Calendar
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis } from "recharts"
import { useAuthStore } from "@/stores/auth-store"
import { useQueryClient } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"

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


const recentLeads = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@company.com",
    status: "new",
    source: "Website",
    value: "$50,000",
    createdAt: "2 hours ago"
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "m.chen@tech.com",
    status: "qualified",
    source: "Referral",
    value: "$75,000",
    createdAt: "5 hours ago"
  },
  {
    id: 3,
    name: "Emma Davis",
    email: "emma.davis@startup.io",
    status: "contacted",
    source: "Social Media",
    value: "$25,000",
    createdAt: "1 day ago"
  }
]



const upcomingVisits = [
  {
    id: 1,
    leadName: "Sarah Johnson",
    date: "Today, 2:00 PM",
    location: "Downtown Office",
    type: "Initial Consultation"
  },
  {
    id: 2,
    leadName: "Michael Chen",
    date: "Tomorrow, 10:00 AM",
    location: "Client Site",
    type: "Property Tour"
  }
]

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-green-100 text-green-800",
  proposal: "bg-purple-100 text-purple-800"
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

  const userRole = user.roles[0].name
  // const canManageTeam = user.roles[0].name === "Admin"
  // const canCreateGoals = user.roles[0].name === "CEO" || user.roles[0].name === "Admin"
  // const canUseAI = userRole === "CEO" || userRole === "Admin" || userRole === "Team Leader"

  return (
    <PageWrapper>
      <DashboardLayout>
        {isPageLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.first_name}</h1>
              <p className="text-muted-foreground mt-4">Welcome back! Here's your lead management overview.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+2 from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Leads</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">Across 4 departments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Site Visits Scheduled</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$2.4M</div>
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


              {/* <Card>
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
              </Card> */}

              {/* Recent Leads */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Leads
                    <Button variant="outline" size="sm">View All</Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentLeads.map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{lead.name}</p>
                          <p className="text-sm text-muted-foreground">{lead.email}</p>
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[lead.status as keyof typeof statusColors]} variant="secondary">
                              {lead.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{lead.source}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">{lead.value}</p>
                          <p className="text-xs text-muted-foreground">{lead.createdAt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Site Visits */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Upcoming Site Visits
                    <Button variant="outline" size="sm">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Visit
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingVisits.map((visit) => (
                      <div key={visit.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{visit.leadName}</p>
                          <p className="text-sm text-muted-foreground">{visit.type}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {visit.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">{visit.date}</p>
                          <Button variant="outline" size="sm" className="mt-1">
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </DashboardLayout>
    </PageWrapper>
  )
}
