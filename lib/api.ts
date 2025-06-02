// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_LOCAL_URL


const buildUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`

const getAuthToken = () => localStorage.getItem('authToken')

const getUserFromLocalStorage = () => localStorage.getItem('currentUser')

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
  _id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  number: string;
  roles: Role[];
  password: string;
}

// export interface Task {
//   id: number
//   title: string
//   description: string
//   assignedTo: TeamMember | null
//   estimatedHours: number
//   priority: "low" | "medium" | "high"
//   status: "not-started" | "in-progress" | "completed"
//   dueDate: Date | null
//   goalId: number
//   goalTitle: string
// }

// export interface Goal {
//   id: number
//   title: string
//   description: string
//   status: "active" | "completed" | "pending"
//   createdAt: string
//   assignedTasks: number
//   completedTasks: number
//   tasks?: Task[]
// }

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
      const currentUser = getUserFromLocalStorage();
      if (!currentUser) return null;
      const parsedUser = JSON.parse(currentUser) as User;
      const response = await fetchApi<{ user: User }>(`/user?id=${parsedUser._id}`)
      return response.user
    } catch (error) {
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

export const teamApi = {
  getTeamMembers: async (): Promise<TeamMember[]> => {
    try {
      const response = await fetchApi<{ users: TeamMember[] }>(`/user`)
      if (!response) return [];
      return response.users
    } catch (error) {
      throw error;
    }
  },

  addTeamMember: async (member: Omit<TeamMember, "_id">): Promise<TeamMember> => {
    try {
      const response = await fetchApi<{ user: TeamMember }>('/register', {
        method: 'POST',
        body: JSON.stringify(member)
      });
      return response.user;
    } catch (error) {
      throw error;
    }
  },

  updateTeamMember: async (id: string, member: Partial<TeamMember>): Promise<TeamMember> => {
    try {
      const response = await fetchApi<{ user: TeamMember }>(`/user/${id}`, {
        method: 'PUT',
        body: JSON.stringify(member)
      });
      return response.user;
    } catch (error) {
      throw error;
    }
  },


  // deleteTeamMember: async (id: number): Promise<void> => {
  //   await delay(500)
  //   const members = await teamApi.getTeamMembers()
  //   const updated = members.filter((m) => m.id !== id)
  //   localStorage.setItem("teamMembers", JSON.stringify(updated))
  // },
}

// Goals API
// export const goalsApi = {
//   getGoals: async (): Promise<Goal[]> => {
//     await delay(500)
//     const saved = localStorage.getItem("goals")
//     const mockGoals = [
//       {
//         id: 1,
//         title: "Q4 Product Launch",
//         description: "Launch the new product line with full marketing campaign and customer onboarding",
//         status: "active" as const,
//         createdAt: "2024-01-15",
//         assignedTasks: 12,
//         completedTasks: 8,
//       },
//       {
//         id: 2,
//         title: "Team Expansion",
//         description: "Hire 5 new engineers and 2 designers for the upcoming projects",
//         status: "active" as const,
//         createdAt: "2024-01-10",
//         assignedTasks: 8,
//         completedTasks: 3,
//       },
//       {
//         id: 3,
//         title: "Process Optimization",
//         description: "Streamline development workflow and implement new project management tools",
//         status: "completed" as const,
//         createdAt: "2024-01-05",
//         assignedTasks: 6,
//         completedTasks: 6,
//       },
//     ]

//     if (saved) {
//       const savedGoals = JSON.parse(saved)
//       return [...mockGoals, ...savedGoals]
//     }
//     return mockGoals
//   },

//   createGoal: async (goal: Omit<Goal, "id">): Promise<Goal> => {
//     await delay(500)
//     const newGoal = {
//       ...goal,
//       id: Date.now(),
//     }
//     const goals = await goalsApi.getGoals()
//     const savedGoals = goals.filter((g) => ![1, 2, 3].includes(g.id))
//     const updated = [...savedGoals, newGoal]
//     localStorage.setItem("goals", JSON.stringify(updated))
//     return newGoal
//   },

//   updateGoal: async (id: number, goal: Partial<Goal>): Promise<Goal> => {
//     await delay(500)
//     const goals = await goalsApi.getGoals()
//     const updated = goals.map((g) => (g.id === id ? { ...g, ...goal } : g))
//     const savedGoals = updated.filter((g) => ![1, 2, 3].includes(g.id))
//     localStorage.setItem("goals", JSON.stringify(savedGoals))
//     return updated.find((g) => g.id === id)!
//   },

//   deleteGoal: async (id: number): Promise<void> => {
//     await delay(500)
//     const goals = await goalsApi.getGoals()
//     const updated = goals.filter((g) => g.id !== id)
//     const savedGoals = updated.filter((g) => ![1, 2, 3].includes(g.id))
//     localStorage.setItem("goals", JSON.stringify(savedGoals))
//   },
// }

// Tasks API
// export const tasksApi = {
//   getTasks: async (): Promise<Task[]> => {
//     await delay(500)
//     const saved = localStorage.getItem("allTasks") || "[]"
//     const tasks = JSON.parse(saved)
//     return tasks.map((task: any) => ({
//       ...task,
//       dueDate: task.dueDate ? new Date(task.dueDate) : null,
//     }))
//   },

//   getTasksByUser: async (userId: number): Promise<Task[]> => {
//     const tasks = await tasksApi.getTasks()
//     return tasks.filter((task) => task.assignedTo?.id === userId)
//   },

//   getTasksByGoal: async (goalId: number): Promise<Task[]> => {
//     const tasks = await tasksApi.getTasks()
//     return tasks.filter((task) => task.goalId === goalId)
//   },

//   updateTaskStatus: async (taskId: number, status: Task["status"]): Promise<Task> => {
//     await delay(300)
//     const tasks = await tasksApi.getTasks()
//     const updated = tasks.map((task) => (task.id === taskId ? { ...task, status } : task))
//     localStorage.setItem("allTasks", JSON.stringify(updated))
//     return updated.find((task) => task.id === taskId)!
//   },

//   saveTasks: async (tasks: Task[]): Promise<Task[]> => {
//     await delay(500)
//     const tasksToSave = tasks.map((task) => ({
//       ...task,
//       dueDate: task.dueDate ? task.dueDate.toISOString() : null,
//     }))
//     localStorage.setItem("allTasks", JSON.stringify(tasksToSave))
//     return tasks
//   },
// }
