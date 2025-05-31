"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { LoadingScreen, TasksSkeleton } from "@/components/loading-screen"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { Clock, Target, Volume2, CheckCircle, AlertCircle } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import type { User } from "@/lib/api"

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  skillTags: string[]
  department: string
}

interface Task {
  id: string
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

export default function MyTasks() {
  const { user } = useAuthStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    setTimeout(() => {
      // Load tasks assigned to current user
      loadMyTasks(user._id)
      setIsLoading(false)
    }, 800)
  }, [router, user])

  useEffect(() => {
    // Filter tasks based on selected filters
    let filtered = tasks

    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter)
    }

    setFilteredTasks(filtered)
  }, [tasks, statusFilter, priorityFilter])

  const loadMyTasks = (userId: string) => {
    const savedTasks = localStorage.getItem("allTasks") || "[]"
    const allTasks = JSON.parse(savedTasks)

    // Filter tasks assigned to current user
    const myTasks = allTasks.filter((task: Task) => task.assignedTo?.id === userId)

    // Convert date strings back to Date objects
    const tasksWithDates = myTasks.map((task: Task) => ({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
    }))

    setTasks(tasksWithDates)
  }

  const updateTaskStatus = (taskId: string, newStatus: "not-started" | "in-progress" | "completed") => {
    const updatedTasks = tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))
    setTasks(updatedTasks)

    // Update in localStorage
    const savedTasks = localStorage.getItem("allTasks") || "[]"
    const allTasks = JSON.parse(savedTasks)
    const updatedAllTasks = allTasks.map((task: Task) => (task.id === taskId ? { ...task, status: newStatus } : task))
    localStorage.setItem("allTasks", JSON.stringify(updatedAllTasks))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "not-started":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "not-started":
        return <AlertCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const isOverdue = (dueDate: Date | null) => {
    if (!dueDate) return false
    return new Date() > dueDate
  }

  const handleVoiceAgent = (task: Task) => {
    setSelectedTask(task)
    setShowVoiceModal(true)
  }

  if (!user && isLoading) {
    return <LoadingScreen />
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      {isLoading ? (
        <TasksSkeleton />
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">My Tasks</h1>
            <p className="text-muted-foreground">Tasks assigned to you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tasks.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tasks.filter((t) => t.status === "in-progress").length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tasks.filter((t) => t.status === "completed").length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tasks.filter((t) => isOverdue(t.dueDate)).length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Filter Tasks</CardTitle>
              <div className="flex space-x-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="not-started">Not Started</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Target className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No tasks found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {tasks.length === 0
                        ? "You don't have any tasks assigned yet."
                        : "No tasks match your current filters."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredTasks.map((task) => (
                <Card key={task.id} className={isOverdue(task.dueDate) ? "border-red-200" : ""}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(task.status)}
                            <h3 className="font-medium text-lg">{task.title}</h3>
                            {isOverdue(task.dueDate) && (
                              <Badge variant="destructive" className="text-xs">
                                Overdue
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <span>Goal: {task.goalTitle}</span>
                            <span>Est. {task.estimatedHours}h</span>
                            {task.dueDate && (
                              <span className={isOverdue(task.dueDate) ? "text-red-600 font-medium" : ""}>
                                Due: {format(task.dueDate, "MMM dd, yyyy")}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          <Badge className={getStatusColor(task.status)}>{task.status.replace("-", " ")}</Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Select
                            value={task.status}
                            onValueChange={(value: "not-started" | "in-progress" | "completed") =>
                              updateTaskStatus(task.id, value)
                            }
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="not-started">Not Started</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button variant="outline" onClick={() => handleVoiceAgent(task)}>
                          <Volume2 className="mr-2 h-4 w-4" />
                          Understand via Voice Agent
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Voice Agent Modal */}
          <Dialog open={showVoiceModal} onOpenChange={setShowVoiceModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Volume2 className="h-5 w-5" />
                  <span>Voice Agent - Task Explanation</span>
                </DialogTitle>
                <DialogDescription>AI Voice Agent explaining: {selectedTask?.title}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Task Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <strong>Description:</strong>
                      <p className="text-sm text-muted-foreground mt-1">{selectedTask?.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Priority:</strong> {selectedTask?.priority}
                      </div>
                      <div>
                        <strong>Estimated Time:</strong> {selectedTask?.estimatedHours}h
                      </div>
                      <div>
                        <strong>Due Date:</strong>{" "}
                        {selectedTask?.dueDate ? format(selectedTask.dueDate, "PPP") : "Not set"}
                      </div>
                      <div>
                        <strong>Status:</strong> {selectedTask?.status.replace("-", " ")}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">AI Voice Explanation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        <Volume2 className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-900 dark:text-blue-100">Voice Agent</span>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        "Hello! Let me explain this task for you. {selectedTask?.title} involves{" "}
                        {selectedTask?.description.toLowerCase()}. This is a {selectedTask?.priority} priority task that
                        should take approximately {selectedTask?.estimatedHours} hours to complete.
                        {selectedTask?.dueDate
                          ? ` The deadline is ${format(selectedTask.dueDate, "MMMM do, yyyy")}.`
                          : " No specific deadline has been set."}
                        I recommend breaking this down into smaller steps and updating your progress regularly. Feel
                        free to reach out if you need any clarification or assistance!"
                      </p>
                    </div>

                    <div className="mt-4 text-center">
                      <Button variant="outline" className="mr-2">
                        <Volume2 className="mr-2 h-4 w-4" />
                        Play Audio (Demo)
                      </Button>
                      <Button variant="outline">Ask Follow-up Question</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </DashboardLayout>
  )
}
