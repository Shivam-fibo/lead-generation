"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { LoadingScreen, ProgressSkeleton } from "@/components/loading-screen"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Users, Target, TrendingUp, Filter } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis } from "recharts"

interface User {
  role: string
}

interface TeamMember {
  id: number
  name: string
  email: string
  role: string
  skillTags: string[]
  department: string
}

interface Task {
  id: number
  title: string
  description: string
  assignedTo: TeamMember
  estimatedHours: number
  priority: "low" | "medium" | "high"
  status: "not-started" | "in-progress" | "completed"
  dueDate: Date | null
  goalId: number
  goalTitle: string
}

interface TeamProgress {
  member: TeamMember
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  completionRate: number
}

interface DepartmentProgress {
  department: string
  totalTasks: number
  completedTasks: number
  completionRate: number
  members: number
}

// Mock team members data
const defaultTeamMembers: TeamMember[] = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@company.com",
    role: "CEO",
    skillTags: ["Leadership", "Strategy", "Vision"],
    department: "Executive",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@company.com",
    role: "Admin",
    skillTags: ["Management", "Operations", "HR"],
    department: "Administration",
  },
  {
    id: 3,
    name: "Mike Davis",
    email: "mike.davis@company.com",
    role: "Team Leader",
    skillTags: ["Project Management", "Development", "Agile"],
    department: "Engineering",
  },
  {
    id: 4,
    name: "Lisa Wilson",
    email: "lisa.wilson@company.com",
    role: "Team Member",
    skillTags: ["Frontend", "React", "TypeScript"],
    department: "Engineering",
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.brown@company.com",
    role: "Team Member",
    skillTags: ["Backend", "Node.js", "Database"],
    department: "Engineering",
  },
  {
    id: 6,
    name: "Emily Chen",
    email: "emily.chen@company.com",
    role: "Team Member",
    skillTags: ["Design", "UI/UX", "Figma"],
    department: "Design",
  },
  {
    id: 7,
    name: "Alex Rodriguez",
    email: "alex.rodriguez@company.com",
    role: "Team Member",
    skillTags: ["Marketing", "Content", "SEO"],
    department: "Marketing",
  },
  {
    id: 8,
    name: "Jessica Lee",
    email: "jessica.lee@company.com",
    role: "Team Leader",
    skillTags: ["Sales", "Negotiation", "Client Relations"],
    department: "Sales",
  },
]

