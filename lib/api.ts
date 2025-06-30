// API Configuration
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_LOCAL_URL
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const API_BASE_URL = "https://satyasankalpdevelopers-ai-voice-agent-1.onrender.com/api"


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

// Auth API
export const authApi = {
  login: async (email: string, username_or_email?: string, password: string): Promise<User> => {
    const response = await fetchApi<{ user: User; token: string }>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    // Save both the token and user data
    localStorage.setItem('authToken', response.data.token)
    localStorage.setItem("currentUser", JSON.stringify(response.data.user))
    return response.data.user
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
    const response = await fetchApi<{ user: User }>('/users/register', {
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

export const leadsApi = {
  getAllLeads: async (): Promise<any> => {
    try {
      const response = await fetchApi<{ response: any }>('/leads');
      return response || null;
    } catch (error) {
      throw error;
    }
  },

  getLead: async (sessionId: string): Promise<any> => {
    try {
      const response = await fetchApi<{ session: any }>(`/get-session?id=${sessionId}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
}

export const companyApi = {

  createCompany: async (companyData: any): Promise<any> => {
    const response = await fetchApi<any>('/company', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
    return response;
  },


};