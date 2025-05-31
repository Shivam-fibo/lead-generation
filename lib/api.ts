// Mock API functions that simulate backend calls
export interface User {
  id: number
  email: string
  role: string
  name: string
  department?: string
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
  login: async (email: string, password: string): Promise<User> => {
    await delay(1000)

    const mockUsers = [
      { id: 1, email: "ceo@company.com", password: "password", role: "CEO", name: "John Smith" },
      { id: 2, email: "admin@company.com", password: "password", role: "Admin", name: "Sarah Johnson" },
      { id: 3, email: "leader@company.com", password: "password", role: "Team Leader", name: "Mike Davis" },
      { id: 4, email: "member@company.com", password: "password", role: "Team Member", name: "Lisa Wilson" },
    ]

    const user = mockUsers.find((u) => u.email === email && u.password === password)
    if (!user) {
      throw new Error("Invalid credentials")
    }

    const { password: _, ...userWithoutPassword } = user
    localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword))
    return userWithoutPassword
  },

  register: async (userData: Omit<User, "id"> & { password: string }): Promise<User> => {
    await delay(1000)

    const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    const userExists = existingUsers.find((user: any) => user.email === userData.email)

    if (userExists) {
      throw new Error("User already exists")
    }

    const newUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      department: userData.department,
    }

    const updatedUsers = [...existingUsers, { ...newUser, password: userData.password }]
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers))
    localStorage.setItem("currentUser", JSON.stringify(newUser))

    return newUser
  },

  getCurrentUser: async (): Promise<User | null> => {
    await delay(100)
    const user = localStorage.getItem("currentUser")
    return user ? JSON.parse(user) : null
  },

  logout: async (): Promise<void> => {
    await delay(100)
    localStorage.removeItem("currentUser")
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
