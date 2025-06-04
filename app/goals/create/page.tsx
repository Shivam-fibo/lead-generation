"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { goalsApi } from "@/lib/api"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Mic, MicOff, FileText, Users, Target, Plus, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormSkeleton } from "@/components/loading-skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useGoals } from "@/hooks/use-goals"
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
import { useTeamMemberList } from "@/hooks/use-team"

interface User {
  _id: string
  username: string
  email: string
  first_name: string
  last_name: string
  number: string
  roles: { name: string; _id: string }[]
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
}

// Default team members as fallback
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

export default function CreateGoal() {
  const [user, setUser] = useState<User | null>(null)
  const [goalTitle, setGoalTitle] = useState("")
  const [goalDescription, setGoalDescription] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [generatedTasks, setGeneratedTasks] = useState<SubTask[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<SubTask | null>(null)
  const [newTaskForm, setNewTaskForm] = useState<SubTask>({
    id: 0,
    title: "",
    description: "",
    assignedTo: null,
    estimatedHours: 8,
    priority: "medium",
  })
  const router = useRouter()
  const { toast } = useToast()
  const { createGoal, isCreatingGoal } = useGoals()
  const { members: teamMembers, isLoading: loadingTeamMembers } = useTeamMemberList()


  // useEffect(() => {
  //   const currentUser = localStorage.getItem("currentUser")
  //   if (!currentUser) {
  //     router.push("/")
  //     return
  //   }

  //   const userData = JSON.parse(currentUser)
  //   setUser(userData)

  //   if (userData.role !== "CEO" && userData.role !== "Admin") {
  //     router.push("/dashboard")
  //     return
  //   }

  //   // Load team members from localStorage or use defaults
  //   const savedTeamMembers = localStorage.getItem("teamMembers")
  //   if (savedTeamMembers) {
  //     try {
  //       const parsedMembers = JSON.parse(savedTeamMembers)
  //       if (Array.isArray(parsedMembers) && parsedMembers.length > 0) {
  //         setTeamMembers(parsedMembers)
  //       }
  //     } catch (error) {
  //       console.error("Error parsing team members:", error)
  //       // Keep default team members
  //     }
  //   }

  //   setIsLoading(false)
  // }, [router])

  const handleVoiceInput = () => {
    if (!isRecording) {
      setIsRecording(true)
      // Simulate voice recording
      setTimeout(() => {
        setIsRecording(false)
        setGoalDescription(
          (prev) =>
            prev +
            " [Voice input: Implement new customer onboarding system with automated email sequences and user training modules]",
        )
      }, 3000)
    } else {
      setIsRecording(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }
  const findTeamMemberBySkill = (skill: string): any => {
    if (!teamMembers) return null;
    return teamMembers.find((m) => m.roles.some((role) => role.name.toLowerCase().includes(skill.toLowerCase()))) || null;
  }

  const findTeamMemberByRole = (role: string): any => {
    if (!teamMembers) return null;
    return teamMembers.find((m) => m.roles[0].name.toLowerCase().includes(role.toLowerCase())) || null;
  }

  const generateTasks = async () => {
    setIsGenerating(true)

    // Simulate AI task generation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Ensure we have team members to assign tasks to
    const availableMembers = teamMembers.length > 0 ? teamMembers : defaultTeamMembers

    const mockTasks: SubTask[] = [
      {
        id: 1,
        title: "Design User Interface",
        description: "Create wireframes and mockups for the onboarding flow",
        assignedTo: findTeamMemberBySkill("Design"),
        estimatedHours: 16,
        priority: "high",
      },
      {
        id: 2,
        title: "Develop Backend API",
        description: "Build REST API endpoints for user registration and email automation",
        assignedTo: findTeamMemberBySkill("Backend"),
        estimatedHours: 24,
        priority: "high",
      },
      {
        id: 3,
        title: "Frontend Implementation",
        description: "Implement the onboarding UI components and user flows",
        assignedTo: findTeamMemberBySkill("Frontend"),
        estimatedHours: 20,
        priority: "medium",
      },
      {
        id: 4,
        title: "Email Template Creation",
        description: "Design and code responsive email templates for the sequence",
        assignedTo: findTeamMemberBySkill("Design"),
        estimatedHours: 12,
        priority: "medium",
      },
      {
        id: 5,
        title: "Testing & QA",
        description: "Comprehensive testing of the onboarding system",
        assignedTo: findTeamMemberByRole("Team Leader"),
        estimatedHours: 16,
        priority: "low",
      },
    ]

    setGeneratedTasks(mockTasks)
    setIsGenerating(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('checking submit')
    const now = "date"
    const newGoal = {
      title: goalTitle,
      description: goalDescription,
      priority: "medium" as const,
      status: "pending" as const,
      created_by: "",
      tags: [],
      attachments: uploadedFiles.map(file => ({
        filename: file.name,
        url: URL.createObjectURL(file),
        uploaded_at: new Date()
      })),
      tasks: generatedTasks.map(task => task),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
      createdAt: now,
      updatedAt: now,
      assignedTasksCount: generatedTasks.length,
      completedTasksCount: 0
    }

    console.log("newGoal", newGoal);
    
    createGoal(newGoal)
    router.push("/goals")
  }

  const handleAddNewTask = () => {
    const newTask = {
      ...newTaskForm,
      id: generatedTasks.length + 1,
    }
    setGeneratedTasks((prev) => [...prev, newTask])
    setNewTaskForm({
      id: 0,
      title: "",
      description: "",
      assignedTo: null,
      estimatedHours: 8,
      priority: "medium",
    })
    setShowAddTaskDialog(false)
  }

  const handleEditTask = () => {
    if (!taskToEdit) return
    setGeneratedTasks(prev =>
      prev.map(task => task.id === taskToEdit.id ? { ...taskToEdit } : task)
    )
    setTaskToEdit(null)
    setShowEditDialog(false)
  }

  const handleDeleteTask = () => {
    if (taskToDelete === null) return
    setGeneratedTasks(prev => prev.filter(task => task.id !== taskToDelete))
    setTaskToDelete(null)
    setShowDeleteDialog(false)
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

  // if (isLoading) {
  //   return (
  //     <DashboardLayout>
  //       <FormSkeleton />
  //     </DashboardLayout>
  //   )
  // }
  //   if (!user) {
  //     return null
  //   }

  const openEditDialog = showEditDialog && taskToEdit ? true : false;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create New Goal</h1>
          <p className="text-muted-foreground">
            Define a high-level goal and let AI break it down into actionable tasks
          </p>
        </div>        <Tabs defaultValue="input" className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="input">Goal Input</TabsTrigger>
              <TabsTrigger value="tasks" disabled={generatedTasks.length === 0}>
                Generated Tasks ({generatedTasks.length})
              </TabsTrigger>
            </TabsList>
            {generatedTasks.length > 0 && (
              <Button
                onClick={() => setShowAddTaskDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Task
              </Button>
            )}
          </div>

          <TabsContent value="input" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Goal Information</CardTitle>
                <CardDescription>Provide the basic information about your goal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter a clear, concise goal title"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Goal Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your goal in detail. What do you want to achieve?"
                    value={goalDescription}
                    onChange={(e) => setGoalDescription(e.target.value)}
                    rows={4}
                  />
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleVoiceInput}
                      className={isRecording ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800" : ""}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="mr-2 h-4 w-4 text-red-500" />
                          Recording...
                        </>
                      ) : (
                        <>
                          <Mic className="mr-2 h-4 w-4" />
                          Voice Input
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Meeting Notes & Documents</CardTitle>
                <CardDescription>Upload meeting notes, documents, or other relevant files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium">Upload files or drag and drop</span>
                      <span className="mt-1 block text-sm text-muted-foreground">PDF, DOCX, TXT up to 10MB</span>
                    </label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      multiple
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Files</Label>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Task Generation</CardTitle>
                <CardDescription>
                  Generate subtasks and delegate them to team members based on their skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={generateTasks}
                  disabled={!goalTitle || !goalDescription || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Target className="mr-2 h-4 w-4 animate-spin" />
                      Generating Tasks...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-4 w-4" />
                      Generate Tasks with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Generated Tasks & Assignments</span>
                </CardTitle>
                <CardDescription>
                  AI has analyzed your goal and created these subtasks with optimal team assignments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 space-y-3">                    <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setTaskToEdit(task)
                        setShowEditDialog(true)
                      }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" /></svg>
                      </Button>                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this task.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTask(task.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-4 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div className="text-muted-foreground">Est. {task.estimatedHours}h</div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {task.assignedTo?.skillTags?.slice(0, 2).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        )) || (
                            <Badge variant="secondary" className="text-xs">
                              No Skills
                            </Badge>
                          )}
                      </div>
                    </div> */}

                    <div className="space-y-2">
                      <Label>Assign to</Label>
                      <Select
                        value={task.assignedTo?._id || ""}
                        onValueChange={(value) => {
                          const member = teamMembers?.find((m) => m._id === value) || null;
                          setGeneratedTasks((prev) =>
                            prev.map((t) => (t.id === task.id ? { ...t, assignedTo: member } : t))
                          );
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select team member">
                            {task.assignedTo ? task.assignedTo.first_name : "Select team member"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {loadingTeamMembers ? (
                            <div className="p-2 text-center text-sm text-muted-foreground">
                              Loading team members...
                            </div>
                          ) : !teamMembers?.length ? (
                            <div className="p-2 text-center text-sm text-muted-foreground">
                              No team members found
                            </div>
                          ) : (
                            teamMembers.map((member) => (
                              <SelectItem key={member._id} value={member._id}>
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
                  </div>))}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Total estimated time: {generatedTasks.reduce((sum, task) => sum + task.estimatedHours, 0)} hours
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => router.push("/goals")}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmit}>Create Goal & Assign Tasks</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Task Dialog */}


        <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>Create a new task for this goal.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-task-title">Task Title</Label>
                <Input
                  id="new-task-title"
                  placeholder="Enter task title"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-task-description">Task Description</Label>
                <Textarea
                  id="new-task-description"
                  placeholder="Describe the task in detail"
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1">
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select
                    value={newTaskForm.assignedTo?._id || ""}
                    onValueChange={(value) => {
                      const member = teamMembers?.find((m) => m._id === value) || null;
                      setNewTaskForm((prev) => ({ ...prev, assignedTo: member }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member">
                        {newTaskForm.assignedTo ? newTaskForm.assignedTo.first_name : "Select team member"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {loadingTeamMembers ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          Loading team members...
                        </div>
                      ) : !teamMembers?.length ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          No team members found
                        </div>
                      ) : (
                        teamMembers.map((member) => (
                          <SelectItem key={member._id} value={member._id}>
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

                {/* <div className="space-y-2">
                  <Label htmlFor="new-task-estimated-hours">Estimated Hours</Label>
                  <Input
                    id="new-task-estimated-hours"
                    type="number"
                    placeholder="e.g. 8"
                    value={newTaskForm.estimatedHours}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, estimatedHours: Number(e.target.value) })}
                  />
                </div> */}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-task-priority">Priority</Label>
                <Select
                  id="new-task-priority"
                  value={newTaskForm.priority}
                  onValueChange={(value) => setNewTaskForm({ ...newTaskForm, priority: value as "low" | "medium" | "high" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddTaskDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddNewTask}>
                Add Task
              </Button>
            </DialogFooter>

          </DialogContent>
        </Dialog>



        {taskToEdit && <Dialog open={openEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>Update the task information.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Task Title</Label>
                <Input
                  placeholder="Enter task title"
                  value={taskToEdit.title}
                  onChange={(e) => setTaskToEdit({ ...taskToEdit, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Task Description</Label>
                <Textarea
                  placeholder="Describe the task in detail"
                  value={taskToEdit.description}
                  onChange={(e) => setTaskToEdit({ ...taskToEdit, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1">
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select
                    value={taskToEdit.assignedTo?._id || ""}
                    onValueChange={(value) => {
                      const member = teamMembers?.find((m) => m._id === value) || null;
                      setTaskToEdit({ ...taskToEdit, assignedTo: member });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member">
                        {taskToEdit.assignedTo ? taskToEdit.assignedTo.first_name : "Select team member"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {loadingTeamMembers ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          Loading team members...
                        </div>
                      ) : !teamMembers?.length ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          No team members found
                        </div>
                      ) : (
                        teamMembers.map((member) => (
                          <SelectItem key={member._id} value={member._id}>
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
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={taskToEdit.priority}
                  onValueChange={(value) => setTaskToEdit({ ...taskToEdit, priority: value as "low" | "medium" | "high" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setTaskToEdit(null)
                setShowEditDialog(false)
              }}>
                Cancel
              </Button>
              <Button onClick={handleEditTask}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>}      </div>
    </DashboardLayout>
  )
}
