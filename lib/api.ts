// API Configuration
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_LOCAL_URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL


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
export interface TeamMemberPublic {
  _id: string;
  username: string;
  first_name: string;
  last_name: string;
  roles: Role[];
}

export interface Attachment {
  filename: string;
  url: string;
  uploaded_at: Date;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  dueDate: Date | null;
  completed_at: Date;
}

export interface TaskAssign {
  task_id: string;
  assigned_to: string;
}

// export interface TaskAssign {
//   _id: string;
//   title: string;
//   role: string;
// }

export interface Goal {
  _id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  due_date?: Date;
  created_by: string;
  tags: string[];
  attachments: Attachment[];
  completed_at?: Date;
  tasks: any[];
  createdAt: string;
  updatedAt: string;
  assignedTasksCount?: number;
  completedTasksCount?: number;
  assigned_to: string;
}

export interface AiMessage {
  userMessage: string;
  aiResponse: string;
  actionItems: string;
  timestamp: string;
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

  getMemberListPublic: async (): Promise<TeamMemberPublic[]> => {
    try {
      const response = await fetchApi<{ users: TeamMemberPublic[] }>(`/user-list`)
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

  addTeamMembersCsv: async (members: Omit<TeamMember, "_id">[]): Promise<TeamMember[]> => {
    try {
      const response = await fetchApi<{ users: TeamMember[] }>('/csv-add-member', {
        method: 'POST',
        body: JSON.stringify({ users: members })
      });
      return response.users;
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
  deleteTeamMember: async (id: string): Promise<void> => {
    try {
      await fetchApi(`/user/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      throw error;
    }
  },
}

// Goals API
export const goalsApi = {

  getGoals: async (): Promise<Goal[]> => {
    try {
      const response = await fetchApi<{ data: { goals: Goal[] } }>(`/goal`)
      if (!response?.data?.goals) return [];
      return response.data.goals;
    } catch (error) {
      throw error;
    }
  },

  getGoalsById: async (id: string): Promise<Goal | null> => {
    try {
      const response = await fetchApi<{ data: { goals: Goal[] } }>(`/goal/?id=${id}`)
      if (!response?.data?.goals[0]) return null;
      return response?.data?.goals[0];
    } catch (error) {
      throw error;
    }
  },

  createGoal: async (goal: Partial<Goal>): Promise<Goal> => {
    try {
      const response = await fetchApi<{ goal: Goal }>('/goal', {
        method: 'POST',
        body: JSON.stringify({ goal })
      });
      return response.goal;
    } catch (error) {
      throw error;
    }
  },

  updateGoal: async (id: string, goal: Partial<Goal>): Promise<Goal> => {
    try {
      return fetchApi<Goal>(`/goal/${id}`, {
        method: 'PUT',
        body: JSON.stringify(goal),
      })
    } catch (error) {
      throw error;
    }
  },

  deleteGoal: async (id: string): Promise<void> => {
    try {
      return fetchApi<void>(`/goal/${id}`, {
        method: 'DELETE',
      })
    } catch (error) {
      throw error;
    }
  },

}

// Tasks API
export const tasksApi = {

  // getTasks: async (): Promise<Task[]> => {
  //   await delay(500)
  //   const saved = localStorage.getItem("allTasks") || "[]"
  //   const tasks = JSON.parse(saved)
  //   return tasks.map((task: any) => ({
  //     ...task,
  //     dueDate: task.dueDate ? new Date(task.dueDate) : null,
  //   }))
  // },

  taskAssign: async (taskAssign: Partial<TaskAssign>): Promise<any> => {
    try {
      const response = await fetchApi<{ taskAssign: TaskAssign }>('/assign-task', {
        method: 'PUT',
        body: JSON.stringify(taskAssign)
      });
      if (!response) return [];
      return response
    } catch (error) {
      throw error;
    }
  },

  createTask: async (task: Partial<Task>): Promise<Task> => {
    try {
      const response = await fetchApi<{ task: Task }>('/task', {
        method: 'POST',
        body: JSON.stringify({ task })
      });
      return response.task;
    } catch (error) {
      throw error;
    }
  },

  updateTask: async (taskId: string, task: Partial<Task>): Promise<Task> => {
    try {
      const response = await fetchApi<{ task: Task }>(`/task/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ task }),
      });
      return response.task;
    } catch (error) {
      throw error;
    }
  },

  deleteTask: async (taskId: string): Promise<void> => {
    try {
      await fetchApi<void>(`/task/${taskId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      throw error;
    }
  },

}


export const aiAssistantApi = {
  chatWithAI: async (message: { message: string; sessionId: string }): Promise<any> => {
    try {
      const response = await fetchApi<{ message: any }>('/message', {
        method: 'POST',
        body: JSON.stringify(message)
      });
      return response.message;
    } catch (error) {
      throw error;
    }
  },

  // Get messages for a specific session
  getSessionMessages: async (sessionId: string): Promise<any[]> => {
    try {
      const response = await fetchApi<{ messages: any[] }>(`/session/${sessionId}/messages`);
      return response.messages || [];
    } catch (error) {
      throw error;
    }
  },

  ApproveAIGoal: async (goal: any): Promise<any> => {
    try {
      const response = await fetchApi<{ data: any }>('/approve-ai-goal', {
        method: 'POST',
        body: JSON.stringify({ goal })
      });
      if (!response.data) return {};
      return response.data;
    } catch (error) {
      throw error;
    }
  },

}

export const aiSessionApi = {
  // Existing createAISession method - already good
  createAISession: async (title: string): Promise<any> => {
    try {
      const response = await fetchApi<{ data: any }>('/create-session', {
        method: 'POST',
        body: JSON.stringify({ title })
      });
      if (!response.data) return {};
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get all sessions for current user
  getAllSessions: async (): Promise<any[]> => {
    try {
      const response = await fetchApi<{ sessions: any[] }>('/sessions');
      return response.sessions || [];
    } catch (error) {
      throw error;
    }
  },

  getSession: async (sessionId: string): Promise<any> => {
    try {
      const response = await fetchApi<{ session: any }>(`/get-session?id=${sessionId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  updateSessionTitle: async (sessionId: string, title: string): Promise<any> => {
    try {
      const response = await fetchApi<{ session: any }>(`/session/${sessionId}`, {
        method: 'PUT',
        body: JSON.stringify({ title })
      });
      return response.session;
    } catch (error) {
      throw error;
    }
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    try {
      await fetchApi(`/session/${sessionId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      throw error;
    }
  },
}


export const AITasksApi = {



  AItaskAssign: async (taskAssign: Partial<TaskAssign>): Promise<any> => {
    try {
      const response = await fetchApi<{ taskAssign: TaskAssign }>('/ai-assign-task', {
        method: 'PUT',
        body: JSON.stringify(taskAssign)
      });
      if (!response) return [];
      return response
    } catch (error) {
      throw error;
    }
  },

  AIcreateTask: async (task: Partial<Task>): Promise<Task> => {
    try {
      const response = await fetchApi<{ task: Task }>('/ai-task', {
        method: 'POST',
        body: JSON.stringify({ task })
      });
      return response.task;
    } catch (error) {
      throw error;
    }
  },

  AIupdateTask: async (taskId: string, task: Partial<Task>): Promise<Task> => {
    try {
      const response = await fetchApi<{ task: Task }>(`/ai-task/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ task }),
      });
      return response.task;
    } catch (error) {
      throw error;
    }
  },

  AIdeleteTask: async (taskId: string): Promise<void> => {
    try {
      await fetchApi<void>(`/ai-task/${taskId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      throw error;
    }
  },

}