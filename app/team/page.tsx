"use client"

import type React from "react"
import type { TeamMember } from "@/lib/api"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { LoadingScreen, TeamSkeleton } from "@/components/loading-screen"
import TeamMemberForm from "@/components/team-member-form"
import TeamMemberEditForm from "@/components/team-member-edit-form"
import TeamMemberList from "@/components/team-member-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Upload } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useTeamStore } from "@/stores/team-store"
import { useTeam } from "@/hooks/use-team"


interface AddTeamMember {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  number: string;
  roles: string[];
  password: string;
}

export default function TeamManagement() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore()
  const {
    members: apiMembers,
    isLoading: teamLoading,
    addMember: addTeamMember,
    updateMember: updateTeamMember,
    // deleteMember: deleteTeamMember,
    isAddingMember,
    // isUpdatingMember
  } = useTeam()

  const members = apiMembers

  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const router = useRouter()

  console.log('editingMember:', editingMember)

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAuthenticated) {
        console.log('No authenticated user, redirecting to login')
        router.push("/")
        return
      }

      if (user.roles[0].name !== "Admin") {
        console.log('User is not admin, redirecting to dashboard')
        router.push("/dashboard")
        return
      }
    }
  }, [authLoading, router, user, isAuthenticated])

  const handleAddMember = (memberData: Omit<TeamMember, "_id">) => {
    addTeamMember(memberData);
    setShowForm(false);
  }

  const handleEditMember = (memberData: Partial<TeamMember>) => {    
      if (!editingMember?._id) return;
      updateTeamMember(editingMember._id, memberData);
      setEditingMember(null);
      setShowForm(false);
  }

  
  // const handleDeleteMember = (id: string) => {
  //   deleteTeamMember(parseInt(id))
  // }

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
          // handleAddMember(newMember)
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
      {teamLoading ? (
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
                    {editingMember ? (
                      <TeamMemberEditForm
                        initialData={editingMember}
                        onSubmit={handleEditMember}
                        onCancel={() => {
                          setShowForm(false)
                          setEditingMember(null)
                        }}
                      />
                    ) : (
                      <TeamMemberForm
                        onSubmit={handleAddMember}
                        onCancel={() => {
                          setShowForm(false)
                          setEditingMember(null)
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              )}

              <TeamMemberList
                members={members}
                onEdit={(member) => {
                  setEditingMember(member)
                  setShowForm(true)
                }}
              // onDelete={handleDeleteMember}
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
                    {/* <div className="text-3xl font-bold">{new Set(members.flatMap((m) => m.skillTags)).size}</div> */}
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
