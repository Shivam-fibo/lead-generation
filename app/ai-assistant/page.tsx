"use client"

import { useEffect, useState, useRef } from "react"

import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { LoadingScreen } from "@/components/loading-screen"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(defaultTeamMembers)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [inputMessage, setInputMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [currentGoal, setCurrentGoal] = useState<AIGoal | null>(null)
    const [showApprovalDialog, setShowApprovalDialog] = useState(false)
    const [editingTask, setEditingTask] = useState<AITask | null>(null)
    const [viewingTask, setViewingTask] = useState<AITask | null>(null)
    const [isPageLoading, setIsPageLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [sidebarTab, setSidebarTab] = useState<"history" | "tasks">("tasks")
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
    const [currentSessionId, setCurrentSessionId] = useState<string>("")
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const router = useRouter()

    useEffect(() => {
        startNewSession()
    }, [])

    const {
        data: goal,
        isLoading: isGoalLoading,
        error: goalError,
        isSuccess,
        isFetched,
        isRefetching
    } = useAiMessage()

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
        const sessionId = `session_${Date.now()}`
        const welcomeMessage: ChatMessage = {
            id: "welcome",
            type: "ai",
            content:
                "Hello! I'm your AI Assistant. I can help you create goals, break them down into tasks, and delegate them to your team members. What would you like to accomplish today?",
            timestamp: new Date(),
        }

        const newSession: ChatSession = {
            id: sessionId,
            title: "New Chat",
            messages: [welcomeMessage],
            createdAt: new Date(),
            lastActivity: new Date(),
        }

        setCurrentSessionId(sessionId)
        setMessages([welcomeMessage])
        setChatSessions(prev => [newSession, ...prev])
        setCurrentGoal(null)
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



    const generateAIResponse = async (userMessage: string): Promise<{ content: string; goal?: AIGoal }> => {
        // Simulate AI processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000))

        const lowerMessage = userMessage.toLowerCase()

        // Check if user is asking to create a goal/project
        if (
            lowerMessage.includes("create") ||
            lowerMessage.includes("build") ||
            lowerMessage.includes("develop") ||
            lowerMessage.includes("implement") ||
            lowerMessage.includes("launch")
        ) {
            // Generate a goal with tasks based on the user's request
            const goalId = `goal_${Date.now()}`

            let goalTitle = ""
            let goalDescription = ""
            let tasks: AITask[] = []

            if (lowerMessage.includes("website") || lowerMessage.includes("web app")) {
                goalTitle = "Website Development Project"
                goalDescription = "Create a modern, responsive website with full functionality"
                tasks = [
                    {
                        id: `${goalId}_task_1`,
                        title: "UI/UX Design",
                        description: "Create wireframes, mockups, and user interface designs",
                        assignedTo: findBestTeamMember(["design", "ui", "ux"]),
                        estimatedHours: 20,
                        priority: "high",
                        dependencies: [],
                        skills: ["Design", "UI/UX", "Figma"],
                    },
                    {
                        id: `${goalId}_task_2`,
                        title: "Frontend Development",
                        description: "Implement the user interface using React and modern web technologies",
                        assignedTo: findBestTeamMember(["frontend", "react"]),
                        estimatedHours: 32,
                        priority: "high",
                        dependencies: [`${goalId}_task_1`],
                        skills: ["Frontend", "React", "TypeScript"],
                    },
                    {
                        id: `${goalId}_task_3`,
                        title: "Backend API Development",
                        description: "Build REST API endpoints and database integration",
                        assignedTo: findBestTeamMember(["backend", "api"]),
                        estimatedHours: 28,
                        priority: "high",
                        dependencies: [],
                        skills: ["Backend", "Node.js", "Database"],
                    },
                    {
                        id: `${goalId}_task_4`,
                        title: "Testing & Quality Assurance",
                        description: "Comprehensive testing including unit tests and integration tests",
                        assignedTo: findBestTeamMember(["testing", "qa"]),
                        estimatedHours: 16,
                        priority: "medium",
                        dependencies: [`${goalId}_task_2`, `${goalId}_task_3`],
                        skills: ["Testing", "QA", "Automation"],
                    },
                    {
                        id: `${goalId}_task_5`,
                        title: "Deployment & Launch",
                        description: "Deploy to production and monitor initial launch",
                        assignedTo: findBestTeamMember(["devops", "deployment"]),
                        estimatedHours: 12,
                        priority: "medium",
                        dependencies: [`${goalId}_task_4`],
                        skills: ["DevOps", "Deployment", "Monitoring"],
                    },
                ]
            } else if (lowerMessage.includes("mobile app")) {
                goalTitle = "Mobile Application Development"
                goalDescription = "Develop a cross-platform mobile application"
                tasks = [
                    {
                        id: `${goalId}_task_1`,
                        title: "Mobile UI Design",
                        description: "Design mobile-first user interface and user experience",
                        assignedTo: findBestTeamMember(["design", "mobile"]),
                        estimatedHours: 24,
                        priority: "high",
                        dependencies: [],
                        skills: ["Mobile Design", "UI/UX", "Figma"],
                    },
                    {
                        id: `${goalId}_task_2`,
                        title: "React Native Development",
                        description: "Build cross-platform mobile app using React Native",
                        assignedTo: findBestTeamMember(["mobile", "react"]),
                        estimatedHours: 40,
                        priority: "high",
                        dependencies: [`${goalId}_task_1`],
                        skills: ["React Native", "Mobile Development", "JavaScript"],
                    },
                    {
                        id: `${goalId}_task_3`,
                        title: "API Integration",
                        description: "Integrate with backend APIs and third-party services",
                        assignedTo: findBestTeamMember(["backend", "api"]),
                        estimatedHours: 20,
                        priority: "medium",
                        dependencies: [`${goalId}_task_2`],
                        skills: ["API Integration", "Backend", "Mobile"],
                    },
                    {
                        id: `${goalId}_task_4`,
                        title: "App Store Deployment",
                        description: "Prepare and deploy to iOS App Store and Google Play Store",
                        assignedTo: findBestTeamMember(["mobile", "deployment"]),
                        estimatedHours: 16,
                        priority: "low",
                        dependencies: [`${goalId}_task_3`],
                        skills: ["App Store", "Deployment", "Mobile"],
                    },
                ]
            } else if (lowerMessage.includes("marketing") || lowerMessage.includes("campaign")) {
                goalTitle = "Marketing Campaign Launch"
                goalDescription = "Execute a comprehensive marketing campaign to increase brand awareness"
                tasks = [
                    {
                        id: `${goalId}_task_1`,
                        title: "Market Research",
                        description: "Conduct market analysis and competitor research",
                        assignedTo: findBestTeamMember(["marketing", "research"]),
                        estimatedHours: 16,
                        priority: "high",
                        dependencies: [],
                        skills: ["Marketing", "Research", "Analytics"],
                    },
                    {
                        id: `${goalId}_task_2`,
                        title: "Content Creation",
                        description: "Create marketing materials, copy, and visual assets",
                        assignedTo: findBestTeamMember(["content", "design"]),
                        estimatedHours: 24,
                        priority: "high",
                        dependencies: [`${goalId}_task_1`],
                        skills: ["Content", "Design", "Copywriting"],
                    },
                    {
                        id: `${goalId}_task_3`,
                        title: "Social Media Strategy",
                        description: "Develop and execute social media marketing strategy",
                        assignedTo: findBestTeamMember(["social", "marketing"]),
                        estimatedHours: 20,
                        priority: "medium",
                        dependencies: [`${goalId}_task_2`],
                        skills: ["Social Media", "Marketing", "Content"],
                    },
                    {
                        id: `${goalId}_task_4`,
                        title: "Campaign Analytics",
                        description: "Track campaign performance and optimize based on data",
                        assignedTo: findBestTeamMember(["analytics", "marketing"]),
                        estimatedHours: 12,
                        priority: "medium",
                        dependencies: [`${goalId}_task_3`],
                        skills: ["Analytics", "Marketing", "Data Analysis"],
                    },
                ]
            } else {
                // Generic project based on user input
                goalTitle = "Custom Project"
                goalDescription = `Project based on: ${userMessage}`
                tasks = [
                    {
                        id: `${goalId}_task_1`,
                        title: "Project Planning",
                        description: "Define project scope, requirements, and timeline",
                        assignedTo: findBestTeamMember(["management", "planning"]),
                        estimatedHours: 12,
                        priority: "high",
                        dependencies: [],
                        skills: ["Project Management", "Planning", "Strategy"],
                    },
                    {
                        id: `${goalId}_task_2`,
                        title: "Implementation",
                        description: "Execute the main project deliverables",
                        assignedTo: teamMembers[0] || null,
                        estimatedHours: 24,
                        priority: "high",
                        dependencies: [`${goalId}_task_1`],
                        skills: ["Implementation", "Development"],
                    },
                    {
                        id: `${goalId}_task_3`,
                        title: "Review & Testing",
                        description: "Quality assurance and final review",
                        assignedTo: findBestTeamMember(["qa", "testing"]),
                        estimatedHours: 8,
                        priority: "medium",
                        dependencies: [`${goalId}_task_2`],
                        skills: ["QA", "Testing", "Review"],
                    },
                ]
            }

            const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0)
            const estimatedDuration = `${Math.ceil(totalHours / 8)} working days`

            const goal: AIGoal = {
                id: goalId,
                title: goalTitle,
                description: goalDescription,
                tasks,
                estimatedDuration,
                totalHours,
            }

            return {
                content: `I've analyzed your request and created a comprehensive plan for "${goalTitle}". Here's what I've prepared:

📋 **Project Overview:**
${goalDescription}

⏱️ **Estimated Duration:** ${estimatedDuration} (${totalHours} total hours)
📝 **Tasks Created:** ${tasks.length} tasks
👥 **Team Members Involved:** ${new Set(tasks.map((t) => t.assignedTo?.name).filter(Boolean)).size}

I've automatically assigned tasks to team members based on their skills and expertise. You can review and modify the assignments in the task delegation panel. Would you like me to explain any specific task or make adjustments?`,
                goal,
            }
        }

        // Handle task modification requests
        if (lowerMessage.includes("modify") || lowerMessage.includes("change") || lowerMessage.includes("update")) {
            return {
                content:
                    "I can help you modify the tasks! You can use the task delegation panel on the right to edit task details, change assignments, adjust priorities, or update time estimates. What specific changes would you like to make?",
            }
        }

        // Handle questions about team or capabilities
        if (lowerMessage.includes("team") || lowerMessage.includes("members")) {
            const teamSummary = teamMembers
                .map((member) => `• ${member.name} (${member.role}) - ${member.skillTags.slice(0, 3).join(", ")}`)
                .join("\n")

            return {
                content: `Here's your current team:\n\n${teamSummary}\n\nI can assign tasks based on their skills and expertise. What project would you like to work on?`,
            }
        }

        // Default helpful response
        return {
            content:
                "I'm here to help you create and manage projects! I can break down complex goals into actionable tasks and assign them to your team members based on their skills. Try asking me to:\n\n• Create a website or web application\n• Build a mobile app\n• Launch a marketing campaign\n• Or describe any other project you have in mind\n\nWhat would you like to work on?",
        }
    }

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return

        const userMessage: ChatMessage = {
            id: `user_${Date.now()}`,
            type: "user",
            content: inputMessage,
            timestamp: new Date(),
        }

        const newMessages = [...messages, userMessage]
        setMessages(newMessages)
        setInputMessage("")
        setIsLoading(true)

        // Update session title if it's the first user message
        if (messages.length === 1) {
            const sessionTitle = inputMessage.length > 30 ? inputMessage.substring(0, 30) + "..." : inputMessage
            setChatSessions(prev => prev.map(session =>
                session.id === currentSessionId
                    ? { ...session, title: sessionTitle }
                    : session
            ))
        }

        try {
            const aiResponse = await generateAIResponse(inputMessage)

            const aiMessage: ChatMessage = {
                id: `ai_${Date.now()}`,
                type: "ai",
                content: aiResponse.content,
                timestamp: new Date(),
                goal: aiResponse.goal,
            }

            setMessages(prev => [...prev, aiMessage])

            if (aiResponse.goal) {
                setCurrentGoal(aiResponse.goal)
            }

            // Save session after AI response
            setTimeout(saveCurrentSession, 100)
        } catch (error) {
            console.error("Error generating AI response:", error)
            const errorMessage: ChatMessage = {
                id: `ai_error_${Date.now()}`,
                type: "ai",
                content: "I apologize, but I encountered an error. Please try again.",
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleTaskEdit = (task: AITask) => {
        setEditingTask(task)
    }

    const handleTaskView = (task: AITask) => {
        setViewingTask(task)
    }

    const handleTaskUpdate = (updatedTask: AITask) => {
        if (!currentGoal) return

        const updatedTasks = currentGoal.tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
        const updatedGoal = {
            ...currentGoal,
            tasks: updatedTasks,
            totalHours: updatedTasks.reduce((sum, task) => sum + task.estimatedHours, 0),
            estimatedDuration: `${Math.ceil(updatedTasks.reduce((sum, task) => sum + task.estimatedHours, 0) / 8)} working days`,
        }

        setCurrentGoal(updatedGoal)
        setEditingTask(null)
    }

    const handleTaskDelete = (taskId: string) => {
        if (!currentGoal) return

        const updatedTasks = currentGoal.tasks.filter((task) => task.id !== taskId)
        const updatedGoal = {
            ...currentGoal,
            tasks: updatedTasks,
            totalHours: updatedTasks.reduce((sum, task) => sum + task.estimatedHours, 0),
            estimatedDuration: `${Math.ceil(updatedTasks.reduce((sum, task) => sum + task.estimatedHours, 0) / 8)} working days`,
        }

        setCurrentGoal(updatedGoal)
    }

    const handleApproveGoal = () => {
        if (!currentGoal || !user) return

        // Create the goal in the existing system
        const newGoal = {
            id: Date.now(),
            title: currentGoal.title,
            description: currentGoal.description,
            status: "active" as const,
            createdAt: new Date().toISOString().split("T")[0],
            assignedTasks: currentGoal.tasks.length,
            completedTasks: 0,
        }

        // Create tasks for the delegation system
        const tasks = currentGoal.tasks.map((task, index) => ({
            id: Date.now() + index,
            title: task.title,
            description: task.description,
            assignedTo: task.assignedTo,
            estimatedHours: task.estimatedHours,
            priority: task.priority,
            status: "not-started" as const,
            dueDate: null,
            goalId: newGoal.id,
            goalTitle: newGoal.title,
        }))

        // Save to localStorage
        const existingGoals = JSON.parse(localStorage.getItem("goals") || "[]")
        localStorage.setItem("goals", JSON.stringify([...existingGoals, newGoal]))

        const existingTasks = JSON.parse(localStorage.getItem("allTasks") || "[]")
        localStorage.setItem("allTasks", JSON.stringify([...existingTasks, ...tasks]))

        setShowApprovalDialog(false)
        setCurrentGoal(null)

        // Add success message
        const successMessage: ChatMessage = {
            id: `ai_success_${Date.now()}`,
            type: "ai",
            content: `🎉 Perfect! I've successfully created "${newGoal.title}" with ${tasks.length} tasks assigned to your team members. You can now track progress in the Goals & Tasks section. Is there anything else you'd like me to help you with?`,
            timestamp: new Date(),
        }

        setMessages(prev => [...prev, successMessage])
        saveCurrentSession()
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

    return (
        <DashboardLayout breadcrumbs={[{ label: "AI Assistant" }]}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
                    <p className="text-muted-foreground">
                        Chat with AI to create goals, delegate tasks, and manage your projects intelligently
                    </p>
                </div>

                <div className="flex gap-4 h-[calc(100vh-200px)]">
                    {/* Chat Interface */}
                    <div className="flex-1 min-w-0">
                        <Card className="h-full flex flex-col">
                            <CardHeader className="flex-shrink-0 pb-3">
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Bot className="h-5 w-5" />
                                        <span className="hidden sm:inline">AI Assistant Chat</span>
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
                                        {messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 ${message.type === "user"
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted text-muted-foreground"
                                                        }`}
                                                >
                                                    <div className="flex items-start space-x-2">
                                                        {message.type === "ai" ?
                                                            <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" /> : null}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="whitespace-pre-wrap text-sm break-words">{message.content}</div>
                                                            <div className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</div>
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
                                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                                        disabled={isLoading}
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

                                                    <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm flex-shrink-0">
                                                        <div>
                                                            <div className="font-medium">Duration</div>
                                                            <div className="text-muted-foreground truncate">{currentGoal.estimatedDuration}</div>
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">Total Hours</div>
                                                            <div className="text-muted-foreground">{currentGoal.totalHours}h</div>
                                                        </div>
                                                    </div>

                                                    <Separator className="flex-shrink-0" />

                                                    <div className="flex-1 min-h-0 flex flex-col">
                                                        <div className="flex items-center justify-between mb-3 flex-shrink-0">
                                                            <h4 className="font-medium text-sm">Tasks ({currentGoal.tasks.length})</h4>
                                                        </div>

                                                        <div className="flex-1 min-h-0 overflow-hidden">
                                                            <ScrollArea className="h-full">
                                                                <div className="space-y-3 pr-2 sm:pr-4">
                                                                    {currentGoal.tasks.map((task, index) => (
                                                                        <div key={task.id} className="border rounded-lg p-2 sm:p-3 space-y-2">
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
                                                                                    <span className="text-muted-foreground flex-shrink-0">{task.estimatedHours}h</span>
                                                                                </div>
                                                                                {task.assignedTo && (
                                                                                    <div className="flex items-center space-x-1 min-w-0">
                                                                                        <Users className="h-3 w-3 flex-shrink-0" />
                                                                                        <span className="truncate max-w-16 sm:max-w-20">{task.assignedTo.name}</span>
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
                                                                                <Button variant="ghost" size="sm" onClick={() => handleTaskDelete(task.id)} className="h-6 w-6 p-0">
                                                                                    <Trash2 className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>

                                                                            {task.dependencies.length > 0 && (
                                                                                <div className="text-xs text-muted-foreground">
                                                                                    <span>
                                                                                        Depends on: Task{" "}
                                                                                        {task.dependencies
                                                                                            .map((dep) => currentGoal.tasks.findIndex((t) => t.id === dep) + 1)
                                                                                            .join(", ")}
                                                                                    </span>
                                                                                </div>
                                                                            )}
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
                                    <div>
                                        <label className="text-sm font-medium">Estimated Hours</label>
                                        <div className="mt-1 text-sm">{viewingTask.estimatedHours} hours</div>
                                    </div>
                                </div>

                                {viewingTask.assignedTo && (
                                    <div>
                                        <label className="text-sm font-medium">Assigned To</label>
                                        <div className="mt-1 p-3 bg-muted rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                                                    {viewingTask.assignedTo.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium truncate">{viewingTask.assignedTo.name}</div>
                                                    <div className="text-sm text-muted-foreground truncate">{viewingTask.assignedTo.role} • {viewingTask.assignedTo.department}</div>
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <div className="text-sm font-medium">Skills:</div>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {viewingTask.assignedTo.skillTags.map((skill) => (
                                                        <Badge key={skill} variant="secondary" className="text-xs">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {viewingTask.skills.length > 0 && (
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
                                )}

                                {viewingTask.dependencies.length > 0 && currentGoal && (
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
                                )}
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
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Estimated Hours</label>
                                        <Input
                                            type="number"
                                            value={editingTask.estimatedHours}
                                            onChange={(e) =>
                                                setEditingTask({ ...editingTask, estimatedHours: Number.parseInt(e.target.value) || 0 })
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Priority</label>
                                        <select
                                            className="w-full p-2 border rounded"
                                            value={editingTask.priority}
                                            onChange={(e) =>
                                                setEditingTask({ ...editingTask, priority: e.target.value as "low" | "medium" | "high" })
                                            }
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
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
                            <DialogDescription>
                                Review the goal and tasks before creating them in your project management system.
                            </DialogDescription>
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
                                    <div className="text-center p-3 bg-muted rounded">
                                        <div className="font-semibold">{currentGoal.totalHours}h</div>
                                        <div className="text-muted-foreground">Total Hours</div>
                                    </div>
                                    <div className="text-center p-3 bg-muted rounded">
                                        <div className="font-semibold">{currentGoal.estimatedDuration}</div>
                                        <div className="text-muted-foreground">Duration</div>
                                    </div>
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
                                                        <span className="text-muted-foreground truncate max-w-16 sm:max-w-24">{task.assignedTo?.name || "Unassigned"}</span>
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
