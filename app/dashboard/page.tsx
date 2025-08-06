"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useDashboardStore } from "@/stores/dashboard-store"
import { useAuthStore } from "@/stores/auth-store"
import DashboardLayout from "@/components/dashboard-layout"
import { PageWrapper } from "@/components/page-wrapper"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { formatDistanceToNowStrict } from "date-fns";
import { DateTime } from "luxon";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  CalendarX,
  Flame,
  MapPin,
  TrendingUp,
  UserX,
  Calendar,
  LucideSnowflake,
  Phone,
} from "lucide-react"

interface Lead {
  _id: string
  status: string
  name: string
  phone: string
  date: string
}

interface SiteVisit {
  _id: string
  date: string
  visitor: {
    name: string
  }
  status: string
}

const StatusBadge = ({ lead }: { lead: string }) => {
  const status = lead === "Hot"

  const getStatusStyle = (isHot: boolean) => {
    if (isHot) {
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

const EmptyLeadsState = () => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <UserX className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="text-lg font-medium text-foreground mb-2">No recent leads</h3>
    <p className="text-sm text-muted-foreground mb-4">
      There are no recent leads to display at the moment.
    </p>
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.location.href = "/leads"}
    >
      View All Leads
    </Button>
  </div>
)

const EmptySiteVisitsState = () => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <CalendarX className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="text-lg font-medium text-foreground mb-2">No upcoming visits</h3>
    <p className="text-sm text-muted-foreground mb-4">
      There are no upcoming site visits scheduled.
    </p>
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.location.href = "/site-visits"}
    >
      <Calendar className="mr-2 h-4 w-4" />
      Schedule Visit
    </Button>
  </div>
)

export default function Dashboard() {
  const { user } = useAuthStore()
  const router = useRouter()
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error,
    selectedProjectId,
    projectSuccess
  } = useDashboardStore()

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }
  }, [router, user])

  if (!user) {
    return null
  }

  // Show loading while fetching data
  if (isDashboardLoading) {
    return (
      <PageWrapper>
        <DashboardLayout>
          <DashboardSkeleton />
        </DashboardLayout>
      </PageWrapper>
    )
  }

  // Show message when project API is successful but no projects are assigned
  if (projectSuccess && !selectedProjectId) {
    return (
      <PageWrapper>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">No Projects Assigned</h2>
              <p className="text-muted-foreground">You currently don't have any projects assigned. Please contact your administrator to get access to projects.</p>
            </div>
          </div>
        </DashboardLayout>
      </PageWrapper>
    )
  }

  // Show loading state until a project is selected
  if (!selectedProjectId) {
    return (
      <PageWrapper>
        <DashboardLayout>
          <DashboardSkeleton />
        </DashboardLayout>
      </PageWrapper>
    )
  }

  // Check if dashboard data exists
  // if (!dashboardData) {
  //   return (
  //     <PageWrapper>
  //       <DashboardLayout>
  //         <div className="flex items-center justify-center h-64">
  //           <div className="text-center">
  //             <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
  //             <p className="text-muted-foreground">No dashboard data available for the selected project.</p>
  //           </div>
  //         </div>
  //       </DashboardLayout>
  //     </PageWrapper>
  //   )
  // }


  // Check if recent leads exist and have data
  const hasRecentLeads = dashboardData?.recentLeads && dashboardData.recentLeads.length > 0

  // Check if upcoming site visits exist and have data
  const hasUpcomingVisits = dashboardData?.upcomingSiteVisits && dashboardData.upcomingSiteVisits.length > 0


  return (
    <PageWrapper>
      <DashboardLayout>
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
                <p className="text-xs text-muted-foreground">Till so far</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.stats?.totalLeadsThisMonth || 0}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Site Visits Booked</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.stats?.totalSiteVisitsThisMonth || 0}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Site Visits Booked</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.stats?.totalSiteVisits || 0}</div>
                <p className="text-xs text-muted-foreground">Till so far</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
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
                {!dashboardData.recentLeads || dashboardData.recentLeads.length === 0 ? (
                  <EmptyLeadsState />
                ) : (
                  <div className="space-y-4">
                    {dashboardData.recentLeads.map((lead) => (
                      <div key={lead._id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex gap-1">
                            <p className="font-medium text-foreground">{lead.first_name}</p>
                            <p className="font-medium text-foreground">{lead.last_name}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{lead.project_name}</p>
                          <div className="flex items-center gap-2">
                            <StatusBadge lead={lead.lead_type} />
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
                )}
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
                {hasUpcomingVisits ? (
                  <div className="space-y-4">
                    {dashboardData?.upcomingSiteVisits.map((visit) => {
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
                ) : (
                  <EmptySiteVisitsState />
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </DashboardLayout>
    </PageWrapper>
  )
}
