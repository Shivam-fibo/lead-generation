"use client"

import React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { LeadSkeleton, LoadingScreen, TeamSkeleton } from "@/components/loading-screen"
import TeamMemberForm from "@/components/team-member-form"
import TeamMemberEditForm from "@/components/team-member-edit-form"
// import SiteVisitsList from "@/components/site-visit-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Filter,
  Pen,
  Plus,
  Search,
  Upload,
  Edit,
  Trash2,
  Locate,
  LocateOff,
  Eye,
  Calendar,
  Phone,
  X,
  Flame,
  CheckCircle,
  ChevronDown,
  LucideSnowflake,
  ChevronUp,
  Bot
} from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useLeadList } from "@/hooks/use-leads"
import SiteVisitForm from "@/components/site-visits-form"
import { DataTable } from "@/components/data-table"
import { createColumns } from "./columns"

import { Input } from "@/components/ui/input"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import { mockSiteVisits } from "@/components/site-visit-list"
import { useSiteVisits } from "@/hooks/use-site-visits"

interface AddTeamMember {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  number: string;
  roles: string[];
  password: string;
}
interface ChatMessage {
  id: number;
  time: string;
  sender: 'agent' | 'customer';
  message: string;
}


interface RawConversationMessage {
  _id: string;
  timestamp: string;
  speaker: string;
  text: string;
}

interface ChatUIProps {
  conversations: ChatMessage[];
  expanded: boolean;
}


const StatusBadge = ({ lead }: { lead: String }) => {
  let status;
  if (lead === "Cold") {
    status = false;
  } else if (lead === "Hot") {
    status = true
  } else {
    status = false;
  }
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

const processConversationArray = (conversations: RawConversationMessage[]): ChatMessage[] => {
  if (!conversations || !Array.isArray(conversations)) return [];

  return conversations.map((convo: RawConversationMessage, index: number) => {
    const sender: 'agent' | 'customer' = convo.speaker.toLowerCase() === 'agent' ? 'agent' : 'customer';
    let message: string = convo.text;

    // Remove <CHARACTER: backup> tags if present
    message = message.replace(/<CHARACTER: backup>/g, '').replace(/<\/CHARACTER>/g, '');

    return {
      id: index,
      time: convo.timestamp || new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5), // Use backend timestamp
      sender,
      message: message.trim()
    };
  });
};

const extractJsObjectFromConvoString = (convo: string): ChatMessage[] => {
  if (!convo || typeof convo !== 'string') return [];

  const lines: string[] = convo.trim().split('\n').filter(line => line.trim());
  const conversation: ChatMessage[] = [];

  lines.forEach((line: string, index: number) => {
    const match: RegExpMatchArray | null = line.match(/^\[(\d{2}:\d{2}:\d{2})\] (Agent|Customer): (.+)/);

    if (match) {
      const time: string = match[1];
      const sender: 'agent' | 'customer' = match[2].toLowerCase() as 'agent' | 'customer';
      let message: string = match[3];

      // Remove <CHARACTER: backup> tags if present
      message = message.replace(/<CHARACTER: backup>/g, '').replace(/<\/CHARACTER>/g, '');

      conversation.push({
        id: index,
        time,
        sender,
        message: message.trim()
      });
    }
  });

  return conversation;
};


