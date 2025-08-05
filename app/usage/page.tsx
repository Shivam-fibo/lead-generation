"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area
} from "recharts"
import {
  TrendingUp,
  Calendar,
  Clock,
  Mail,
  ArrowUpRight,
  Activity,
  Database,
  Settings,
  BarChart3,
  Zap,
  Target,
  Users,
  Server,
  Timer,
  Gauge
} from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useAuthStore } from "@/stores/auth-store"
import { useProjects } from "@/hooks/use-projects"

// Mock data for demonstration
const generateMockUsageData = (projectName: string) => {
  const plans = ["Starter", "Professional", "Business", "Enterprise"]
  const currentPlan = plans[Math.floor(Math.random() * plans.length)]
  const totalMins = currentPlan === "Starter" ? 2500 : currentPlan === "Professional" ? 7500 : currentPlan === "Business" ? 15000 : 30000
  const usedMins = Math.floor(Math.random() * totalMins)
  const usagePercent = Math.round((usedMins / totalMins) * 100)
  
  const renewDate = new Date()
  renewDate.setDate(renewDate.getDate() + Math.floor(Math.random() * 30) + 1)
  
  return {
    currentPlan,
    totalMins,
    usedMins,
    remainingMins: totalMins - usedMins,
    usagePercent,
    renewsOn: renewDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }),
    weeklyTrend: Array.from({ length: 7 }, (_, i) => ({
      day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      usage: Math.floor(Math.random() * 400) + 100,
      dayIndex: i + 1
    })),
    dailyBreakdown: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      usage: Math.floor(Math.random() * 200) + 50
    }))
  }
}

const getPlanConfig = (plan: string) => {
  const configs = {
    "Starter": {
      color: "slate",
      bg: "bg-slate-50 dark:bg-slate-900/50",
      border: "border-slate-200 dark:border-slate-700",
      text: "text-slate-700 dark:text-slate-300",
      accent: "text-slate-900 dark:text-slate-100"
    },
    "Professional": {
      color: "blue",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-700 dark:text-blue-300",
      accent: "text-blue-900 dark:text-blue-100"
    },
    "Business": {
      color: "emerald",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-200 dark:border-emerald-800",
      text: "text-emerald-700 dark:text-emerald-300",
      accent: "text-emerald-900 dark:text-emerald-100"
    },
    "Enterprise": {
      color: "purple",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      border: "border-purple-200 dark:border-purple-800",
      text: "text-purple-700 dark:text-purple-300",
      accent: "text-purple-900 dark:text-purple-100"
    }
  }
  return configs[plan] || configs["Starter"]
}

const getUsageTheme = (percent: number) => {
  if (percent >= 90) return {
    color: "#dc2626",
    lightColor: "#fca5a5",
    bgLight: "bg-red-50 dark:bg-red-950/30",
    textLight: "text-red-600 dark:text-red-400",
    textDark: "text-red-800 dark:text-red-200"
  }
  if (percent >= 75) return {
    color: "#ea580c",
    lightColor: "#fdba74",
    bgLight: "bg-orange-50 dark:bg-orange-950/30",
    textLight: "text-orange-600 dark:text-orange-400",
    textDark: "text-orange-800 dark:text-orange-200"
  }
  if (percent >= 50) return {
    color: "#ca8a04",
    lightColor: "#fde047",
    bgLight: "bg-yellow-50 dark:bg-yellow-950/30",
    textLight: "text-yellow-600 dark:text-yellow-400",
    textDark: "text-yellow-800 dark:text-yellow-200"
  }
  return {
    color: "#059669",
    lightColor: "#6ee7b7",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/30",
    textLight: "text-emerald-600 dark:text-emerald-400",
    textDark: "text-emerald-800 dark:text-emerald-200"
  }
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {label && `${label}: `}{payload[0].value.toLocaleString()} minutes
        </p>
      </div>
    )
  }
  return null
}

