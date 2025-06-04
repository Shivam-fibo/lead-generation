"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { LoadingScreen, GoalsSkeleton } from "@/components/loading-screen"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useGoalsStore } from "@/stores/goals-store"
import { goalsApi } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Plus, Target, Clock, CheckCircle, Edit, Eye, Trash2, Users } from "lucide-react"

import { useAuthStore } from "@/stores/auth-store"
import type { User } from "@/lib/api"
import { useGoals } from "@/hooks/use-goals"

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
  assignedTo: TeamMember
  estimatedHours: number
  priority: "low" | "medium" | "high"
  status: "pending" | "in-progress" | "completed"
}

interface Goal {
  _id: string
  title: string
  description: string
  status: "active" | "completed" | "pending"
  createdAt: string
  assignedTasks: number
  completedTasks: number
  tasks?: SubTask[]
}

const mockGoals = [
  {
    id: 1,
    title: "Q4 Product Launch",
    description: "Launch the new product line with full marketing campaign and customer onboarding",
    status: "active",
    createdAt: "2024-01-15",
    assignedTasks: 12,
    completedTasks: 8,
    tasks: [
      {
        id: 1,
        title: "Design Product Landing Page",
        description: "Create wireframes and mockups for the product landing page",
        assignedTo: {
          id: 6,
          name: "Emily Chen",
          email: "emily.chen@company.com",
          role: "Team Member",
          skillTags: ["Design", "UI/UX", "Figma"],
          department: "Design",
        },
        estimatedHours: 16,
        priority: "high",
        status: "completed",
      },
      {
        id: 2,
        title: "Develop API Endpoints",
        description: "Build REST API endpoints for product data and user management",
        assignedTo: {
          id: 5,
          name: "David Brown",
          email: "david.brown@company.com",
          role: "Team Member",
          skillTags: ["Backend", "Node.js", "Database"],
          department: "Engineering",
        },
        estimatedHours: 24,
        priority: "high",
        status: "in-progress",
      },
    ],
  },
  {
    id: 2,
    title: "Team Expansion",
    description: "Hire 5 new engineers and 2 designers for the upcoming projects",
    status: "active",
    createdAt: "2024-01-10",
    assignedTasks: 8,
    completedTasks: 3,
  },
  {
    id: 3,
    title: "Process Optimization",
    description: "Streamline development workflow and implement new project management tools",
    status: "completed",
    createdAt: "2024-01-05",
    assignedTasks: 6,
    completedTasks: 6,
  },
]

