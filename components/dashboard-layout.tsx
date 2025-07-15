"use client"

import * as React from "react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
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

interface DashboardLayoutProps {
  children: React.ReactNode
  breadcrumbs?: Array<{ label: string; href?: string }>
}

export default function DashboardLayout({ children, breadcrumbs = [] }: DashboardLayoutProps) {
  const { isConnected } = useWebSocketConnection();
  const { user } = useAuth()
  const { data: projectsData, isLoading: projectsLoading, isError: projectsError } = useProjects(user?._id)

  console.log('projectsData', projectsData)

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
              {/* Project Name Section */}
              {projectsData && projectsData[0]?.projectName && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800/50 border border-slate-700 dark:border-slate-700">
                  <FolderOpen className="h-4 w-4 text-slate-800 dark:text-slate-400" />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-300">
                    {projectsData[0].projectName}
                  </span>
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