const ChatUI: React.FC<ChatUIProps> = ({ conversations, expanded }) => {
  const displayedConversations = expanded ? conversations : conversations.slice(0, 3);

  return (
    <div className="space-y-4">
      {displayedConversations.map((chat: ChatMessage) => (
        <div key={chat.id} className="mb-4 mt-4">
          {chat.sender === 'agent' ? (
            // Agent Message
            <div className="flex items-start justify-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-muted text-neutral-900 dark:text-neutral-200 rounded-full flex items-center justify-center font-semibold">
                  <Bot className="h-5 w-5" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  {/* <span className="text-xs text-gray-500 px-2 py-1 rounded-full">Agent</span> */}
                </div>
                <div className="bg-muted text-neutral-900 dark:text-neutral-200 rounded-lg rounded-tl-none px-4 py-2 max-w-md">
                  <p className="text-sm leading-relaxed">{chat.message}</p>
                </div>
                <span className="text-xs text-gray-500 px-2 py-1 rounded-full justify-start">{chat.time}</span>
              </div>
            </div>
          ) : (
            // Customer Message
            <div className="flex items-start justify-end space-x-3">
              <div className="flex-1">
                <div className="flex items-center justify-end space-x-2 mb-1">
                </div>
                <div className="bg-neutral-900 text-white rounded-lg px-4 py-2 rounded-tr-none p-3 max-w-md ml-auto">
                  <p className="text-sm text-white leading-relaxed">{chat.message}</p>
                </div>
                <span className="text-xs text-gray-500 px-2 py-1 rounded-full flex items-center justify-end">
                  {chat.time}
                </span>
              </div>
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-neutral-900 text-white rounded-full flex items-center justify-center font-semibold shadow-lg">
                  U
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};




export default function SiteVisitManagement() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore()

  const { data: siteVisitsData, isLoading } = useSiteVisits()

  const [expanded, setExpanded] = useState(false);

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingLead, setEditingLead] = useState<TeamMember | null>(null)
  const [selectedSiteVisit, setSelectedSiteVisit] = useState<any | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const router = useRouter()


  // useEffect(() => {
  //   if (!authLoading) {
  //     if (!user || !isAuthenticated) {
  //       console.log('No authenticated user, redirecting to login')
  //       router.push("/")
  //       return
  //     }

  //     if (user.roles[0].name !== "Admin") {
  //       console.log('User is not admin, redirecting to dashboard')
  //       router.push("/dashboard")
  //       return
  //     }
  //   }
  // }, [authLoading, router, user, isAuthenticated])

  const handleViewSiteVisit = (siteVisit: any) => {
    setSelectedSiteVisit(siteVisit)
    setIsDrawerOpen(true)
  }

  const handleAddLead = (memberData: Omit<TeamMember, "_id">) => {
    // addTeamMember(memberData);
    setShowAddDialog(false);
  }

  const handleEditLead = (memberData: Partial<TeamMember>) => {
    if (!editingLead?._id) return;
    updateTeamMember(editingLead._id, memberData);
    setEditingLead(null);
    setShowEditDialog(false);
  }

  const handleDeleteLead = (id: string) => {
    deleteTeamMember(id)
  }

  const handleEditClick = (member: TeamMember) => {
    setEditingLead(member)
    setShowEditDialog(true)
  }

  // Create columns with handlers
  const columns = createColumns({
    onView: handleViewSiteVisit,
    onEdit: handleEditClick,
    onDelete: handleDeleteLead,
  })

  const parsedConversations = React.useMemo(() => {
    if (!selectedSiteVisit?.llm_refined_conversation_history) return [];

    const conversationData = selectedSiteVisit.llm_refined_conversation_history;

    // Check if it's an array (new format)
    if (Array.isArray(conversationData)) {
      return processConversationArray(conversationData);
    }

    // If it's a string (old format), use the string parsing function
    if (typeof conversationData === 'string') {
      return extractJsObjectFromConvoString(conversationData);
    }

    return [];
  }, [selectedSiteVisit?.llm_refined_conversation_history]);



  const hasConversations = parsedConversations.length > 0;
  const showExpandButton = parsedConversations.length > 3;


  return (
    <DashboardLayout>
      {isLoading ? (
        <LeadSkeleton />
      ) : (
        <>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Site Visits</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage all scheduled site visits and meetings</p>
              </div>
              <div className="flex space-x-2">
                {/* <Button variant="outline" onClick={() => document.getElementById("csv-upload")?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Export CSV
                </Button> */}
                {/* <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Site Visit
                </Button> */}
              </div>
            </div>

            {/* Results Summary */}
            {/* <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredLeads.length} of {mockLeads.length} leads
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Total Value: ${filteredLeads.reduce((sum, lead) => sum + (lead.value || 0), 0).toLocaleString()}</span>
          </div>
        </div> */}

            <Tabs defaultValue="list" className="space-y-4">
              <TabsContent value="list" className="space-y-4">
                <DataTable
                  data={siteVisitsData} // Replace with your actual site visits data
                  columns={columns}
                  handleCellClickCb={handleViewSiteVisit}
                  clickableColumns={[
                    "first_name",
                    "project",
                    "schedule_datetime",
                    "contact_number",
                    "status"
                  ]}
                />

                {/* Commented out SiteVisitsList component */}
                {/* <SiteVisitsList
              // leads={members}
              onEdit={handleEditClick}
              onDelete={handleDeleteLead}
            /> */}
              </TabsContent>
            </Tabs>

            {/* Add Lead Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add New Site Visit</span>
                  </DialogTitle>
                </DialogHeader>

                <div className="mt-4">
                  <SiteVisitForm
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
                    <span>Edit Site Visit</span>
                  </DialogTitle>
                  {/* <DialogDescription>
                Update the site visit information below
              </DialogDescription> */}
                </DialogHeader>

                <div className="mt-4">
                  {editingLead && (
                    <SiteVisitForm
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
            <SheetContent className="w-[450px] sm:w-[450px] overflow-y-auto">
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-2xl font-bold">{selectedSiteVisit?.first_name + " " + selectedSiteVisit?.last_name}</SheetTitle>
                </div>
              </SheetHeader>
              {selectedSiteVisit && (
                <div className="py-6 space-y-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-md font-semibold">VISIT INFO</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Property:</span>
                        <span className="font-medium text-sm">{selectedSiteVisit?.project_name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Call Status:</span>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-green-600 text-sm">{selectedSiteVisit?.call_connection_status}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Visit Date :</span>
                        <span className="font-medium text-sm">
                          {selectedSiteVisit?.visit_booking_datetime
                            ? new Date(selectedSiteVisit.visit_booking_datetime).toLocaleString('en-IN', {
                              timeZone: 'Asia/Kolkata',
                              weekday: 'long',
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            }).replace(',', ' at')
                            : 'Not scheduled'}
                        </span>
                      </div>
                      {/* <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Visit Status :</span>
                        <span className="font-medium text-sm">{selectedSiteVisit.Status}</span>
                      </div> */}
                    </CardContent>
                  </Card>


                  {/* Lead Information Section */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-md font-semibold">LEAD INFO</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Status:</span>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={selectedSiteVisit?.lead_type} />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Contact:</span>
                        <span className="font-medium text-sm">{selectedSiteVisit?.contact_number}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Requirement:</span>
                        <span className="font-medium text-sm">{selectedSiteVisit?.requirement}</span>
                      </div>

                      {/* <div className="flex justify-between items-center"> */}
                      {/* <span className="text-gray-600 text-sm">Email:</span> */}
                      {/* <span className="font-medium text-sm">{selectedSiteVisit?.email}</span> */}
                      {/* </div> */}

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Has Reached:</span>
                        <ReachedBadge HasReached={selectedSiteVisit?.reached} />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Call Priority:</span>
                        <CallImmediatelyBadge needsCall={selectedSiteVisit?.call_immediately} />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Created At:</span>
                        <span className="font-medium text-sm">
                          {new Date(selectedSiteVisit?.created_at).toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Call Details Section */}
                  {/* <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-md font-semibold">NOTES</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                            {selectedSiteVisit.Notes}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card> */}

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-md font-semibold">CALL DETAILS</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                            {selectedSiteVisit?.call_summary}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-0">
                      <h3 className="text-md font-semibold">Conversation History</h3>
                    </CardHeader>
                    <CardContent>
                      {hasConversations ? (
                        <>
                          <ChatUI conversations={parsedConversations} expanded={expanded} />
                          {showExpandButton && (
                            <button
                              onClick={() => setExpanded(!expanded)}
                              className="mt-3 flex items-center gap-1 text-xs text-gray-900 dark:text-gray-200 hover:underline focus:outline-none"
                            >
                              {expanded ? (
                                <>
                                  <ChevronUp className="h-3 w-3" />
                                  Show less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3" />
                                  Show more ({parsedConversations.length - 3} more messages)
                                </>
                              )}
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-gray-500 text-center py-4">
                          *No conversation data found*
                        </div>
                      )}
                    </CardContent>
                  </Card>


                  {/* Conversation History Section */}
                  {/* <Card>
                <CardHeader className="pb-0">
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500">
                    Created: {selectedSiteVisit.createdAt}, 12:22:35
                  </div>
                </CardContent>
              </Card> */}
                </div>
              )}
            </SheetContent>
          </Sheet>
        </>)}
    </DashboardLayout>
  )
}