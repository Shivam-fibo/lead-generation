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
import { Upload, Mic, MicOff, FileText, Users, Target } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormSkeleton } from "@/components/loading-skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useGoals } from "@/hooks/use-goals"


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
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(defaultTeamMembers)
  const router = useRouter()
  const { toast } = useToast()
  const {
    goals,
    isLoading,
    createGoal,
    isCreatingGoal,
  } = useGoals()


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

  const findTeamMemberBySkill = (skill: string): TeamMember => {
    const member = teamMembers.find((m) => m.skillTags.some((tag) => tag.toLowerCase().includes(skill.toLowerCase())))
    return member || teamMembers[0] || defaultTeamMembers[0]
  }

  const findTeamMemberByRole = (role: string): TeamMember => {
    const member = teamMembers.find((m) => m.role.toLowerCase().includes(role.toLowerCase()))
    return member || teamMembers[0] || defaultTeamMembers[0]
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
      _id: "",
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
      // tasks: generatedTasks.map(task => task.title),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdAt: now,
      updatedAt: now,
      assignedTasksCount: generatedTasks.length,
      completedTasksCount: 0
    }
    createGoal(newGoal)    
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create New Goal</h1>
          <p className="text-muted-foreground">
            Define a high-level goal and let AI break it down into actionable tasks
          </p>
        </div>

        <Tabs defaultValue="input" className="space-y-6">
          <TabsList>
            <TabsTrigger value="input">Goal Input</TabsTrigger>
            <TabsTrigger value="tasks" disabled={generatedTasks.length === 0}>
              Generated Tasks ({generatedTasks.length})
            </TabsTrigger>
          </TabsList>

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
                  <div key={task.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      </div>
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>

                    <div className="space-y-2">
                      <Label>Assign to Team Member</Label>
                      <Select
                        value={task.assignedTo?.id.toString() || ""}
                        onValueChange={(value) => {
                          const member = teamMembers.find((m) => m.id.toString() === value) || null
                          setGeneratedTasks((prev) =>
                            prev.map((t) => (t.id === task.id ? { ...t, assignedTo: member } : t)),
                          )
                        }}
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
                  </div>
                ))}

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
      </div>
    </DashboardLayout>
  )
}
