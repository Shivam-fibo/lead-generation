"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { CalendarIcon, Target, Save, Shuffle, Plus, Edit, Trash2 } from "lucide-react"

interface User {
  id: number
  role: string
  name: string
}

interface TeamMember {
  id: number
  name: string
  email: string
  role: string
  skillTags: string[]
  department: string
}

interface SubTask {
  id: number
  title: string
  description: string
  assignedTo: TeamMember | null
  estimatedHours: number
  priority: "low" | "medium" | "high"
  status: "not-started" | "in-progress" | "completed"
  dueDate: Date | null
}

interface Goal {
  id: number
  title: string
  description: string
  status: string
  tasks?: SubTask[]
}

interface TaskFormData {
  title: string
  description: string
  estimatedHours: number
  priority: "low" | "medium" | "high"
}

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
]

export default function TaskDelegation() {
  const [user, setUser] = useState<User | null>(null)
  const [goal, setGoal] = useState<Goal | null>(null)
  const [tasks, setTasks] = useState<SubTask[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(defaultTeamMembers)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingTask, setEditingTask] = useState<SubTask | null>(null)
  const [taskForm, setTaskForm] = useState<TaskFormData>({
    title: "",
    description: "",
    estimatedHours: 8,
    priority: "medium",
  })
  const router = useRouter()
  const params = useParams()
  const goalId = params.id as string

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

    // Load goal and generate tasks
    loadGoalAndTasks()
    setIsLoading(false)
  }, [router, goalId])

  const loadGoalAndTasks = () => {
    // Check if tasks already exist for this goal
    const savedTasks = localStorage.getItem("allTasks") || "[]"
    const allTasks = JSON.parse(savedTasks)
    const existingTasks = allTasks.filter((task: any) => task.goalId === Number.parseInt(goalId))

    // Mock goal data - in real app, this would come from API
    const mockGoal: Goal = {
      id: Number.parseInt(goalId),
      title: "Customer Onboarding System",
      description: "Implement new customer onboarding system with automated email sequences and user training modules",
      status: "active",
    }

    if (existingTasks.length > 0) {
      // Load existing tasks
      const tasksWithDates = existingTasks.map((task: any) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
      }))
      setTasks(tasksWithDates)
    } else {
      // Generate dummy subtasks
      const generatedTasks: SubTask[] = [
        {
          id: Date.now() + 1,
          title: "Design User Interface",
          description:
            "Create wireframes and mockups for the onboarding flow including welcome screens, progress indicators, and completion pages",
          assignedTo: null,
          estimatedHours: 16,
          priority: "high",
          status: "not-started",
          dueDate: null,
        },
        {
          id: Date.now() + 2,
          title: "Develop Backend API",
          description: "Build REST API endpoints for user registration, email automation, and progress tracking",
          assignedTo: null,
          estimatedHours: 24,
          priority: "high",
          status: "not-started",
          dueDate: null,
        },
        {
          id: Date.now() + 3,
          title: "Frontend Implementation",
          description: "Implement the onboarding UI components using React and integrate with backend APIs",
          assignedTo: null,
          estimatedHours: 20,
          priority: "medium",
          status: "not-started",
          dueDate: null,
        },
        {
          id: Date.now() + 4,
          title: "Email Template Creation",
          description: "Design and code responsive email templates for the automated sequence",
          assignedTo: null,
          estimatedHours: 12,
          priority: "medium",
          status: "not-started",
          dueDate: null,
        },
        {
          id: Date.now() + 5,
          title: "Testing & QA",
          description:
            "Comprehensive testing of the onboarding system including unit tests and user acceptance testing",
          assignedTo: null,
          estimatedHours: 16,
          priority: "low",
          status: "not-started",
          dueDate: null,
        },
        {
          id: Date.now() + 6,
          title: "Documentation",
          description: "Create user documentation and admin guides for the onboarding system",
          assignedTo: null,
          estimatedHours: 8,
          priority: "low",
          status: "not-started",
          dueDate: null,
        },
      ]
      setTasks(generatedTasks)
    }

    setGoal(mockGoal)
  }

  const autoAssignTasks = () => {
    const updatedTasks = tasks.map((task) => {
      let assignedMember: TeamMember | null = null

      // Auto-assignment logic based on task title and team member skills
      if (task.title.toLowerCase().includes("design") || task.title.toLowerCase().includes("ui")) {
        assignedMember =
          teamMembers.find((m) => m.skillTags.some((skill) => skill.toLowerCase().includes("design"))) || null
      } else if (task.title.toLowerCase().includes("backend") || task.title.toLowerCase().includes("api")) {
        assignedMember =
          teamMembers.find((m) => m.skillTags.some((skill) => skill.toLowerCase().includes("backend"))) || null
      } else if (task.title.toLowerCase().includes("frontend")) {
        assignedMember =
          teamMembers.find((m) => m.skillTags.some((skill) => skill.toLowerCase().includes("frontend"))) || null
      } else if (task.title.toLowerCase().includes("testing") || task.title.toLowerCase().includes("qa")) {
        assignedMember = teamMembers.find((m) => m.role === "Team Leader") || null
      } else {
        // Default assignment to available team members
        assignedMember = teamMembers.find((m) => m.role === "Team Member") || null
      }

      return {
        ...task,
        assignedTo: assignedMember,
      }
    })

    setTasks(updatedTasks)
  }

  const updateTaskAssignment = (taskId: number, memberId: string) => {
    const member = teamMembers.find((m) => m.id.toString() === memberId) || null
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, assignedTo: member } : task)))
  }

  const updateTaskDueDate = (taskId: number, date: Date | null) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, dueDate: date } : task)))
  }

  const updateTaskPriority = (taskId: number, priority: "low" | "medium" | "high") => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, priority } : task)))
  }

  const handleAddTask = () => {
    const newTask: SubTask = {
      id: Date.now(),
      title: taskForm.title,
      description: taskForm.description,
      assignedTo: null,
      estimatedHours: taskForm.estimatedHours,
      priority: taskForm.priority,
      status: "not-started",
      dueDate: null,
    }

    setTasks((prev) => [...prev, newTask])
    setTaskForm({
      title: "",
      description: "",
      estimatedHours: 8,
      priority: "medium",
    })
    setShowAddDialog(false)
  }

  const handleEditTask = () => {
    if (!editingTask) return

    setTasks((prev) =>
      prev.map((task) =>
        task.id === editingTask.id
          ? {
              ...task,
              title: taskForm.title,
              description: taskForm.description,
              estimatedHours: taskForm.estimatedHours,
              priority: taskForm.priority,
            }
          : task,
      ),
    )

    setEditingTask(null)
    setTaskForm({
      title: "",
      description: "",
      estimatedHours: 8,
      priority: "medium",
    })
    setShowEditDialog(false)
  }

  const handleDeleteTask = (taskId: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  const openEditDialog = (task: SubTask) => {
    setEditingTask(task)
    setTaskForm({
      title: task.title,
      description: task.description,
      estimatedHours: task.estimatedHours,
      priority: task.priority,
    })
    setShowEditDialog(true)
  }

  const saveDelegation = () => {
    // Save tasks to localStorage
    const savedTasks = localStorage.getItem("allTasks") || "[]"
    const allTasks = JSON.parse(savedTasks)

    // Add goal ID to each task
    const tasksWithGoalId = tasks.map((task) => ({
      ...task,
      goalId: Number.parseInt(goalId),
      goalTitle: goal?.title,
    }))

    // Update or add tasks
    const updatedTasks = [...allTasks.filter((t: any) => t.goalId !== Number.parseInt(goalId)), ...tasksWithGoalId]
    localStorage.setItem("allTasks", JSON.stringify(updatedTasks))

    router.push("/goals")
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user || !goal) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Task Delegation</h1>
            <p className="text-muted-foreground">Assign tasks for: {goal.title}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
            <Button variant="outline" onClick={autoAssignTasks}>
              <Shuffle className="mr-2 h-4 w-4" />
              Auto Assign
            </Button>
            <Button onClick={saveDelegation}>
              <Save className="mr-2 h-4 w-4" />
              Save Delegation
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Goal Overview</span>
            </CardTitle>
            <CardDescription>{goal.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Total Tasks</Label>
                <div className="text-2xl font-bold">{tasks.length}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Assigned</Label>
                <div className="text-2xl font-bold">{tasks.filter((t) => t.assignedTo).length}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Estimated Hours</Label>
                <div className="text-2xl font-bold">{tasks.reduce((sum, task) => sum + task.estimatedHours, 0)}h</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Task Assignment</h2>
          {tasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{task.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>Est. {task.estimatedHours}h</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(task)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the task "{task.title}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteTask(task.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Assign to Team Member</Label>
                      <Select
                        value={task.assignedTo?.id.toString() || ""}
                        onValueChange={(value) => updateTaskAssignment(task.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id.toString()}>
                              <div className="flex items-center space-x-2">
                                <span>{member.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {member.role}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {task.assignedTo && (
                        <div className="text-xs text-muted-foreground">
                          Skills: {task.assignedTo.skillTags.slice(0, 3).join(", ")}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Due Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {task.dueDate ? format(task.dueDate, "PPP") : "Set due date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={task.dueDate || undefined}
                            onSelect={(date) => updateTaskDueDate(task.id, date || null)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={task.priority}
                        onValueChange={(value: "low" | "medium" | "high") => updateTaskPriority(task.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Task Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>Create a new task for this goal.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">Task Title</Label>
                <Input
                  id="task-title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  id="task-description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-hours">Estimated Hours</Label>
                  <Input
                    id="task-hours"
                    type="number"
                    value={taskForm.estimatedHours}
                    onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: Number.parseInt(e.target.value) || 0 })}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-priority">Priority</Label>
                  <Select
                    value={taskForm.priority}
                    onValueChange={(value: "low" | "medium" | "high") => setTaskForm({ ...taskForm, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTask} disabled={!taskForm.title || !taskForm.description}>
                Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Task Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>Update the task information.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-task-title">Task Title</Label>
                <Input
                  id="edit-task-title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-task-description">Description</Label>
                <Textarea
                  id="edit-task-description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-task-hours">Estimated Hours</Label>
                  <Input
                    id="edit-task-hours"
                    type="number"
                    value={taskForm.estimatedHours}
                    onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: Number.parseInt(e.target.value) || 0 })}
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-task-priority">Priority</Label>
                  <Select
                    value={taskForm.priority}
                    onValueChange={(value: "low" | "medium" | "high") => setTaskForm({ ...taskForm, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditTask} disabled={!taskForm.title || !taskForm.description}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
