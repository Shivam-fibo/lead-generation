"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Edit,
  Trash2,
  Search,
  Locate,
  LocateOff,
  Eye,
  Calendar,
  Phone,
  X,
  Flame,
  CheckCircle,
  ChevronDown
} from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface Role {
  _id: string;
  name: string;
}
interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  IsReached: boolean;
  createdAt: string;
  needsImmediateCall: boolean;
  requirement?: string;
  callStatus?: string;
  siteVisit?: string;
  property?: string;
  callSummary?: string;
  followUpReason?: string;
}

const mockLeads = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@company.com",
    phone: "+91 9123867523",
    status: "Hot",
    IsReached: true,
    createdAt: "2024-06-10",
    needsImmediateCall: true,
    requirement: "4BHK",
    callStatus: "completed",
    siteVisit: "Sunday, 15-06-2025",
    property: "Naroda Lavish",
    callSummary: "The client is interested in a 4BHK flat and has booked a site visit for June 15, 2025, at 4 PM. They also inquired about further details which the agent could not provide.",
    followUpReason: "The user inquired about the 'एक लेट है', and the AI Agent could not provide detailed information. This requires the Sales Team to follow up with the user for further assistance."
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@tech.com",
    phone: "+91 7789867523",
    status: "Cold",
    IsReached: false,
    createdAt: "2024-06-09",
    needsImmediateCall: false,
    requirement: "2BHK",
    callStatus: "pending",
    siteVisit: "No visit scheduled",
    property: "Tech Park Residency",
    callSummary: "Initial inquiry about 2BHK apartments. Client seems price-sensitive and wants to compare options.",
    followUpReason: "Client requested detailed pricing and floor plans for comparison."
  },
  {
    id: "3",
    name: "Emma Davis",
    email: "emma.davis@startup.io",
    phone: "+91 7564867523",
    status: "Cold",
    IsReached: true,
    createdAt: "2024-06-08",
    needsImmediateCall: false,
    requirement: "3BHK",
    callStatus: "completed",
    siteVisit: "No visit scheduled",
    property: "Startup Heights",
    callSummary: "Interested in 3BHK with home office space. Budget discussed and seems feasible.",
    followUpReason: "Need to schedule site visit and provide customization options for home office."
  },
  {
    id: "4",
    name: "James Wilson",
    email: "james.w@enterprise.com",
    phone: "+91 9753867523",
    status: "Hot",
    IsReached: false,
    createdAt: "2024-06-07",
    needsImmediateCall: true,
    requirement: "5BHK",
    callStatus: "missed",
    siteVisit: "Pending scheduling",
    property: "Enterprise Towers",
    callSummary: "High-value client interested in premium 5BHK penthouse. Multiple missed calls.",
    followUpReason: "Urgent follow-up required due to high-value prospect and multiple missed connections."
  },
  {
    id: "5",
    name: "Lisa Anderson",
    email: "l.anderson@company.net",
    phone: "+91 8425867523",
    status: "Cold",
    IsReached: true,
    createdAt: "2024-06-06",
    needsImmediateCall: false,
    requirement: "2BHK",
    callStatus: "completed",
    siteVisit: "No visit scheduled",
    property: "Anderson Apartments",
    callSummary: "Budget-conscious buyer looking for starter home. Interested in loan assistance.",
    followUpReason: "Follow up with financing options and loan partner details."
  }
]


export default function LeadsList({ members, onEdit, onDelete }: any) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead)
    setIsDrawerOpen(true)
  }


  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusStyle = (status: string) => {
      switch (status.toLowerCase()) {
        case 'hot':
          return "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
        case 'cold':
          return "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
        case 'warm':
          return "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
        default:
          return "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
      }
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${getStatusStyle(status)}`}>
        {status}
      </span>
    )
  }

  const ReachedBadge = ({ isReached }: { isReached: boolean }) => {
    const style = isReached
      ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
      : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${style}`}>
        {isReached ? (
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

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Total Leads ({members.length})</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Call Priority</TableHead>
                  <TableHead>IsReached</TableHead>
                  <TableHead>CreatedAt</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell className="font-medium">{lead.phone}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>
                      <StatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell>
                      <CallImmediatelyBadge needsCall={lead.needsImmediateCall} />
                    </TableCell>
                    <TableCell>
                      <ReachedBadge isReached={lead.IsReached} />
                    </TableCell>
                    <TableCell>{lead.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {/* <Button variant="outline" size="sm" onClick={() => onEdit(lead)}> */}
                        <Button variant="outline" size="sm" onClick={() => handleViewLead(lead)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete {lead.name} from the Leads.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              {/* <AlertDialogAction onClick={() => onDelete(lead._id)}>Delete</AlertDialogAction> */}
                              <AlertDialogAction>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-[600px] sm:w-[600px] overflow-y-auto">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-2xl font-bold">{selectedLead?.name}</SheetTitle>
            </div>
{/* 
            {selectedLead && (
              <div className="flex flex-col items-start gap-4 text-sm text-gray-600 pt-2">
                
                <div className="flex items-center justify-between gap-1 w-full">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span className=" text-sm">Visit scheduled</span>
                  </div>
                  <span className="font-medium text-sm">{selectedLead.siteVisit}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span className="font-medium">{selectedLead.phone}</span>
                </div>
              </div>
            )} */}

          </SheetHeader>

          {selectedLead && (
            <div className="py-6 space-y-6">

              {selectedLead.status === "Hot" && <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-md font-semibold text-yellow-800 flex items-center gap-2">
                    <Flame className="h-5 w-5" />
                    WHY IMMEDIATE FOLLOW UP?
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selectedLead.followUpReason}
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
                      <StatusBadge status={selectedLead.status} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Contact:</span>
                    <span className="font-medium text-sm">{selectedLead.phone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Requirement:</span>
                    <span className="font-medium text-sm">{selectedLead.requirement}</span>
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
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-green-600 text-sm">{selectedLead.callStatus}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Site Visit:</span>
                    <span className="font-medium text-sm">{selectedLead.siteVisit}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Property:</span>
                    <span className="font-medium text-sm">{selectedLead.property}</span>
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
                        {selectedLead.callSummary}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Conversation History Section */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-md font-semibold">Conversation History</CardTitle>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500">
                    Created: {selectedLead.createdAt}, 12:22:35
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
