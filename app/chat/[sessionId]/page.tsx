"use client"

import { useEffect, useState, useRef } from "react"

import { useParams, useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { LoadingScreen } from "@/components/loading-screen"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Bot,
    Send,
    Target,
    Users,
    CheckCircle,
    Edit,
    Trash2,
    Save,
    Eye,
    ChevronRight,
    ChevronLeft,
    Calendar,
    Clock,
} from "lucide-react"

import { useAiMessage } from "@/hooks/use-assistant"
import { useAiSession } from "@/hooks/use-ai-session"
import { useQueryClient } from "@tanstack/react-query"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTeamMemberList } from "@/hooks/use-team"
import { useAITasks } from "@/hooks/use-ai-tasks"

interface UserType {
    id: number
    email: string
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

interface AITask {
    id: string
    title: string
    description: string
    assignedTo: TeamMember | null
    estimatedHours: number
    priority: "low" | "medium" | "high"
    dependencies: string[]
    skills: string[]
}

interface AIGoal {
    id: string
    title: string
    description: string
    tasks: AITask[]
    estimatedDuration: string
    totalHours: number
}

interface ChatMessage {
    id: string
    type: "user" | "ai"
    content: string
    timestamp: Date
    goal?: AIGoal
}

interface ChatSession {
    id: string
    title: string
    messages: ChatMessage[]
    createdAt: Date
    lastActivity: Date
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

]

export default function AIAssistant() {
    const [user, setUser] = useState<UserType | null>(null)
    // const [teamMembers, setTeamMembers] = useState<TeamMember[]>(defaultTeamMembers)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputMessage, setInputMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    // const [currentGoal, setCurrentGoal] = useState<AIGoal | null>(null)
    const [showApprovalDialog, setShowApprovalDialog] = useState(false)
    const [editingTask, setEditingTask] = useState<any | null>(null)
    const [viewingTask, setViewingTask] = useState<AITask | null>(null)
    const [isPageLoading, setIsPageLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [sidebarTab, setSidebarTab] = useState<"history" | "tasks">("tasks")
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
    const [currentSessionId, setCurrentSessionId] = useState<string>("")
    const queryClient = useQueryClient()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const router = useRouter()
    const { sessionId } = useParams<{ sessionId: string }>();

    const { members: teamMembers, isLoading: loadingTeamMembers } = useTeamMemberList()

    const {
        createSession,
        currentSession,
        isSessionLoading,
        sendMessageToSession,
        approveAiGoal
    } = useAiSession(sessionId, {
        enableQueries: false
    })

    const {
        createAiTask,
        updateAiTask,
        deleteAiTask,
        assignAiTask,
        // isUpdatingAiTask,
        // isSavingAiTasks,
        // isDeletingAiTask,
        // isAssigningAiTask,
    } = useAITasks()

    const currentGoal = currentSession?.ai_goal;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    useEffect(() => {
        const currentUser = localStorage.getItem("currentUser")
        if (!currentUser) {
            // router.push("/")
            return
        }

        const userData = JSON.parse(currentUser)
        setUser(userData)

        if (userData.role !== "CEO" && userData.role !== "Admin" && userData.role !== "Team Leader") {
            // router.push("/dashboard")
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

        // Load chat sessions
        const savedSessions = localStorage.getItem("aiChatSessions")
        if (savedSessions) {
            try {
                const sessions = JSON.parse(savedSessions).map((session: any) => ({
                    ...session,
                    createdAt: new Date(session.createdAt),
                    lastActivity: new Date(session.lastActivity),
                    messages: session.messages.map((msg: any) => ({
                        ...msg,
                        timestamp: new Date(msg.timestamp),
                    })),
                }))
                setChatSessions(sessions)
            } catch (error) {
                console.error("Error parsing chat sessions:", error)
            }
        }

        // Create new session
        startNewSession()
        setIsPageLoading(false)
    }, [router])

    const startNewSession = () => {
        createSession(
            { title: "New AI Chat" },
            {
                onSuccess: (newSession) => {
                    router.push(`/chat/${newSession._id}`)
                }
            }
        )
    }

    const saveCurrentSession = () => {
        if (!currentSessionId) return

        const updatedSessions = chatSessions.map(session =>
            session.id === currentSessionId
                ? { ...session, messages, lastActivity: new Date() }
                : session
        )

        setChatSessions(updatedSessions)
        localStorage.setItem("aiChatSessions", JSON.stringify(updatedSessions))
    }

    const loadSession = (sessionId: string) => {
        const session = chatSessions.find(s => s.id === sessionId)
        if (session) {
            setCurrentSessionId(sessionId)
            setMessages(session.messages)

            // Find the last goal in the session
            const lastGoalMessage = [...session.messages].reverse().find(msg => msg.goal)
            if (lastGoalMessage?.goal) {
                setCurrentGoal(lastGoalMessage.goal)
            } else {
                setCurrentGoal(null)
            }
        }
    }

    const findBestTeamMember = (skills: string[]): TeamMember | null => {
        let bestMatch = null
        let maxMatches = 0

        for (const member of teamMembers) {
            const matches = skills.filter((skill) =>
                member.skillTags.some((tag) => tag.toLowerCase().includes(skill.toLowerCase())),
            ).length

            if (matches > maxMatches) {
                maxMatches = matches
                bestMatch = member
            }
        }

        return bestMatch || teamMembers[0] || null
    }

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;
        sendMessageToSession({ message: inputMessage, sessionId },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({
                        queryKey: ["sessionMessages", sessionId]
                    })
                }
            }
        )
        setInputMessage("")
    }

