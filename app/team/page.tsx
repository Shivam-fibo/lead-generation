"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { LoadingScreen, TeamSkeleton } from "@/components/loading-screen"
import TeamMemberForm from "@/components/team-member-form"
import TeamMemberList from "@/components/team-member-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Upload } from "lucide-react"

interface User {
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

export default function TeamManagement() {
  const [user, setUser] = useState<User | null>(null)
  const [members, setMembers] = useState<TeamMember[]>(defaultTeamMembers)
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/")
      return
    }

    const userData = JSON.parse(currentUser)
    setUser(userData)

    if (userData.role !== "Admin") {
      router.push("/dashboard")
      return
    }

    // Load team members
    const savedTeamMembers = localStorage.getItem("teamMembers")
    if (savedTeamMembers) {
      try {
        const parsedMembers = JSON.parse(savedTeamMembers)
        if (Array.isArray(parsedMembers) && parsedMembers.length > 0) {
          setMembers(parsedMembers)
        }
      } catch (error) {
        console.error("Error parsing team members:", error)
      }
    }

    // Simulate loading time
    setTimeout(() => {
      setIsPageLoading(false)
    }, 800)
  }, [router])

  const handleAddMember = (memberData: Omit<TeamMember, "id">) => {
    const newMember = {
      ...memberData,
      id: Math.max(...members.map((m) => m.id), 0) + 1,
    }
    const updatedMembers = [...members, newMember]
    setMembers(updatedMembers)
    localStorage.setItem("teamMembers", JSON.stringify(updatedMembers))
    setShowForm(false)
  }

  const handleEditMember = (memberData: Omit<TeamMember, "id">) => {
    if (!editingMember) return

    const updatedMembers = members.map((m) => (m.id === editingMember.id ? { ...memberData, id: editingMember.id } : m))
    setMembers(updatedMembers)
    localStorage.setItem("teamMembers", JSON.stringify(updatedMembers))
    setEditingMember(null)
    setShowForm(false)
  }

  const handleDeleteMember = (id: number) => {
    const updatedMembers = members.filter((m) => m.id !== id)
    setMembers(updatedMembers)
    localStorage.setItem("teamMembers", JSON.stringify(updatedMembers))
  }

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const csv = e.target?.result as string
      const lines = csv.split("\n")

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim())
        if (values.length >= 5) {
          const newMember = {
            name: values[0],
            email: values[1],
            role: values[2],
            skillTags: values[3].split(";").map((s) => s.trim()),
            department: values[4],
          }
          handleAddMember(newMember)
        }
      }
    }
    reader.readAsText(file)
  }

  if (!user) {
    return <LoadingScreen />
  }

  return (
    <DashboardLayout>
      {isPageLoading ? (
        <TeamSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Team Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your team members, roles, and skills</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => document.getElementById("csv-upload")?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </Button>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </div>
          </div>

          <input id="csv-upload" type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />

          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">Team List</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              {showForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>{editingMember ? "Edit Team Member" : "Add New Team Member"}</CardTitle>
                    <CardDescription>
                      {editingMember
                        ? "Update the team member information below"
                        : "Fill in the details to add a new team member"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TeamMemberForm
                      initialData={editingMember || undefined}
                      onSubmit={editingMember ? handleEditMember : handleAddMember}
                      onCancel={() => {
                        setShowForm(false)
                        setEditingMember(null)
                      }}
                    />
                  </CardContent>
                </Card>
              )}

              <TeamMemberList
                members={members}
                onEdit={(member) => {
                  setEditingMember(member)
                  setShowForm(true)
                }}
                onDelete={handleDeleteMember}
              />
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{members.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Departments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{new Set(members.map((m) => m.department)).size}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Unique Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{new Set(members.flatMap((m) => m.skillTags)).size}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Department Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(
                      members.reduce(
                        (acc, member) => {
                          acc[member.department] = (acc[member.department] || 0) + 1
                          return acc
                        },
                        {} as Record<string, number>,
                      ),
                    ).map(([department, count]) => (
                      <div key={department} className="flex justify-between">
                        <span>{department}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </DashboardLayout>
  )
}
