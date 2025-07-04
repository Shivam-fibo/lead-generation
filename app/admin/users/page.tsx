"use client"

import type React from "react"
import type { TeamMember } from "@/lib/api"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { LoadingScreen, TeamSkeleton } from "@/components/loading-screen"
import TeamMemberForm from "@/components/team-member-form" // still used in dialog
import TeamMemberEditForm from "@/components/team-member-edit-form" // still used in dialog
import { AddUserDialog, EditUserDialog } from "./UserDialogs"
// import TeamMemberList from "@/components/team-member-list"
import { DataTable } from "@/components/data-table"
import { createTeamMemberColumns } from "./columns"
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

export default function LeadManagement() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore()
  const {
    members: apiMembers,
    isLoading: teamLoading,
    addMember: addTeamMember,
    addMembersCsv,
    updateMember: updateTeamMember,
    deleteMember: deleteTeamMember,
    isAddingMember,
    isAddingMembersCsv,
    isUpdatingMember
  } = useTeam()

  const members = apiMembers

  console.log('apiMembers', apiMembers)

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const router = useRouter()

  console.log('editingMember:', editingMember)

//   useEffect(() => {
//     if (!authLoading) {
//       if (!user || !isAuthenticated) {
//         console.log('No authenticated user, redirecting to login')
//         router.push("/")
//         return
//       }

//       if (user.role !== "Admin") {
//         console.log('User is not admin, redirecting to dashboard')
//         router.push("/dashboard")
//         return
//       }
//     }
//   }, [authLoading, router, user, isAuthenticated])

  const handleAddMember = (memberData: Omit<TeamMember, "_id">) => {
    addTeamMember(memberData);
    setShowAddDialog(false);
  }

  const handleEditMember = (memberData: Partial<TeamMember>) => {
    if (!editingMember?._id) return;
    updateTeamMember(editingMember._id, memberData);
    setEditingMember(null);
    setShowEditDialog(false);
  }

  const handleDeleteMember = (id: string) => {
    deleteTeamMember(id)
  }
  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const csv = e.target?.result as string
      const lines = csv.split("\n").filter(line => line.trim())
      const members: Omit<TeamMember, "_id">[] = []

      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].match(/(?:\"([^\"]*)\"|([^,]+))/g)?.map(v =>
          v.trim().replace(/^"|"$/g, '').trim()
        ) || []

        if (values.length >= 6) {
          try {
            const roleId = values[5] || "68381f3578431cf9a9e1bba5" // Default to Team Member role if not specified
            const roleName = "Team Member" // Default role name

            const newMember = {
              username: values[0],
              email: values[1],
              first_name: values[2],
              last_name: values[3],
              number: values[4],
              roles: [{ _id: roleId, name: roleName }],
              password: values[6] || 'default123',
            }
            members.push(newMember)
          } catch (error) {
            console.error(`Error processing line ${i + 1}:`, error)
          }
        }
      }

      if (members.length > 0) {
        addMembersCsv(members)
      }
    }
    reader.onerror = (error) => {
      console.error('Error reading CSV file:', error)
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
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </div>
          </div>

          <input id="csv-upload" type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />

          <Tabs defaultValue="list" className="space-y-4">
            {/* <TabsList>
              <TabsTrigger value="list">Team List</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList> */}

            <TabsContent value="list" className="space-y-4">
              <AddUserDialog
                open={showAddDialog}
                onClose={() => setShowAddDialog(false)}
                onSubmit={handleAddMember}
              />
              {editingMember && (
                <EditUserDialog
                  open={showEditDialog}
                  onClose={() => {
                    setShowEditDialog(false)
                    setEditingMember(null)
                  }}
                  initialData={editingMember}
                  onSubmit={handleEditMember}
                />
              )}

              <DataTable
                data={members}
                columns={createTeamMemberColumns({
                  onEdit: (member) => {
                    setEditingMember(member)
                    setShowEditDialog(true)
                  },
                  onDelete: handleDeleteMember
                })}
              />
            </TabsContent>

            {/* <TabsContent value="stats" className="space-y-4">
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
            </TabsContent> */}
          </Tabs>
        </div>
      )}
    </DashboardLayout>
  )
}
