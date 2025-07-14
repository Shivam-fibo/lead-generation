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
  Calendar,
  Flame,
  LucideSnowflake,
  Phone
} from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis } from "recharts"
import { useAuthStore } from "@/stores/auth-store"
import { useQueryClient } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { useDashboard } from "@/hooks/use-dashboard"
import { formatDistanceToNowStrict } from "date-fns";
import { DateTime } from "luxon";

interface User {
  id: number
  email: string
  role: string
  name: string
}

const StatusBadge = ({ lead }: { lead: String }) => {
  let status;
  if (lead === "Cold") {
    status = false;
  } else if (lead === "Hot") {
    status = true
  } else {
    status = false;
  }
  const getStatusStyle = (status: boolean) => {
    if (status) {
      return "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
    } else {
      return "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
    }
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${getStatusStyle(status)}`}>
      {status ? (
        <>
          <Flame className="h-3.5 w-3.5 mr-0.5" />
          <span> Hot </span>
        </>
      ) : (
        <>
          <LucideSnowflake className="h-3.5 w-3.5 mr-0.5" />
          <span> Cold </span>
        </>
      )}
    </span>
  )
}



export default function Dashboard() {
  const { user } = useAuthStore()
  const { data: dashboardData, isLoading } = useDashboard()
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

  // const userRole = user.roles[0].name
  // const canManageTeam = user.roles[0].name === "Admin"
  // const canCreateGoals = user.roles[0].name === "CEO" || user.roles[0].name === "Admin"
  // const canUseAI = userRole === "CEO" || userRole === "Admin" || userRole === "Team Leader"


  return (
    <PageWrapper>
      <DashboardLayout>
        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.firstName}</h1>
              <p className="text-muted-foreground mt-4">Welcome back! Here's your lead management overview.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
                  <Flame className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.stats?.hotLeads || 0}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.stats?.totalLeadsThisMonth || 0}</div>
                  <p className="text-xs text-muted-foreground">Across all lead sources </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Site Visits Scheduled</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.stats?.totalSiteVisitsThisMonth || 0}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Site Visits</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData?.stats?.totalSiteVisits || 0}</div>
                  <p className="text-xs text-muted-foreground">Booked by leads so far</p>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/leads")}
                    >
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>

                  <div className="space-y-4">
                    {dashboardData?.recentLeads?.map((lead) => (
                      <div key={lead._id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex gap-1">
                            <p className="font-medium text-foreground">{lead.first_name}</p>
                            <p className="font-medium text-foreground">{lead.last_name}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{lead.project_name}</p>
                          <div className="flex items-center gap-2">
                            <StatusBadge lead={lead.lead_type} />
                            {/* <span className="text-xs text-muted-foreground">{lead.requirement}</span> */}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">{lead.requirement ? lead.requirement : "-"}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNowStrict(new Date(lead.created_at), { addSuffix: true })}
                          </p>

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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/site-visits")}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Visit
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData?.upcomingSiteVisits?.map((visit) => {
                      const raw = visit.visit_booking_datetime;
                      let formattedVisitTime = "Invalid date";

                      if (raw && raw !== "Not specified") {
                        const parsed = DateTime.fromISO(raw, { zone: "utc" }).setZone("Asia/Kolkata");

                        if (parsed.isValid) {
                          const now = DateTime.now().setZone("Asia/Kolkata");
                          const tomorrow = now.plus({ days: 1 });

                          const isTomorrow = parsed.hasSame(tomorrow, "day") && parsed.hasSame(tomorrow, "month");

                          formattedVisitTime = isTomorrow
                            ? `Tomorrow, ${parsed.toFormat("hh:mm a")}`
                            : `${parsed.toFormat("cccc")}, ${parsed.toFormat("hh:mm a")}`;
                        }
                      }

                      // let temp = visit?.visit_booking_datetime ? new Date(visit.visit_booking_datetime).toLocaleString('en-IN', {
                      //   timeZone: 'Asia/Kolkata',
                      //   weekday: 'long',
                      //   day: '2-digit',
                      //   month: 'long',
                      //   year: 'numeric',
                      //   hour: '2-digit',
                      //   minute: '2-digit',
                      //   hour12: true,
                      // }).replace(',', ' at')
                      //   : 'Not scheduled'

                      return (
                        <div
                          key={visit._id}
                          className="flex items-center justify-between p-3 border border-border rounded-lg"
                        >
                          <div className="space-y-1">
                            <div className="flex gap-1">
                              <p className="font-medium text-foreground">{visit.first_name}</p>
                              <p className="font-medium text-foreground">{visit.last_name}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">{visit.requirement}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {visit.contact_number}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-medium text-foreground">{formattedVisitTime}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-1"
                              onClick={() => router.push("/site-visits")}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      );
                    })}
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