    const handleTaskEdit = (task: AITask) => {
        setEditingTask(task)
    }

    const handleTaskView = (task: AITask) => {
        setViewingTask(task)
    }

    const handleTaskUpdate = (updatedTask: AITask) => {
        if (!currentGoal) return
        updateAiTask({
            taskId: editingTask._id,
            task: updatedTask
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ["sessionMessages", sessionId]
                })
            }
        })
        setEditingTask(null)
    }

    // const updateAiTaskAssignment = (taskId: string, memberId: string) => {
    //     assignAiTask(
    //         { task_id: taskId, assigned_to: memberId },
    //         {
    //             onSuccess: (response) => {
    //                 setEditingTask(prev => ({
    //                     ...prev,
    //                     assignment: response.taskAssign
    //                 }));
    //                 queryClient.invalidateQueries({
    //                     queryKey: ["sessionMessages", sessionId]
    //                 });
    //             }
    //         }
    //     )
    // }

    const handleTaskDelete = (taskId: string) => {
        if (!currentGoal) return
        deleteAiTask(taskId, {
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: ["sessionMessages", sessionId]
                })
            }
        })
    }

    const handleApproveGoal = () => {
        if (!currentGoal || !user) return
        approveAiGoal(currentGoal)
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

    // if (!user && isPageLoading) {
    //     return <LoadingScreen />
    // }

    // if (!user) {
    //     return null
    // }

    console.log('editingTask', editingTask)

    return (
        <DashboardLayout breadcrumbs={[{ label: "AI Assistant" }]}>
            <div className="space-y-6">

                <div className="flex gap-4 h-[calc(100vh-100px)]">
                    {/* Chat Interface */}
                    <div className="flex-1 min-w-0">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="flex-shrink-0 pb-3">
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Bot className="h-5 w-5" />
                                        <span className="hidden sm:inline">{currentSession?.session?.title}</span>
                                        <span className="sm:hidden">AI Chat</span>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={startNewSession}>
                                        <span className="hidden sm:inline">New Chat</span>
                                        <span className="sm:hidden">New</span>
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col min-h-0 space-y-4 px-3 sm:px-6 pb-4">
                                <ScrollArea className="flex-1 pr-2 sm:pr-4">
                                    <div className="space-y-4 pb-4">
                                        {currentSession && currentSession?.chats.map((message) => (
                                            <div key={message._id}>
                                                <div
                                                    key={`${message._id}-user`}
                                                    className={`flex justify-end`}
                                                >
                                                    <div
                                                        className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 bg-primary text-primary-foreground`}
                                                    >
                                                        <div className="flex items-start space-x-2">

                                                            <div className="flex-1 min-w-0">
                                                                <div className="whitespace-pre-wrap text-sm break-words">{message.userMessage}</div>
                                                                {/* <div className="text-xs opacity-70 mt-1">{message.createdAt.toLocaleTimeString()}</div> */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div
                                                    key={`${message._id}-ai`}
                                                    className={`flex justify-start`}
                                                >
                                                    <div
                                                        className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 bg-muted text-muted-foreground`}
                                                    >
                                                        <div className="flex items-start space-x-2">
                                                            <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="whitespace-pre-wrap text-sm break-words">{message.aiMessage}</div>
                                                                {/* <div className="text-xs opacity-70 mt-1">{message.createdAt.toLocaleTimeString()}</div> */}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        ))}
                                        {isLoading && (
                                            <div className="flex justify-start">
                                                <div className="bg-muted text-muted-foreground rounded-lg p-3">
                                                    <div className="flex items-center space-x-2">
                                                        <Bot className="h-4 w-4" />
                                                        <div className="flex space-x-1">
                                                            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                                                            <div
                                                                className="w-2 h-2 bg-current rounded-full animate-bounce"
                                                                style={{ animationDelay: "0.1s" }}
                                                            ></div>
                                                            <div
                                                                className="w-2 h-2 bg-current rounded-full animate-bounce"
                                                                style={{ animationDelay: "0.2s" }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </ScrollArea>

                                <div className="flex-shrink-0 flex space-x-2">
                                    <Input
                                        placeholder="Ask me to create a project, delegate tasks, or anything else..."
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        // onKeyPress={(e) => e.key === "Enter" && handleSendMessage(e)}
                                        disabled={isSessionLoading}
                                        className="flex-1 text-sm"
                                    />
                                    <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()} size="sm">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Toggle Sidebar */}
                    <div className={`transition-all duration-300 flex-shrink-0 ${sidebarOpen ? 'w-80 sm:w-96' : 'w-10 sm:w-12'}`}>
                        <Card className="h-full flex flex-col">
                            <CardHeader className="flex-shrink-0 pb-3">
                                <div className="flex items-center justify-between">
                                    {sidebarOpen && (
                                        <div className="flex space-x-1">
                                            <Button
                                                variant={sidebarTab === "tasks" ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setSidebarTab("tasks")}
                                                className="text-xs px-2"
                                            >
                                                Goals & Tasks
                                            </Button>
                                            {/* <Button
                                                variant={sidebarTab === "history" ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setSidebarTab("history")}
                                                className="text-xs px-2"
                                            >
                                                History
                                            </Button> */}
                                        </div>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSidebarOpen(!sidebarOpen)}
                                        className="p-1 h-8 w-8"
                                    >
                                        {sidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </CardHeader>

                            {sidebarOpen && (
                                <CardContent className="flex-1 min-h-0 px-3 sm:px-6 pb-4">
                                    {sidebarTab === "tasks" && (
                                        <div className="space-y-4 h-full flex flex-col">
                                            {currentGoal ? (
                                                <>
                                                    <div className="flex-shrink-0">
                                                        <h3 className="font-semibold text-base sm:text-lg truncate">{currentGoal.title}</h3>
                                                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{currentGoal.description}</p>
                                                    </div>

                                                    {/* <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm flex-shrink-0">
                                                        <div>
                                                            <div className="font-medium">Duration</div>
                                                            <div className="text-muted-foreground truncate">{currentGoal.estimatedDuration}</div>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">Total Hours</div>
                                                            <div className="text-muted-foreground">{currentGoal.totalHours}h</div>
                                                        </div>
                                                    </div> */}

                                                    <Separator className="flex-shrink-0" />

                                                    <div className="flex-1 min-h-0 flex flex-col">
                                                        <div className="flex items-center justify-between mb-3 flex-shrink-0">
                                                            <h4 className="font-medium text-sm">Tasks ({currentGoal.tasks.length})</h4>
                                                        </div>

                                                        <div className="flex-1 min-h-0 overflow-hidden">
                                                            <ScrollArea className="h-full">
                                                                <div className="space-y-3 pr-2 sm:pr-4">
                                                                    {currentGoal.tasks.map((task, index) => (
                                                                        <div key={task._id} className="border rounded-lg p-2 sm:p-3 space-y-2">
                                                                            <div className="flex items-start justify-between">
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="flex items-center space-x-2">
                                                                                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded flex-shrink-0">{index + 1}</span>
                                                                                        <h5 className="font-medium text-xs sm:text-sm truncate">{task.title}</h5>
                                                                                    </div>
                                                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex items-center justify-between text-xs">
                                                                                <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                                                                                    <Badge className={`${getPriorityColor(task.priority)} text-xs px-1`}>{task.priority}</Badge>
                                                                                    {/* <span className="text-muted-foreground flex-shrink-0">{task.estimatedHours}h</span> */}
                                                                                </div>

                                                                                {task?.assignment?.assigned_to?._id && (
                                                                                    <div className="flex items-center space-x-1 min-w-0">
                                                                                        <Users className="h-3 w-3 flex-shrink-0" />
                                                                                        <span className="truncate max-w-16 sm:max-w-20">{task?.assignment?.assigned_to.first_name}</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>

                                                                            <div className="flex space-x-1">
                                                                                <Button variant="ghost" size="sm" onClick={() => handleTaskView(task)} className="h-6 w-6 p-0">
                                                                                    <Eye className="h-3 w-3" />
                                                                                </Button>
                                                                                <Button variant="ghost" size="sm" onClick={() => handleTaskEdit(task)} className="h-6 w-6 p-0">
                                                                                    <Edit className="h-3 w-3" />
                                                                                </Button>
                                                                                <Button variant="ghost" size="sm" onClick={() => handleTaskDelete(task._id)} className="h-6 w-6 p-0">
                                                                                    <Trash2 className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>

                                                                            {/* {task.dependencies.length > 0 && (
                                                                                <div className="text-xs text-muted-foreground">
                                                                                    <span>
                                                                                        Depends on: Task{" "}
                                                                                        {task.dependencies
                                                                                            .map((dep) => currentGoal.tasks.findIndex((t) => t.id === dep) + 1)
                                                                                            .join(", ")}
                                                                                    </span>
                                                                                </div>
                                                                            )} */}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </ScrollArea>
                                                        </div>
                                                    </div>

                                                    <Button onClick={() => setShowApprovalDialog(true)} className="w-full flex-shrink-0 text-sm">
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        <span className="hidden sm:inline">Approve & Create Goal</span>
                                                        <span className="sm:hidden">Approve Goal</span>
                                                    </Button>
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                                                    <div>
                                                        <Target className="h-8 sm:h-12 w-8 sm:w-12 mx-auto mb-4 opacity-50" />
                                                        <p className="text-xs sm:text-sm">No active goal</p>
                                                        <p className="text-xs">Ask AI to create a project to see tasks here</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {sidebarTab === "history" && (
                                        <div className="space-y-4 h-full flex flex-col">
                                            <div className="flex items-center justify-between flex-shrink-0">
                                                <h4 className="font-medium text-sm">Chat History</h4>
                                                <Button variant="outline" size="sm" onClick={startNewSession} className="text-xs px-2">
                                                    <span className="hidden sm:inline">New Chat</span>
                                                    <span className="sm:hidden">New</span>
                                                </Button>
                                            </div>

                                            <div className="flex-1 min-h-0 overflow-hidden">
                                                <ScrollArea className="h-full">
                                                    <div className="space-y-2 pr-2 sm:pr-4">
                                                        {chatSessions.map((session) => (
                                                            <div
                                                                key={session.id}
                                                                className={`p-2 sm:p-3 rounded-lg border cursor-pointer transition-colors ${session.id === currentSessionId
                                                                    ? "bg-primary/10 border-primary"
                                                                    : "hover:bg-muted"
                                                                    }`}
                                                                onClick={() => loadSession(session.id)}
                                                            >
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex-1 min-w-0">
                                                                        <h5 className="font-medium text-xs sm:text-sm truncate">{session.title}</h5>
                                                                        <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-muted-foreground mt-1">
                                                                            <Calendar className="h-3 w-3 flex-shrink-0" />
                                                                            <span className="truncate">{session.createdAt.toLocaleDateString()}</span>
                                                                            <Clock className="h-3 w-3 flex-shrink-0" />
                                                                            <span className="truncate">{session.lastActivity.toLocaleTimeString()}</span>
                                                                        </div>
                                                                        <p className="text-xs text-muted-foreground mt-1">
                                                                            {session.messages.length} messages
                                                                        </p>
                                                                    </div>
                                                                    {session.id === currentSessionId && (
                                                                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            )}
                        </Card>
                    </div>
                </div>

                {/* Task View Dialog */}
                {viewingTask && (
                    <Dialog open={!!viewingTask} onOpenChange={() => setViewingTask(null)}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Task Details</DialogTitle>
                                <DialogDescription>Complete information about this task</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg">{viewingTask.title}</h3>
                                    <p className="text-muted-foreground mt-1">{viewingTask.description}</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Priority</label>
                                        <div className="mt-1">
                                            <Badge className={getPriorityColor(viewingTask.priority)}>{viewingTask.priority}</Badge>
                                        </div>
                                    </div>
                                    {/* <div>
                                        <label className="text-sm font-medium">Estimated Hours</label>
                                        <div className="mt-1 text-sm">{viewingTask.estimatedHours} hours</div>
                                    </div> */}
                                </div>

                                {viewingTask?.assignment?.assigned_to?.first_name && (
                                    <div>
                                        <label className="text-sm font-medium">Assigned To</label>
                                        <div className="mt-1 p-3 bg-muted rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                                                    {viewingTask?.assignment?.assigned_to?.first_name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium truncate">{viewingTask?.assignment?.assigned_to?.first_name}</div>
                                                    {/* <div className="text-sm text-muted-foreground truncate">{viewingTask.assignedTo.role} • {viewingTask.assignedTo.department}</div> */}
                                                </div>
                                            </div>
                                            {/* <div className="mt-2">
                                                <div className="text-sm font-medium">Skills:</div>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {viewingTask.assignedTo.skillTags.map((skill) => (
                                                        <Badge key={skill} variant="secondary" className="text-xs">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div> */}
                                        </div>
                                    </div>
                                )}

                                {/* {viewingTask.skills.length > 0 && (
                                    <div>
                                        <label className="text-sm font-medium">Required Skills</label>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {viewingTask.skills.map((skill) => (
                                                <Badge key={skill} variant="outline" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )} */}

                                {/* {viewingTask.dependencies.length > 0 && currentGoal && (
                                    <div>
                                        <label className="text-sm font-medium">Dependencies</label>
                                        <div className="mt-1 space-y-1">
                                            {viewingTask.dependencies.map((depId) => {
                                                const depTask = currentGoal.tasks.find(t => t.id === depId)
                                                const taskIndex = currentGoal.tasks.findIndex(t => t.id === depId) + 1
                                                return depTask ? (
                                                    <div key={depId} className="text-sm p-2 bg-muted rounded">
                                                        Task {taskIndex}: {depTask.title}
                                                    </div>
                                                ) : null
                                            })}
                                        </div>
                                    </div>
                                )} */}
                            </div>

                            <DialogFooter className="flex-col sm:flex-row gap-2">
                                <Button variant="outline" onClick={() => setViewingTask(null)} className="w-full sm:w-auto">
                                    Close
                                </Button>
                                <Button onClick={() => {
                                    setViewingTask(null)
                                    handleTaskEdit(viewingTask)
                                }} className="w-full sm:w-auto">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Task
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}

                {/* Task Edit Dialog */}
                {editingTask && (
                    <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Edit Task</DialogTitle>
                                <DialogDescription>Modify the task details below</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Title</label>
                                    <Input
                                        value={editingTask.title}
                                        onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea
                                        value={editingTask.description}
                                        onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* <div className="space-y-2">
                                        <label className="text-sm font-medium">Estimated Hours</label>
                                        <Input
                                            type="number"
                                            value={editingTask.estimatedHours}
                                            onChange={(e) =>
                                                setEditingTask({ ...editingTask, estimatedHours: Number.parseInt(e.target.value) || 0 })
                                            }
                                        />
                                    </div> */}

                                    <div className="space-y-2">
                                        <Label>Priority</Label>
                                        <Select
                                            value={editingTask.priority}
                                            onValueChange={(value) => setEditingTask({ ...editingTask, priority: value as "low" | "medium" | "high" })}
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

                                {/* <div className="space-y-2">
                                    <label className="text-sm font-medium">Assigned To</label>
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={editingTask.assignedTo?.id || ""}
                                        onChange={(e) => {
                                            const member = teamMembers.find((m) => m.id === Number.parseInt(e.target.value)) || null
                                            setEditingTask({ ...editingTask, assignedTo: member })
                                        }}
                                    >
                                        <option value="">Unassigned</option>
                                        {teamMembers.map((member) => (
                                            <option key={member.id} value={member.id}>
                                                {member.name} ({member.role})
                                            </option>
                                        ))}
                                    </select>
                                </div> */}

                                <div className="space-y-2">
                                    <Label>Assign to</Label>
                                    <Select
                                        value={editingTask.assignedTo?._id || editingTask?.assignment?.assigned_to._id.toString() || ""}
                                        onValueChange={(value) => {
                                            const member = teamMembers?.find((m) => {
                                                console.log('member', m)
                                                return m._id === value
                                            }) || null;
                                            setEditingTask({ ...editingTask, assignedTo: member })
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select team member">
                                                {
                                                    editingTask?.assignedTo?.first_name ||
                                                    editingTask?.assignment?.assigned_to?.first_name ||
                                                    "Select team member"
                                                }
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

                            <DialogFooter className="flex-col sm:flex-row gap-2">
                                <Button variant="outline" onClick={() => setEditingTask(null)} className="w-full sm:w-auto">
                                    Cancel
                                </Button>
                                <Button onClick={() => handleTaskUpdate(editingTask)} className="w-full sm:w-auto">
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}

                {/* Approval Dialog */}
                <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Approve Goal Creation</DialogTitle>
                            {/* <DialogDescription>
                                Review the goal and tasks before creating them in your project management system.
                            </DialogDescription> */}
                        </DialogHeader>

                        {currentGoal && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg">{currentGoal.title}</h3>
                                    <p className="text-muted-foreground">{currentGoal.description}</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                    <div className="text-center p-3 bg-muted rounded">
                                        <div className="font-semibold">{currentGoal.tasks.length}</div>
                                        <div className="text-muted-foreground">Tasks</div>
                                    </div>
                                    {/* <div className="text-center p-3 bg-muted rounded"> */}
                                        {/* <div className="font-semibold">{currentGoal.totalHours}h</div>
                                        <div className="text-muted-foreground">Total Hours</div> */}
                                    {/* </div> */}
                                    {/* <div className="text-center p-3 bg-muted rounded">
                                        <div className="font-semibold">{currentGoal.estimatedDuration}</div>
                                        <div className="text-muted-foreground">Duration</div>
                                    </div> */}
                                </div>

                                <div>
                                    <h4 className="font-medium mb-2">Task Summary:</h4>
                                    <ScrollArea className="max-h-48">
                                        <div className="space-y-2 pr-4">
                                            {currentGoal.tasks.map((task, index) => (
                                                <div key={task.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                                                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                                                        <span className="bg-background px-2 py-1 rounded text-xs flex-shrink-0">{index + 1}</span>
                                                        <span className="truncate">{task.title}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 flex-shrink-0">
                                                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                                                        <span className="text-muted-foreground truncate max-w-16 sm:max-w-24">{task.assignment?.assigned_to?.first_name || "Unassigned"}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button variant="outline" onClick={() => setShowApprovalDialog(false)} className="w-full sm:w-auto">
                                Cancel
                            </Button>
                            <Button onClick={handleApproveGoal} className="w-full sm:w-auto">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Create Goal & Tasks
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}
