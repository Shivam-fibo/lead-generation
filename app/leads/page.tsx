"use client"

import React from "react"

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
import { AlertCircle, Bot, CheckCircle, ChevronDown, ChevronUp, Flame, HelpCircle, Locate, LocateOff, LucideSnowflake, Pen, PhoneOff, Plus, Upload, User, XCircle } from "lucide-react"
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
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar"

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

interface ChatMessage {
  id: number;
  time: string;
  sender: 'agent' | 'customer';
  message: string;
}

// Define the interface for the raw conversation data
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

  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpand = () => setIsExpanded(!isExpanded);
  const [expanded, setExpanded] = useState(false);


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

    if (newLead?.type === "welcome") {
      console.log('Ignoring welcome message', newLead);
      return;
    }

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


  const parsedConversations = React.useMemo(() => {
    if (!selectedLead?.llm_refined_conversation_history) return [];

    const conversationData = selectedLead.llm_refined_conversation_history;

    // Check if it's an array (new format)
    if (Array.isArray(conversationData)) {
      return processConversationArray(conversationData);
    }

    // If it's a string (old format), use the string parsing function
    if (typeof conversationData === 'string') {
      return extractJsObjectFromConvoString(conversationData);
    }

    return [];
  }, [selectedLead?.llm_refined_conversation_history]);

  const hasConversations = parsedConversations.length > 0;
  const showExpandButton = parsedConversations.length > 3;


  console.log('selectedLead.created_at', selectedLead?.created_at)

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
                  <SheetTitle className="text-2xl font-bold">{selectedLead?.first_name + " " + selectedLead?.last_name}</SheetTitle>
                </div>
              </SheetHeader>
              {selectedLead && (
                <div className="py-6 space-y-6">
                  {/* {selectedLead.reason_of_transfer &&
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
                    </Card>} */}

                  {/* Lead Information Section */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-md font-semibold">LEAD INFORMATION</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Status:</span>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={selectedLead.lead_type} />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Contact:</span>
                        <span className="font-medium text-sm">{selectedLead.contact_number}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Requirement:</span>
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
                        <span className="text-gray-500 text-sm">Call Status:</span>
                        <CallStatus status={selectedLead.call_connection_status} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Site Visit:</span>
                        <span className="font-medium text-sm">
                          {selectedLead.visit_booking_datetime ?
                            selectedLead.visit_booking_datetime
                            // new Date(selectedLead.site_visit).toLocaleString('en-IN', {
                            //   timeZone: 'Asia/Kolkata',
                            //   day: 'numeric',
                            //   month: 'long',
                            //   year: 'numeric',
                            //   hour: 'numeric',
                            //   minute: '2-digit',
                            //   hour12: true
                            // })
                            :
                            'Not scheduled'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Property:</span>
                        <span className="font-medium text-sm">{selectedLead.projectName ? selectedLead.projectName : selectedLead.project_name}</span>
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
                          <p className="text-sm mt-1 leading-relaxed">
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
                      <div className="text-sm flex justify-between">
                        <span className="text-medium text-gray-500">Created at:</span>
                        {selectedLead.created_at ? (
                          (() => {
                            const createdAt = selectedLead.created_at;
                            const standardizedDate = createdAt.match(/(Z|[+-]\d{2}:\d{2})$/)
                              ? createdAt
                              : `${createdAt}Z`;
                            return new Date(standardizedDate).toLocaleString('en-IN', {
                              timeZone: 'Asia/Kolkata',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            });
                          })()
                        ) : (
                          "-"
                        )}
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

                </div>
              )}
            </SheetContent>
          </Sheet>
        </>
      )}
    </DashboardLayout>
  )
}