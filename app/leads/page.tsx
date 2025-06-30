"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { LeadSkeleton } from "@/components/loading-screen"
import TeamMemberForm from "@/components/team-member-form"
import TeamMemberEditForm from "@/components/team-member-edit-form"
import LeadsList from "@/components/leads-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, CheckCircle, Flame, HelpCircle, Locate, LocateOff, LucideSnowflake, Pen, PhoneOff, Plus, Upload, XCircle } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useLeadList } from "@/hooks/use-leads"
import LeadForm, { Lead } from "@/components/lead-form"
// import { columns } from "./columns"
import { createColumns } from "./columns"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import { DataTable } from "@/components/data-table"
import { useWebSocket } from "@/lib/websocket"
import { QueryClient, useQueryClient } from "@tanstack/react-query"

interface AddTeamMember {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  number: string;
  roles: string[];
  password: string;
}
const StatusBadge = ({ status }: { status: boolean }) => {
  const getStatusStyle = (status: boolean) => {
    if (status) {
      return "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
    } else {
      return "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
    }
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${getStatusStyle(status)}`}>
      {status ? (
        <>
          <Flame className="h-3.5 w-3.5 mr-0.5" />
          <span> Hot </span>
        </>
      ) : (
        <>
          <LucideSnowflake className="h-3.5 w-3.5 mr-0.5" />
          <span> Cold </span>
        </>
      )}
    </span>
  )
}

const ReachedBadge = ({ HasReached }: { HasReached: boolean }) => {
  const style = HasReached
    ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
    : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${style}`}>
      {HasReached ? (
        <>
          <Locate className="h-3 w-3" />
          Reached
        </>
      ) : (
        <>
          <LocateOff className="h-3 w-3" />
          Not Reached
        </>
      )}
    </span>
  )
}

const CallImmediatelyBadge = ({ needsCall }: { needsCall: boolean }) => {
  if (needsCall) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 animate-pulse">
        📞 Call Now
      </span>
    )
  } else {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100">
        📅 Standard
      </span>
    )
  }
}

const CallStatus = ({ status }: { status: string }) => {
  if (status === "completed") {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span className="font-medium text-green-600 text-sm">Completed</span>
      </div>
    );
  }

  if (status === "no-answer") {
    return (
      <div className="flex items-center gap-2">
        <PhoneOff className="h-4 w-4 text-yellow-500" />
        <span className="font-medium text-yellow-600 text-sm">No Answer</span>
      </div>
    );
  }

  if (status === "busy") {
    return (
      <div className="flex items-center gap-2">
        <XCircle className="h-4 w-4 text-orange-500" />
        <span className="font-medium text-orange-600 text-sm">Busy</span>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <span className="font-medium text-red-600 text-sm">Failed</span>
      </div>
    );
  }

  // Optional: fallback UI if status is unknown
  return (
    <div className="flex items-center gap-2">
      <HelpCircle className="h-4 w-4 text-gray-500" />
      <span className="font-medium text-gray-600 text-sm capitalize">{status || "Unknown"}</span>
    </div>
  );
};

export default function LeadManagement() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore()
  const {
    leads,
    pagination,
    error: leadError,
    isError: isLeadError,
    isLoading: isLeadLoading,
    isSuccess: isLeadSuccess
  } = useLeadList()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingLead, setEditingLead] = useState<TeamMember | null>(null)
  const router = useRouter()
  const [selectedLead, setSelectedLead] = useState<any | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const queryClient = useQueryClient()

  const { send: sendWebSocketMessage } = useWebSocket('new_lead', (newLead: any) => {
    console.log('New lead received via WebSocket:', newLead)
    handleNewLeadReceived(newLead)
  })


  const handleNewLeadReceived = (newLead: any) => {
    console.log('Handling new lead:', newLead);

    queryClient.setQueryData(['getAllLeads'], (oldData: any) => {

      if (!oldData) {
        return {
          data: [newLead],
          pagination: null
        }
      }

      // Check if lead already exists to avoid duplicates
      // const leadExists = oldData.data?.some((lead: any) => lead._id === newLead._id)
      // if (leadExists) {
      //   console.log('Lead already exists, not adding duplicate');
      //   return oldData
      // }

      // Create new data structure with the new lead added to the beginning
      const updatedData = {
        ...oldData,
        data: [newLead, ...(oldData.data || [])]
      }

      console.log('Updated data structure:', updatedData);
      return updatedData
    })

    // Optional: Show a toast notification
    // toast.success('New lead received!')
  }

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

  const handleViewLead = (lead: any) => {
    setSelectedLead(lead)
    setIsDrawerOpen(true)
  }

  const columns = createColumns({
    onView: handleViewLead,
    onEdit: handleEditClick,
    onDelete: handleDeleteLead,
  })

  return (
    <DashboardLayout>
      {isLeadLoading ? (
        <LeadSkeleton />
      ) : (
        <>
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
                <DataTable
                  data={leads}
                  columns={columns}
                  handleCellClickCb={handleViewLead}
                  // For on View
                  clickableColumns={
                    [
                      "first_name",
                      "contact_number",
                      "is_hot_lead",
                      "call_priority",
                      "reached",
                      "createdAt"
                    ]
                  }
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

          <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <SheetContent className="w-[450px] overflow-y-auto">
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-2xl font-bold">{selectedLead?.first_name}</SheetTitle>
                </div>
              </SheetHeader>
              {selectedLead && (
                <div className="py-6 space-y-6">
                  {selectedLead.reason_of_transfer &&
                    <Card className="bg-yellow-50 border-yellow-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-md font-semibold text-yellow-800 flex items-center gap-2">
                          <Flame className="h-5 w-5" />
                          WHY IMMEDIATE FOLLOW UP?
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {selectedLead.reason_of_transfer}
                        </p>
                      </CardContent>
                    </Card>}

                  {/* Lead Information Section */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-md font-semibold">LEAD INFORMATION</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Status:</span>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={selectedLead.is_hot_lead} />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Contact:</span>
                        <span className="font-medium text-sm">{selectedLead.contact_number}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Requirement:</span>
                        <span className="font-medium text-sm">{selectedLead.requirement ? selectedLead.requirement : "-"}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Visit Information Section */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-md font-semibold">VISIT INFORMATION</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Call Status:</span>
                        <CallStatus status={selectedLead.call_status} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Site Visit:</span>
                        <span className="font-medium text-sm">
                          {selectedLead.site_visit ?

                            new Date(selectedLead.site_visit).toLocaleString('en-IN', {
                              timeZone: 'Asia/Kolkata',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })
                            :
                            'Not scheduled'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Property:</span>
                        <span className="font-medium text-sm">{selectedLead.projectName}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Call Details Section */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-md font-semibold">CALL DETAILS</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                            {selectedLead.call_summary ? selectedLead.call_summary : "-"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Conversation History Section */}
                  <Card>
                    {/* <CardHeader className="pb-3"> */}
                    <CardHeader className="pb-0">
                      {/* <div className="flex items-center justify-between"> */}
                      {/* <CardTitle className="text-md font-semibold">Conversation History</CardTitle>
                    <ChevronDown className="h-4 w-4 text-gray-400" /> */}
                      {/* </div> */}
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-500">

                        <span> Created at: </span>
                        {selectedLead.createdAt ?

                          new Date(selectedLead.createdAt).toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })
                          :
                          "-"}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </>
      )}
    </DashboardLayout>
  )
}