// Mock tasks data
const mockTasks = [
  {
    id: 1,
    title: "Design User Interface",
    description: "Create wireframes and mockups for the onboarding flow",
    assignedTo: defaultTeamMembers[5], // Emily Chen
    estimatedHours: 16,
    priority: "high",
    status: "completed",
    dueDate: new Date(2024, 4, 15),
    goalId: 1,
    goalTitle: "Customer Onboarding System",
  },
  {
    id: 2,
    title: "Develop Backend API",
    description: "Build REST API endpoints for user registration and email automation",
    assignedTo: defaultTeamMembers[4], // David Brown
    estimatedHours: 24,
    priority: "high",
    status: "in-progress",
    dueDate: new Date(2024, 4, 20),
    goalId: 1,
    goalTitle: "Customer Onboarding System",
  },
  {
    id: 3,
    title: "Frontend Implementation",
    description: "Implement the onboarding UI components and user flows",
    assignedTo: defaultTeamMembers[3], // Lisa Wilson
    estimatedHours: 20,
    priority: "medium",
    status: "not-started",
    dueDate: new Date(2024, 4, 25),
    goalId: 1,
    goalTitle: "Customer Onboarding System",
  },
  {
    id: 4,
    title: "Email Template Creation",
    description: "Design and code responsive email templates for the sequence",
    assignedTo: defaultTeamMembers[5], // Emily Chen
    estimatedHours: 12,
    priority: "medium",
    status: "completed",
    dueDate: new Date(2024, 4, 10),
    goalId: 1,
    goalTitle: "Customer Onboarding System",
  },
  {
    id: 5,
    title: "Testing & QA",
    description: "Comprehensive testing of the onboarding system",
    assignedTo: defaultTeamMembers[2], // Mike Davis
    estimatedHours: 16,
    priority: "low",
    status: "not-started",
    dueDate: new Date(2024, 4, 30),
    goalId: 1,
    goalTitle: "Customer Onboarding System",
  },
  {
    id: 6,
    title: "Create Marketing Plan",
    description: "Develop comprehensive marketing strategy for Q3",
    assignedTo: defaultTeamMembers[6], // Alex Rodriguez
    estimatedHours: 18,
    priority: "high",
    status: "completed",
    dueDate: new Date(2024, 4, 5),
    goalId: 2,
    goalTitle: "Q3 Marketing Campaign",
  },
  {
    id: 7,
    title: "Sales Presentation",
    description: "Create sales deck for enterprise clients",
    assignedTo: defaultTeamMembers[7], // Jessica Lee
    estimatedHours: 10,
    priority: "high",
    status: "completed",
    dueDate: new Date(2024, 4, 8),
    goalId: 3,
    goalTitle: "Enterprise Sales Push",
  },
  {
    id: 8,
    title: "Client Outreach",
    description: "Contact top 20 potential clients",
    assignedTo: defaultTeamMembers[7], // Jessica Lee
    estimatedHours: 15,
    priority: "medium",
    status: "in-progress",
    dueDate: new Date(2024, 4, 22),
    goalId: 3,
    goalTitle: "Enterprise Sales Push",
  },
  {
    id: 9,
    title: "Strategic Planning",
    description: "Define company vision for next fiscal year",
    assignedTo: defaultTeamMembers[0], // John Smith
    estimatedHours: 24,
    priority: "high",
    status: "in-progress",
    dueDate: new Date(2024, 5, 15),
    goalId: 4,
    goalTitle: "Annual Strategy",
  },
  {
    id: 10,
    title: "Budget Review",
    description: "Analyze Q2 expenses and prepare Q3 budget",
    assignedTo: defaultTeamMembers[1], // Sarah Johnson
    estimatedHours: 20,
    priority: "high",
    status: "completed",
    dueDate: new Date(2024, 4, 1),
    goalId: 4,
    goalTitle: "Annual Strategy",
  },
  {
    id: 11,
    title: "HR Policy Update",
    description: "Revise remote work policies",
    assignedTo: defaultTeamMembers[1], // Sarah Johnson
    estimatedHours: 12,
    priority: "medium",
    status: "completed",
    dueDate: new Date(2024, 3, 28),
    goalId: 5,
    goalTitle: "Policy Revisions",
  },
  {
    id: 12,
    title: "Content Calendar",
    description: "Plan content for social media channels",
    assignedTo: defaultTeamMembers[6], // Alex Rodriguez
    estimatedHours: 8,
    priority: "medium",
    status: "in-progress",
    dueDate: new Date(2024, 4, 18),
    goalId: 2,
    goalTitle: "Q3 Marketing Campaign",
  },
  {
    id: 13,
    title: "Database Optimization",
    description: "Improve query performance for customer dashboard",
    assignedTo: defaultTeamMembers[4], // David Brown
    estimatedHours: 16,
    priority: "high",
    status: "not-started",
    dueDate: new Date(2024, 5, 5),
    goalId: 6,
    goalTitle: "Performance Improvements",
  },
  {
    id: 14,
    title: "Mobile App Design",
    description: "Create UI/UX for mobile application",
    assignedTo: defaultTeamMembers[5], // Emily Chen
    estimatedHours: 30,
    priority: "high",
    status: "in-progress",
    dueDate: new Date(2024, 5, 10),
    goalId: 7,
    goalTitle: "Mobile App Launch",
  },
  {
    id: 15,
    title: "User Research",
    description: "Conduct user interviews for new features",
    assignedTo: defaultTeamMembers[5], // Emily Chen
    estimatedHours: 20,
    priority: "medium",
    status: "completed",
    dueDate: new Date(2024, 3, 30),
    goalId: 7,
    goalTitle: "Mobile App Launch",
  },
]

// Chart configuration
const chartConfig = {
  completedTasks: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
  totalTasks: {
    label: "Total",
    color: "hsl(var(--chart-2))",
  },
  completionRate: {
    label: "Completion Rate",
    color: "hsl(var(--chart-3))",
  },
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]

