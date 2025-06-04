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
import { useGoal, useGoals } from "@/hooks/use-goals"
import { GoalsSkeleton, LoadingScreen } from "@/components/loading-screen"
import { useTasks } from "@/hooks/use-tasks"
import { useTeamMemberList } from "@/hooks/use-team"
import { useQueryClient } from "@tanstack/react-query"
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
  assignedTo: string
}

const defaultTeamMembers: TeamMember[] = [
  {
    id: 1,
    name: "John Smith",
    role: "CEO",
    email: "john.smith@company.com",
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
  // const [goal, setGoal] = useState<Goal | null>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [taskForm, setTaskForm] = useState<TaskFormData>({
    title: "",
    description: "",
    estimatedHours: 8,
    priority: "medium",
    assignedTo: "",
  })
  const router = useRouter()
  const params = useParams()
  const goalId = params.id as string
  const queryClient = useQueryClient()

  const {
    data: goal,
    isLoading: isGoalLoading,
    error: goalError,
    isSuccess,
    isFetched,
    isRefetching
  } = useGoal(goalId || "")
  const {
    isLoading: isTaskLoading,
    isError: taskError,
    isSuccess: taskSuccess,
    createTask,
    updateTask,
    assignTask,
    deleteTask
  } = useTasks()

  const {
    members: teamMembers,
    isLoading: loadingTeamMembers,
    isError: errorTeamMembers,
    isSuccess: successTeamMembers
  } = useTeamMemberList()

  useEffect(() => {
    if (goal && goal?.tasks) {
      setTasks(goal.tasks)
    }
  }, [goal, isFetched, isRefetching])

  // useEffect(() => {
  // Check authentication - commented out for now
  // const currentUser = localStorage.getItem("currentUser")
  // if (!currentUser) {
  //   router.push("/")
  //   return
  // }

  // const userData = JSON.parse(currentUser)
  // setUser(userData)

  // if (userData.role !== "CEO" && userData.role !== "Admin" && userData.role !== "Team Leader") {
  //   router.push("/dashboard")
  //   return
  // }
  // }, [])

  const updateTaskAssignment = (taskId: string, memberId: string) => {
    assignTask(
      { task_id: taskId, assigned_to: memberId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["goalWithId", goalId]
          })
        }
      }
    )
  }

  const updateTaskDueDate = (taskId: number, date: Date | null) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, dueDate: date } : task)))
  }

  const updateTaskPriority = (taskId: number, priority: "low" | "medium" | "high") => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, priority } : task)))
  }

  const handleAddTask = () => {
    const newTask = {
      title: taskForm.title,
      description: taskForm.description,
      priority: taskForm.priority,
      assigned_to: taskForm.assignedTo,
      goalId
    }
    setTasks((prev) => [...prev, newTask])
    createTask(
      newTask,
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["goalWithId", goalId]
          })
        }
      }
    )
    setTaskForm({
      title: "",
      description: "",
      estimatedHours: 8,
      priority: "medium",
      assignedTo: "",
    })
    setShowAddDialog(false)
  }
  const handleEditTask = () => {
    if (!editingTask) return

    const updatedTask = {
      title: taskForm.title,
      description: taskForm.description,
      priority: taskForm.priority,
      assignedTo: taskForm.assignedTo
    }

    updateTask({
      taskId: editingTask._id,
      task: updatedTask
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["goalWithId", goalId]
        })
      }
    })

    setEditingTask(null)
    setTaskForm({
      title: "",
      description: "",
      estimatedHours: 8,
      priority: "medium",
      assignedTo: "",
    })
    setShowEditDialog(false)
  }
  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId, {
      onSuccess: () => {
        setTasks((prev) => prev.filter((task) => task._id !== taskId))
        queryClient.invalidateQueries({
          queryKey: ["goalWithId", goalId]
        })
      }
    })
  }

  const openEditDialog = (task: any) => {
    setEditingTask(task)
    setTaskForm({
      title: task.title,
      description: task.description,
      estimatedHours: task.estimatedHours,
      priority: task.priority,
      assignedTo: task.assignment?.assigned_to?._id || "",
    })
    setShowEditDialog(true)
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

  // if (!user) {
  //   return <LoadingScreen />
  // }

  return (
    <DashboardLayout>
      {isGoalLoading ? (
        <GoalsSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Task Delegation</h1>
              <p className="text-muted-foreground">Assign tasks for: {goal?.title}</p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
              {/* <Button variant="outline" onClick={autoAssignTasks}>
              <Shuffle className="mr-2 h-4 w-4" />
              Auto Assign
            </Button> */}
              {/* <Button onClick={saveDelegation}>
              <Save className="mr-2 h-4 w-4" />
              Save Delegation
            </Button> */}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Goal Overview</span>
              </CardTitle>
              <CardDescription>{goal?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Total Tasks</Label>
                  <div className="text-2xl font-bold">{tasks.length}</div>
                </div>
                {/* <div>
                <Label className="text-sm font-medium">Assigned</Label>
                <div className="text-2xl font-bold">{tasks.filter((t) => t.assignedTo).length}</div>
              </div> */}
                {/* <div>
                <Label className="text-sm font-medium">Estimated Hours</Label>
                <div className="text-2xl font-bold">{tasks.reduce((sum, task) => sum + task.estimatedHours, 0)}h</div>
              </div> */}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Task Assignment</h2>
            {tasks.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Target className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium text-lg mb-2">No Tasks Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get started by adding tasks to this goal.
                    </p>
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Task
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              tasks.map((task) => (
                <Card key={task._id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{task.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          {/* <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>Est. {task.estimatedHours}h</span>
                      </div> */}
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
                              </AlertDialogHeader>                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTask(task._id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">

                          <Label>Assign to</Label>
                          <Select
                            value={task.assignment?.assigned_to?._id?.toString() || ""}
                            onValueChange={(value) => {
                              const selectedMember = teamMembers.find(m => m._id.toString() === value);
                              const updatedTask = {
                                ...task,
                                assignedTo: selectedMember
                              };
                              setTasks(prev => prev.map(t => t._id === task._id ? updatedTask : t));
                              updateTaskAssignment(task._id, value);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select team member">
                                {task.assignedTo?.first_name || task.assignment?.assigned_to?.first_name || "Select team member"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {loadingTeamMembers ? (
                                <div className="p-2 text-center text-sm text-muted-foreground">
                                  Loading team members...
                                </div>
                              ) : teamMembers.length === 0 ? (
                                <div className="p-2 text-center text-sm text-muted-foreground">
                                  No team members found
                                </div>
                              ) : (
                                teamMembers.map((member) => (
                                  <SelectItem key={member._id} value={member._id.toString()}>
                                    <div className="flex items-center space-x-2">
                                      <span>{member.first_name}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {member.roles[0].name}
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          {/* {task.assignedTo && (
                            <div className="text-xs text-muted-foreground">
                              Skills: {task.assignedTo.skillTags.slice(0, 3).join(", ")}
                            </div>
                          )} */}
                        </div>

                        {/* <div className="space-y-2">
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
                        </div> */}

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
              ))
            )}
          </div>

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
                </div>                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Assign to</Label>
                    <Select
                      value={taskForm.assignedTo}
                      onValueChange={(value) => setTaskForm({ ...taskForm, assignedTo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingTeamMembers ? (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            Loading team members...
                          </div>
                        ) : teamMembers.length === 0 ? (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            No team members found
                          </div>
                        ) : (
                          teamMembers.map((member) => (
                            <SelectItem key={member._id} value={member._id.toString()}>
                              <div className="flex items-center space-x-2">
                                <span>{member.first_name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {member.roles[0].name}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
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
                </div>                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Assign to</Label>
                    <Select
                      value={taskForm.assignedTo}
                      onValueChange={(value) => setTaskForm({ ...taskForm, assignedTo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingTeamMembers ? (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            Loading team members...
                          </div>
                        ) : teamMembers.length === 0 ? (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            No team members found
                          </div>
                        ) : (
                          teamMembers.map((member) => (
                            <SelectItem key={member._id} value={member._id.toString()}>
                              <div className="flex items-center space-x-2">
                                <span>{member.first_name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {member.roles[0].name}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
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
      )}
    </DashboardLayout>
  )
}
