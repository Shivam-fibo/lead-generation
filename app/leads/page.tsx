"use client"

import type React from "react"
import type { TeamMember } from "@/lib/api"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { LoadingScreen, TeamSkeleton } from "@/components/loading-screen"
import TeamMemberForm from "@/components/team-member-form"
import TeamMemberEditForm from "@/components/team-member-edit-form"
import LeadsList from "@/components/leads-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pen, Plus, Upload } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useLeadList } from "@/hooks/use-leads"
import LeadForm, { Lead } from "@/components/lead-form"

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
    leads,
    pagination,
    error : leadError,
    isError : isLeadError,
    isLoading : isLeadLoading,
    isSuccess : isLeadSuccess
  } = useLeadList()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingLead, setEditingLead] = useState<TeamMember | null>(null)
  const router = useRouter()

  console.log('editingLead:', editingLead)

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

  const handleAddLead = (memberData: Omit<TeamMember, "_id">) => {
    // addTeamMember(memberData);
    setShowAddDialog(false);
  }

  const handleEditLead = (memberData: Partial<TeamMember>) => {
    if (!editingLead?._id) return;
    // updateTeamMember(editingLead._id, memberData);
    setEditingLead(null);
    setShowEditDialog(false);
  }

  const handleDeleteLead = (id: string) => {
    // deleteTeamMember(id)
  }

  const handleEditClick = (member: TeamMember) => {
    setEditingLead(member)
    setShowEditDialog(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Lead Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and track all your leads</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => document.getElementById("csv-upload")?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* <input id="csv-upload" type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" /> */}

        <Tabs defaultValue="list" className="space-y-4">
          <TabsContent value="list" className="space-y-4">
            <LeadsList
              leads={leads}
              onEdit={handleEditClick}
              onDelete={handleDeleteLead}
              pagination={pagination}
            />
          </TabsContent>
        </Tabs>

        {/* Add Lead Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add New Lead</span>
              </DialogTitle>
              {/* <DialogDescription>
                Fill in the details to add a new lead to your system
              </DialogDescription> */}
            </DialogHeader>

            <div className="mt-4">
              <LeadForm
                onSubmit={handleAddLead}
                onCancel={() => setShowAddDialog(false)}
                isEditing={false}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Lead Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Pen className="h-4 w-4" />
                <span>Edit Lead</span>
              </DialogTitle>
              {/* <DialogDescription>
                Update the lead information below
              </DialogDescription> */}
            </DialogHeader>

            <div className="mt-4">
              {editingLead && (
                <LeadForm
                  initialData={editingLead}
                  onSubmit={handleEditLead}
                  onCancel={() => {
                    setShowEditDialog(false)
                    setEditingLead(null)
                  }}
                  isEditing={true}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}