const RingChart = ({ percentage, size = 140, theme, project }) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [percentage])

  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = `${(animatedPercentage / 100) * circumference} ${circumference}`
  
  return (
    <div 
      className="relative flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105"
      style={{ width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <div 
        className={`absolute inset-0 rounded-full transition-opacity duration-300 ${isHovered ? 'opacity-20' : 'opacity-0'}`}
        style={{ 
          background: `radial-gradient(circle, ${theme.color}20 0%, transparent 70%)`,
          filter: 'blur(8px)'
        }}
      />
      
      <svg width={size} height={size} className="transform -rotate-90 drop-shadow-sm">
        {/* Gradient definitions */}
        <defs>
          <linearGradient id={`gradient-${project._id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.color} stopOpacity="1" />
            <stop offset="100%" stopColor={theme.lightColor} stopOpacity="0.8" />
          </linearGradient>
          <filter id={`shadow-${project._id}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={theme.color} floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-100 dark:text-gray-800"
          opacity="0.3"
        />
        
        {/* Progress arc with animation */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#gradient-${project._id})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          className="transition-all duration-1500 ease-out"
          filter={`url(#shadow-${project._id})`}
          style={{
            transformOrigin: 'center',
          }}
        />
      </svg>
      
      {/* Center content with enhanced typography */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`text-3xl font-bold transition-colors duration-300 ${isHovered ? theme.textDark : 'text-gray-900 dark:text-gray-100'}`}>
          {animatedPercentage}%
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
          Usage
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {(project.usage.usedMins / 1000).toFixed(1)}K / {(project.usage.totalMins / 1000).toFixed(1)}K
        </div>
      </div>
      
      {/* Hover overlay with additional info */}
      <div className={`absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-95 dark:bg-opacity-95 rounded-full flex flex-col items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="text-center space-y-1">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {project.usage.remainingMins.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            minutes remaining
          </div>
          <div className={`text-xs font-medium ${theme.textLight}`}>
            {project.usage.currentPlan} Plan
          </div>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ title, value, icon: Icon, trend, description }) => (
  <Card className="border-0 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow duration-200">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            {trend && (
              <span className={`text-xs font-medium ${trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function UsageDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore()
  const { data: projects, isLoading } = useProjects(user?._id)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [emailData, setEmailData] = useState({ subject: "", message: "" })
  const router = useRouter()

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAuthenticated) {
        router.push("/")
        return
      }
    }
  }, [authLoading, router, user, isAuthenticated])

  const handleUpgradeClick = (project: any) => {
    setSelectedProject(project)
    setEmailData({
      subject: `Plan Upgrade Request - ${project.projectName}`,
      message: `Dear Support Team,\n\nI would like to request an upgrade for my ${project.usage.currentPlan} plan for the project "${project.projectName}".\n\nCurrent Usage: ${project.usage.usedMins.toLocaleString()}/${project.usage.totalMins.toLocaleString()} minutes (${project.usage.usagePercent}%)\nRenewal Date: ${project.usage.renewsOn}\n\nPlease provide upgrade options and pricing details.\n\nBest regards,\n${user?.first_name} ${user?.last_name}`
    })
    setShowUpgradeDialog(true)
  }

  const handleSendEmail = () => {
    const subject = encodeURIComponent(emailData.subject)
    const body = encodeURIComponent(emailData.message)
    window.open(`mailto:support@company.com?subject=${subject}&body=${body}`)
    setShowUpgradeDialog(false)
  }

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      </DashboardLayout>
    )
  }

  const projectsWithUsage = projects?.map(project => ({
    ...project,
    usage: generateMockUsageData(project.projectName)
  })) || []

  const totalUsageAcrossProjects = projectsWithUsage.reduce((sum, project) => sum + project.usage.usedMins, 0)
  const totalCapacity = projectsWithUsage.reduce((sum, project) => sum + project.usage.totalMins, 0)
  const overallUsagePercent = totalCapacity > 0 ? Math.round((totalUsageAcrossProjects / totalCapacity) * 100) : 0
  const highUsageProjects = projectsWithUsage.filter(p => p.usage.usagePercent >= 75).length
  const avgUsage = projectsWithUsage.length > 0 ? Math.round(totalUsageAcrossProjects / projectsWithUsage.length / 1000 * 10) / 10 : 0

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6 mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Usage Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor resource consumption and plan utilization across your projects
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Usage</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {overallUsagePercent}%
              </p>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Projects"
            value={projectsWithUsage.length}
            icon={Database}
            description="Currently tracked"
          />
          <StatCard
            title="Total Usage"
            value={`${(totalUsageAcrossProjects / 1000).toFixed(1)}K`}
            icon={Activity}
            description="Minutes consumed"
          />
          <StatCard
            title="High Usage Projects"
            value={highUsageProjects}
            icon={TrendingUp}
            description="Above 75% capacity"
          />
          <StatCard
            title="Average Usage"
            value={`${avgUsage}K`}
            icon={Timer}
            description="Per project"
          />
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projectsWithUsage.map((project) => {
            const usageTheme = getUsageTheme(project.usage.usagePercent)
            const planConfig = getPlanConfig(project.usage.currentPlan)
            
            return (
              <Card key={project._id} className="border-0 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {project.projectName}
                      </CardTitle>
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${planConfig.bg} ${planConfig.border} ${planConfig.text} border`}>
                        {project.usage.currentPlan}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Usage Visualization */}
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center p-2">
                        <RingChart 
                          percentage={project.usage.usagePercent}
                          theme={usageTheme}
                          project={project}
                          size={140}
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Usage</span>
                          <span className={`text-lg font-bold ${usageTheme.textDark}`}>
                            {project.usage.usagePercent}%
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-700 ease-out"
                            style={{ 
                              width: `${project.usage.usagePercent}%`,
                              backgroundColor: usageTheme.color
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-0 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Used</p>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {(project.usage.usedMins / 1000).toFixed(1)}K
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Remaining</p>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {(project.usage.remainingMins / 1000).toFixed(1)}K
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Trend */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Weekly Trend
                      </span>
                    </div>
                    <div className="h-16">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={project.usage.weeklyTrend}>
                          <defs>
                            <linearGradient id={`area-${project._id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={usageTheme.color} stopOpacity={0.2}/>
                              <stop offset="95%" stopColor={usageTheme.color} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="usage"
                            stroke={usageTheme.color}
                            strokeWidth={2}
                            fill={`url(#area-${project._id})`}
                          />
                          <XAxis 
                            dataKey="day" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'currentColor' }}
                            className="text-gray-400 dark:text-gray-500"
                          />
                          <Tooltip content={<CustomTooltip />} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Plan Details & Actions */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>Renews {project.usage.renewsOn}</span>
                      </div>
                      <div className="text-gray-900 dark:text-gray-100 font-medium">
                        {project.usage.totalMins.toLocaleString()} min
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleUpgradeClick(project)}
                      variant="outline"
                      className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {projectsWithUsage.length === 0 && (
          <Card className="border-0 bg-white dark:bg-gray-900 shadow-sm">
            <CardContent className="text-center py-16">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Database className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No Projects Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create your first project to start monitoring usage analytics
              </p>
            </CardContent>
          </Card>
        )}

        {/* Upgrade Dialog */}
        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <DialogContent className="max-w-2xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                Request Plan Upgrade
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Send an upgrade request for "{selectedProject?.projectName}" to our support team
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subject
                </Label>
                <Input
                  id="subject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Message
                </Label>
                <Textarea
                  id="message"
                  value={emailData.message}
                  onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                  rows={8}
                  className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowUpgradeDialog(false)}
                  className="border-gray-300 dark:border-gray-600"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendEmail}
                  className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}