export default function ProgressMonitor() {
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(defaultTeamMembers)
  const [teamProgress, setTeamProgress] = useState<TeamProgress[]>([])
  const [departmentProgress, setDepartmentProgress] = useState<DepartmentProgress[]>([])
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/")
      return
    }

    const userData = JSON.parse(currentUser)
    setUser(userData)

    if (userData.role !== "CEO" && userData.role !== "Admin" && userData.role !== "Team Leader") {
      router.push("/dashboard")
      return
    }

    // Simulate loading time
    setTimeout(() => {
      // Load team members
      const savedTeamMembers = localStorage.getItem("teamMembers")
      if (savedTeamMembers) {
        try {
          const parsedMembers = JSON.parse(savedTeamMembers)
          if (Array.isArray(parsedMembers) && parsedMembers.length > 0) {
            setTeamMembers(parsedMembers)
          }
        } catch (error) {
          console.error("Error parsing team members:", error)
        }
      }

      // Load tasks
      loadTasks()
      setIsLoading(false)
    }, 800)
  }, [router])

  useEffect(() => {
    calculateProgress()
  }, [tasks, teamMembers])

  const loadTasks = () => {
    // Try to load from localStorage first
    const savedTasks = localStorage.getItem("allTasks") || "[]"
    let allTasks = JSON.parse(savedTasks)

    // If no tasks in localStorage, use mock data
    if (allTasks.length === 0) {
      allTasks = mockTasks
    }

    // Convert date strings back to Date objects
    const tasksWithDates = allTasks.map((task: any) => ({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
    }))

    setTasks(tasksWithDates)
  }

  const calculateProgress = () => {
    // Calculate individual team member progress
    const memberProgress: TeamProgress[] = teamMembers.map((member) => {
      const memberTasks = tasks.filter((task) => task.assignedTo?.id === member.id)
      const completedTasks = memberTasks.filter((task) => task.status === "completed").length
      const inProgressTasks = memberTasks.filter((task) => task.status === "in-progress").length
      const overdueTasks = memberTasks.filter(
        (task) => task.dueDate && new Date() > task.dueDate && task.status !== "completed",
      ).length

      return {
        member,
        totalTasks: memberTasks.length,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        completionRate: memberTasks.length > 0 ? (completedTasks / memberTasks.length) * 100 : 0,
      }
    })

    setTeamProgress(memberProgress)

    // Calculate department progress
    const departments = [...new Set(teamMembers.map((m) => m.department))]
    const deptProgress: DepartmentProgress[] = departments.map((dept) => {
      const deptMembers = teamMembers.filter((m) => m.department === dept)
      const deptTasks = tasks.filter((task) => deptMembers.some((member) => member.id === task.assignedTo?.id))
      const completedTasks = deptTasks.filter((task) => task.status === "completed").length

      return {
        department: dept,
        totalTasks: deptTasks.length,
        completedTasks,
        completionRate: deptTasks.length > 0 ? (completedTasks / deptTasks.length) * 100 : 0,
        members: deptMembers.length,
      }
    })

    setDepartmentProgress(deptProgress)
  }

  const getFilteredProgress = () => {
    let filtered = teamProgress

    if (roleFilter !== "all") {
      filtered = filtered.filter((p) => p.member.role === roleFilter)
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter((p) => p.member.department === departmentFilter)
    }

    return filtered
  }

  const pieChartData = departmentProgress.map((dept, index) => ({
    name: dept.department,
    value: dept.completedTasks,
    fill: COLORS[index % COLORS.length],
  }))

  if (!user && isLoading) {
    return <LoadingScreen />
  }

  if (!user) {
    return null
  }

  const filteredProgress = getFilteredProgress()
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === "completed").length
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <DashboardLayout breadcrumbs={[{ label: "Progress Monitor" }]}>
      {isLoading ? (
        <ProgressSkeleton />
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Progress Monitor</h1>
            <p className="text-muted-foreground">Track team and project progress across the organization</p>
          </div>

          {/* Overall Statistics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
                <Progress value={overallProgress} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {completedTasks} of {totalTasks} tasks completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamProgress.filter((p) => p.totalTasks > 0).length}</div>
                <p className="text-xs text-muted-foreground">Out of {teamMembers.length} total members</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Departments</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{departmentProgress.length}</div>
                <p className="text-xs text-muted-foreground">Active departments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamProgress.reduce((sum, p) => sum + p.overdueTasks, 0)}</div>
                <p className="text-xs text-muted-foreground">Require attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>Task completion by department</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart data={departmentProgress}>
                    <XAxis dataKey="department" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="completedTasks" fill="var(--color-completedTasks)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="totalTasks" fill="var(--color-totalTasks)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Task Distribution</CardTitle>
                <CardDescription>Completed tasks by department</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filter Team Progress</span>
              </CardTitle>
              <div className="flex space-x-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="CEO">CEO</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Team Leader">Team Leader</SelectItem>
                      <SelectItem value="Team Member">Team Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {[...new Set(teamMembers.map((m) => m.department))].map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Individual Team Member Progress */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Individual Progress</h2>
            {filteredProgress.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No team members found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">No team members match your current filters.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredProgress.map((progress) => (
                <Card key={progress.member.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{progress.member.name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Badge variant="outline">{progress.member.role}</Badge>
                            <span>{progress.member.department}</span>
                            <span>•</span>
                            <span>{progress.member.skillTags.slice(0, 3).join(", ")}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{Math.round(progress.completionRate)}%</div>
                          <div className="text-sm text-muted-foreground">completion rate</div>
                        </div>
                      </div>

                      <Progress value={progress.completionRate} className="h-3" />

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-lg font-semibold">{progress.totalTasks}</div>
                          <div className="text-muted-foreground">Total Tasks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600">{progress.completedTasks}</div>
                          <div className="text-muted-foreground">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600">{progress.inProgressTasks}</div>
                          <div className="text-muted-foreground">In Progress</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-red-600">{progress.overdueTasks}</div>
                          <div className="text-muted-foreground">Overdue</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
