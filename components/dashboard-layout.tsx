"use client"

import * as React from "react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { useDashboardStore } from "@/stores/dashboard-store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useWebSocketConnection } from '@/lib/websocket';
import { Wifi, WifiOff, FolderOpen } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useProjects } from "@/hooks/use-projects"
import { useDashboard } from "@/hooks/use-dashboard"
import { useQueryClient } from "@tanstack/react-query"
import { dashboardApi } from "@/lib/api"

interface DashboardLayoutProps {
  children: React.ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export default function DashboardLayout({ children, breadcrumbs = [] }: DashboardLayoutProps) {
  const { isConnected } = useWebSocketConnection();
  const { user } = useAuth()
  const { data: projectsData, isLoading: projectsLoading, isSuccess: projectsSuccess, isError: projectsError } = useProjects(user?._id)
  const { 
    fetchDashboardData, 
    setSelectedProjectId,
    setProjectSuccess,
    selectedProjectId: storeSelectedProjectId,
    isLoading
  } = useDashboardStore()

  const [localSelectedProjectId, setLocalSelectedProjectId] = React.useState<string>("")

  interface Project {
    _id: string;
    projectName: string;
  }
  
  // Load selected project from localStorage on mount
  React.useEffect(() => {
    if (projectsSuccess && projectsData) {
      setProjectSuccess(true)
      const savedProjectId = localStorage.getItem('selectedProjectId')
      if (savedProjectId && projectsData?.some((p: Project) => p._id === savedProjectId)) {
        setLocalSelectedProjectId(savedProjectId)
        setSelectedProjectId(savedProjectId)
        // Fetch dashboard data for the saved project
        fetchDashboardData(savedProjectId)
      } else if (projectsData.length > 0) {
        // Default to first project if no saved selection or saved project doesn't exist
        const firstProjectId = projectsData[0]._id
        setLocalSelectedProjectId(firstProjectId)
        setSelectedProjectId(firstProjectId)
        localStorage.setItem('selectedProjectId', firstProjectId)
        // Fetch dashboard data for the first project
        fetchDashboardData(firstProjectId)
      }
    } else if (projectsError) {
      setProjectSuccess(false)
    }
  }, [projectsData, projectsSuccess, projectsError, fetchDashboardData, setSelectedProjectId, setProjectSuccess])

  const handleProjectChange = async (projectId: string) => {
    setLocalSelectedProjectId(projectId)
    setSelectedProjectId(projectId)
    localStorage.setItem('selectedProjectId', projectId)
    console.log('Project changed to:', projectId)
    
    // Fetch dashboard data using the store
    await fetchDashboardData(projectId)
  }

  const selectedProject = projectsData?.find((p: Project) => p._id === localSelectedProjectId)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              {breadcrumbs.length > 0 && (
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    {breadcrumbs.map((breadcrumb, index) => (
                      <React.Fragment key={index}>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                          {breadcrumb.href ? (
                            <BreadcrumbLink href={breadcrumb.href}>{breadcrumb.label}</BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              )}
            </div>

            <div className="flex items-center gap-6 pr-6">
              {/* Project Selection Dropdown */}
              {projectsData && projectsData.length > 0 && (
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <Select value={localSelectedProjectId} onValueChange={handleProjectChange}>
                    <SelectTrigger className="w-[200px] h-8 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:ring-slate-500 dark:focus:ring-slate-400">
                      <SelectValue placeholder="Select project">
                        {selectedProject?.projectName || "Select project"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                      {projectsData.map((project: Project) => (
                        <SelectItem
                          key={project._id}
                          value={project._id}
                          className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 focus:bg-slate-50 dark:focus:bg-slate-800"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {project.projectName}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Connection Status */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${isConnected
                    ? 'bg-emerald-500 dark:bg-emerald-400'
                    : 'bg-red-500 dark:bg-red-400'
                    } ${isConnected ? 'animate-pulse' : ''}`}
                  title={`WebSocket ${isConnected ? 'Connected' : 'Disconnected'}`}
                />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 hidden sm:inline">
                  {isConnected ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}