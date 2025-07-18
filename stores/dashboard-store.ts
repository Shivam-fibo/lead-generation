import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { dashboardApi } from "@/lib/api"

interface DashboardData {
  recentLeads?: any[]
  upcomingSiteVisits?: any[]
  totalLeads?: number
  hotLeads?: number
  totalSiteVisits?: number
  scheduledSiteVisits?: number
}

interface DashboardState {
  data: DashboardData | null
  isLoading: boolean
  error: Error | null
  isSuccess: boolean
  selectedProjectId: string | null
  projectSuccess: boolean
  setData: (data: DashboardData) => void
  setLoading: (loading: boolean) => void
  setError: (error: Error | null) => void
  setSuccess: (success: boolean) => void
  setProjectSuccess: (success: boolean) => void
  setSelectedProjectId: (projectId: string | null) => void
  fetchDashboardData: (projectId: string) => Promise<void>
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set) => ({
      data: null,
      isLoading: false,
      error: null,
      selectedProjectId: null,
      setData: (data) => set({ data }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      isSuccess: false,
      projectSuccess: false,
      setSuccess: (success) => set({ isSuccess: success }),
      setProjectSuccess: (success) => set({ projectSuccess: success }),
      setSelectedProjectId: (projectId) => set({ selectedProjectId: projectId }),
      fetchDashboardData: async (projectId: string) => {
        try {
          set({ isLoading: true, error: null })
          const response = await dashboardApi.getDashboardData(projectId)
          set({ 
            data: response.data, 
            isLoading: false,
            isSuccess: true 
          })
        } catch (error) {
          set({ 
            error: error as Error, 
            isLoading: false,
            isSuccess: false 
          })
        }
      },
    }),
    {
      name: "dashboard-store",
    }
  )
)