export default function GoalsPage() {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const router = useRouter()

  const {
    goals,
    isLoading,
    createGoal,
    updateGoal,
    deleteGoal,
    isCreatingGoal,
    isUpdatingGoal,
    isDeletingGoal,
  } = useGoals()

  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "",
  })
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)


  const handleViewDetails = (goal: Goal) => {
    setSelectedGoal(goal)
    setShowDetailsDialog(true)
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setEditForm({
      title: goal.title,
      description: goal.description,
      status: goal.status,
    })
    setShowEditDialog(true)
  }

  const handleSaveEdit = async () => {
    if (!editingGoal) return

    try {
      const updatedGoal = await goalsApi.updateGoal(editingGoal._id, {
        title: editForm.title,
        description: editForm.description,
        status: editForm.status as "pending" | "in_progress" | "completed" | "cancelled",
      })

      updateGoal(editingGoal._id, updatedGoal)
      setShowEditDialog(false)
      setEditingGoal(null)
      toast({
        title: "Success",
        description: "Goal updated successfully",
      })
    } catch (error) {
      console.error("Error updating goal:", error)
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (goalId: string) => {
    deleteGoal(goalId)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in_progress":
        return <Target className="h-4 w-4 text-blue-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "cancelled":
        return <Target className="h-4 w-4 text-red-500" />
      default:
        return <Target className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
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

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "pending":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  console.log('goals', goals)

  if (!user && isLoading) {
    return <LoadingScreen />
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout>
      {isLoading ? (
        <GoalsSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Goals & Tasks</h1>
              <p className="text-muted-foreground">Manage and track your organizational goals</p>
            </div>
            <Button onClick={() => router.push("/goals/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Goal
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{goals.length}</div>
                <p className="text-xs text-muted-foreground">
                  {(goals && goals?.filter((g) => g?.status === "in_progress").length) || 0} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Goals</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{goals.filter((g) => g.status === "completed").length}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((goals.filter((g) => g.status === "completed").length / goals.length) * 100)}% completion
                  rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {/* <div className="text-2xl font-bold">{goals.reduce((sum, goal) => sum + goal.assignedTasks, 0)}</div> */}
                <div className="text-2xl font-bold">10</div>
                <p className="text-xs text-muted-foreground">
                  0 completed
                </p>
                {/* <p className="text-xs text-muted-foreground">
                  {goals.reduce((sum, goal) => sum + goal.completedTasks, 0)} completed
                </p> */}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {goals.map((goal, i) => (
              <Card key={goal._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(goal.status)}
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(goal.status)}>{goal.status}</Badge>
                  </div>
                  <CardDescription>{goal.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-muted-foreground">
                        Created: {new Date(goal.createdAt).toLocaleDateString()}
                      </div>
                      {/* <div className="text-sm text-muted-foreground">
                        Tasks: {goal.completedTasks}/{goal.assignedTasks}
                        Tasks: 1/2
                      </div> */}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(goal)}>
                        <Eye className="mr-1 h-4 w-4" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(goal)}>
                        <Edit className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="mr-1 h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the goal "{goal.title}" and all
                              associated tasks.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(goal._id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/goals/delegate/${goal._id}`)}>
                        <Users className="mr-1 h-4 w-4" />
                        Delegate Tasks
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      {/* <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(goal.completedTasks / goal.assignedTasks) * 100}%`,
                        }}
                      ></div> */}
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(Math.floor((Math.random() * 10) + 1) / 50) * 100}%`,
                        }}
                      ></div>
                    </div>
                    {/* <div className="text-xs text-muted-foreground mt-1">
                      {Math.round((goal.completedTasks / goal.assignedTasks) * 100)}% complete
                    </div> */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* View Details Dialog */}
          <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  {selectedGoal && getStatusIcon(selectedGoal.status)}
                  <span>{selectedGoal?.title}</span>
                </DialogTitle>
                <DialogDescription>{selectedGoal?.description}</DialogDescription>
              </DialogHeader>

              {selectedGoal && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge className={getStatusColor(selectedGoal.status)}>{selectedGoal.status}</Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Progress</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {/* {Math.round((selectedGoal.completedTasks / selectedGoal.assignedTasks) * 100)}% */}
                          {((Math.floor((Math.random() * 10) + 1) / 50) * 100)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {selectedGoal.completedTasks} of {selectedGoal.assignedTasks} tasks
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Created</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm">{new Date(selectedGoal.createdAt).toLocaleDateString()}</div>
                      </CardContent>
                    </Card>
                  </div>

                  {selectedGoal.tasks && selectedGoal.tasks.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Tasks</h3>
                      <div className="space-y-3">
                        {selectedGoal.tasks.map((task) => (
                          <Card key={task.id}>
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium">{task.title}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                  <div className="flex items-center space-x-4 mt-2 text-sm">
                                    <div className="flex items-center space-x-1">
                                      <Users className="h-4 w-4 text-muted-foreground" />
                                      <span>{task.assignedTo.name}</span>
                                    </div>
                                    <div className="text-muted-foreground">{task.estimatedHours}h</div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end space-y-2">
                                  <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                                  <Badge className={getTaskStatusColor(task.status)}>{task.status}</Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Goal</DialogTitle>
                <DialogDescription>Update the goal information below.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </DashboardLayout>
  )
}
