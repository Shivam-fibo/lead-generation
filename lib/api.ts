// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL


const buildUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`

const getAuthToken = () => localStorage.getItem('authToken')

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(buildUrl(endpoint), {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'An error occurred')
  }

  return response.json()
}

export interface Role {
  name: string;
  _id: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  number: string;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  refresh_token?: string;
}

export interface TeamMember {
  id: number
  name: string
  email: string
  role: string
  skillTags: string[]
  department: string
}

export interface Task {
  id: number
  title: string
  description: string
  assignedTo: TeamMember | null
  estimatedHours: number
  priority: "low" | "medium" | "high"
  status: "not-started" | "in-progress" | "completed"
  dueDate: Date | null
  goalId: number
  goalTitle: string
}

export interface Goal {
  id: number
  title: string
  description: string
  status: "active" | "completed" | "pending"
  createdAt: string
  assignedTasks: number
  completedTasks: number
  tasks?: Task[]
}

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Auth API
export const authApi = {
  login: async (username_or_email: string, password: string): Promise<User> => {

    console.log('process.env.NEXT_PUBLIC_API_BASE_URL', process.env.NEXT_PUBLIC_API_BASE_URL)


    const response = await fetchApi<{ user: User; accessToken: string }>('/login', {
      method: 'POST',
      body: JSON.stringify({ username_or_email, password }),
    })
    // Save both the token and user data
    localStorage.setItem('authToken', response.accessToken)
    localStorage.setItem("currentUser", JSON.stringify(response.user))
    return response.user
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = getAuthToken();
      if (!token) return null;
      const response = await fetchApi<{ user: User }>('/user')
      return response.user
    } catch (error) {
      // localStorage.removeItem('authToken')
      // localStorage.removeItem("currentUser")
      throw error;
    }
  },

  register: async (userData: Omit<User, "id"> & { password: string }): Promise<User> => {
    const response = await fetchApi<{ user: User }>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })

    localStorage.setItem("currentUser", JSON.stringify(response.user))
    return response.user
  },

  logout: async (): Promise<void> => {
    try {
      await fetchApi('/logout', { method: 'POST' })
    } catch (error) {
      // Continue with local logout even if API call fails
      console.error('Logout API call failed:', error)
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken')
      localStorage.removeItem('currentUser')
    }
  },
}

// Team API
export const teamApi = {
  getTeamMembers: async (): Promise<TeamMember[]> => {
    await delay(500)
    const saved = localStorage.getItem("teamMembers")
    if (saved) {
      return JSON.parse(saved)
    }

    // Default team members
    const defaultMembers = [
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

    localStorage.setItem("teamMembers", JSON.stringify(defaultMembers))
    return defaultMembers
  },

  addTeamMember: async (member: Omit<TeamMember, "id">): Promise<TeamMember> => {
    await delay(500)
    const members = await teamApi.getTeamMembers()
    const newMember = {
      ...member,
      id: Math.max(...members.map((m) => m.id), 0) + 1,
    }
    const updated = [...members, newMember]
    localStorage.setItem("teamMembers", JSON.stringify(updated))
    return newMember
  },

  updateTeamMember: async (id: number, member: Omit<TeamMember, "id">): Promise<TeamMember> => {
    await delay(500)
    const members = await teamApi.getTeamMembers()
    const updated = members.map((m) => (m.id === id ? { ...member, id } : m))
    localStorage.setItem("teamMembers", JSON.stringify(updated))
    return { ...member, id }
  },

  deleteTeamMember: async (id: number): Promise<void> => {
    await delay(500)
    const members = await teamApi.getTeamMembers()
    const updated = members.filter((m) => m.id !== id)
    localStorage.setItem("teamMembers", JSON.stringify(updated))
  },
}

// Goals API
export const goalsApi = {
  getGoals: async (): Promise<Goal[]> => {
    await delay(500)
    const saved = localStorage.getItem("goals")
    const mockGoals = [
      {
        id: 1,
        title: "Q4 Product Launch",
        description: "Launch the new product line with full marketing campaign and customer onboarding",
        status: "active" as const,
        createdAt: "2024-01-15",
        assignedTasks: 12,
        completedTasks: 8,
      },
      {
        id: 2,
        title: "Team Expansion",
        description: "Hire 5 new engineers and 2 designers for the upcoming projects",
        status: "active" as const,
        createdAt: "2024-01-10",
        assignedTasks: 8,
        completedTasks: 3,
      },
      {
        id: 3,
        title: "Process Optimization",
        description: "Streamline development workflow and implement new project management tools",
        status: "completed" as const,
        createdAt: "2024-01-05",
        assignedTasks: 6,
        completedTasks: 6,
      },
    ]

    if (saved) {
      const savedGoals = JSON.parse(saved)
      return [...mockGoals, ...savedGoals]
    }
    return mockGoals
  },

  createGoal: async (goal: Omit<Goal, "id">): Promise<Goal> => {
    await delay(500)
    const newGoal = {
      ...goal,
      id: Date.now(),
    }
    const goals = await goalsApi.getGoals()
    const savedGoals = goals.filter((g) => ![1, 2, 3].includes(g.id))
    const updated = [...savedGoals, newGoal]
    localStorage.setItem("goals", JSON.stringify(updated))
    return newGoal
  },

  updateGoal: async (id: number, goal: Partial<Goal>): Promise<Goal> => {
    await delay(500)
    const goals = await goalsApi.getGoals()
    const updated = goals.map((g) => (g.id === id ? { ...g, ...goal } : g))
    const savedGoals = updated.filter((g) => ![1, 2, 3].includes(g.id))
    localStorage.setItem("goals", JSON.stringify(savedGoals))
    return updated.find((g) => g.id === id)!
  },

  deleteGoal: async (id: number): Promise<void> => {
    await delay(500)
    const goals = await goalsApi.getGoals()
    const updated = goals.filter((g) => g.id !== id)
    const savedGoals = updated.filter((g) => ![1, 2, 3].includes(g.id))
    localStorage.setItem("goals", JSON.stringify(savedGoals))
  },
}

// Tasks API
export const tasksApi = {
  getTasks: async (): Promise<Task[]> => {
    await delay(500)
    const saved = localStorage.getItem("allTasks") || "[]"
    const tasks = JSON.parse(saved)
    return tasks.map((task: any) => ({
      ...task,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
    }))
  },

  getTasksByUser: async (userId: number): Promise<Task[]> => {
    const tasks = await tasksApi.getTasks()
    return tasks.filter((task) => task.assignedTo?.id === userId)
  },

  getTasksByGoal: async (goalId: number): Promise<Task[]> => {
    const tasks = await tasksApi.getTasks()
    return tasks.filter((task) => task.goalId === goalId)
  },

  updateTaskStatus: async (taskId: number, status: Task["status"]): Promise<Task> => {
    await delay(300)
    const tasks = await tasksApi.getTasks()
    const updated = tasks.map((task) => (task.id === taskId ? { ...task, status } : task))
    localStorage.setItem("allTasks", JSON.stringify(updated))
    return updated.find((task) => task.id === taskId)!
  },

  saveTasks: async (tasks: Task[]): Promise<Task[]> => {
    await delay(500)
    const tasksToSave = tasks.map((task) => ({
      ...task,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    }))
    localStorage.setItem("allTasks", JSON.stringify(tasksToSave))
    return tasks
  },
}
