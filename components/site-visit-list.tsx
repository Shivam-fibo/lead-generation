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
  ChevronDown,
  LucideSnowflake
} from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  HasReached: boolean;
  createdAt: string;
  needsImmediateCall: boolean;
  requirement?: string;
  callStatus?: string;
  siteVisit?: string;
  property?: string;
  callSummary?: string;
  followUpReason?: string;
}

export const mockSiteVisits = [
  {
    Lead: {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@company.com",
      phone: "+91 9123867523",
      status: "Hot",
      HasReached: true,
      createdAt: "2025-06-04T13:17:51.857+00:00",
      needsImmediateCall: true,
      requirement: "4BHK",
      callStatus: "completed",
      callSummary: "The client is interested in a 4BHK flat and has booked a site visit for June 15, 2025, at 4 PM. They also inquired about further details which the agent could not provide.",
      followUpReason: "The user inquired about the 'एक लेट है', and the AI Agent could not provide detailed information. This requires the Sales Team to follow up with the user for further assistance."
    },
    id: "site_visit_1",
    Property: "Naroda Lavish",
    DateTime: "2025-06-15T16:00:00.000Z",
    Status: "Confirmed",
    Notes: "Client specifically interested in 4BHK units on higher floors. Requires parking for 2 cars. Visit scheduled for 4 PM with property tour and amenities walkthrough."
  },
  {
    Lead: {
      id: "4",
      name: "James Wilson",
      email: "james.w@enterprise.com",
      phone: "+91 9753867523",
      status: "Hot",
      HasReached: false,
      createdAt: "2024-06-07",
      needsImmediateCall: true,
      requirement: "5BHK",
      callStatus: "missed",
      siteVisit: "Pending scheduling",
      property: "Enterprise Towers",
      callSummary: "High-value client interested in premium 5BHK penthouse. Multiple missed calls.",
      followUpReason: "Urgent follow-up required due to high-value prospect and multiple missed connections."
    },
    id: "site_visit_2",
    Property: "Enterprise Towers",
    DateTime: "2025-06-16T10:30:00.000Z",
    Contact: "Priya Sharma - Senior Sales Executive",
    Status: "Tentative",
    Notes: "High-value prospect for penthouse unit. Client has been difficult to reach. Requires premium presentation with architect plans and customization options. VIP treatment recommended."
  },
  {
    Lead: {
      id: "2",
      name: "Michael Chen",
      email: "m.chen@tech.com",
      phone: "+91 7789867523",
      status: "Cold",
      HasReached: false,
      createdAt: "2024-06-09",
      needsImmediateCall: false,
      requirement: "2BHK",
      callStatus: "pending",
      callSummary: "Initial inquiry about 2BHK apartments. Client seems price-sensitive and wants to compare options.",
      followUpReason: "Client requested detailed pricing and floor plans for comparison."
    },
    id: "site_visit_3",
    Property: "Tech Park Residency",
    DateTime: "2025-06-18T14:00:00.000Z",
    Status: "Scheduled",
    Notes: "Budget-conscious client comparing multiple properties. Focus on value proposition, payment plans, and competitive pricing. Show multiple 2BHK options within budget range."
  },
  {
    Lead: {
      id: "3",
      name: "Emma Davis",
      email: "emma.davis@startup.io",
      phone: "+91 7564867523",
      status: "Cold",
      HasReached: true,
      createdAt: "2024-06-08",
      needsImmediateCall: false,
      requirement: "3BHK",
      callStatus: "completed",
      callSummary: "Interested in 3BHK with home office space. Budget discussed and seems feasible.",
      followUpReason: "Need to schedule site visit and provide customization options for home office."
    },
    id: "site_visit_4",
    Property: "Startup Heights",
    DateTime: "2025-06-20T11:00:00.000Z",
    Status: "Confirmed",
    Notes: "Client needs dedicated home office space. Show units with study room or convertible spaces. Discuss interior customization options and work-from-home friendly layouts."
  },
  {
    Lead: {
      id: "6",
      name: "Robert Kumar",
      email: "robert.k@finance.com",
      phone: "+91 9876543210",
      status: "Cold",
      HasReached: true,
      createdAt: "2024-06-05",
      needsImmediateCall: false,
      requirement: "3BHK",
      callStatus: "completed",
      callSummary: "Investment buyer looking for rental yield properties. Interested in multiple units.",
      followUpReason: "Discuss bulk purchase options and investment returns."
    },
    id: "site_visit_5",
    Property: "Finance Plaza",
    DateTime: "2025-06-17T15:30:00.000Z",
    Status: "Confirmed",
    Notes: "Investment-focused buyer considering multiple units. Prepare rental yield analysis, market trends, and bulk purchase incentives. Show prime location advantages."
  },
  {
    Lead: {
      id: "7",
      name: "Anita Mehta",
      email: "anita.mehta@gmail.com",
      phone: "+91 8765432109",
      status: "Hot",
      HasReached: true,
      createdAt: "2024-06-03",
      needsImmediateCall: false,
      requirement: "2BHK",
      callStatus: "completed",
      callSummary: "First-time homebuyer with loan pre-approval. Very interested in eco-friendly features.",
      followUpReason: "Client loved the green features, wants to finalize quickly."
    },
    id: "site_visit_6",
    Property: "Green Valley",
    DateTime: "2025-06-19T09:00:00.000Z",
    Status: "Rescheduled",
    Notes: "Eco-conscious buyer with loan pre-approval. Highlight sustainable features, energy efficiency, and green certifications. Client rescheduled from previous date due to family emergency."
  },
  {
    Lead: {
      id: "8",
      name: "David Thompson",
      email: "d.thompson@global.com",
      phone: "+91 7654321098",
      status: "Cold",
      HasReached: false,
      createdAt: "2024-06-02",
      needsImmediateCall: true,
      requirement: "4BHK",
      callStatus: "callback_requested",
      callSummary: "Expatriate looking for family accommodation. Specific requirements for international school proximity.",
      followUpReason: "Follow up on school district information and expat community details."
    },
    id: "site_visit_7",
    Property: "Global Towers",
    DateTime: "2025-06-21T16:30:00.000Z",
    Status: "Pending Confirmation",
    Notes: "Expatriate client with family. Emphasize international school proximity, expat community, and Western-style amenities. Waiting for client confirmation on visit timing."
  }
];


export default function SiteVisitsList({ leads, onEdit, onDelete }: any) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSiteVisit, setSelectedSiteVisit] = useState<any | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [leadFilter, setLeadFilter] = useState<string>("all")

  const handleViewLead = (siteVisit: any) => {
    setSelectedSiteVisit(siteVisit)
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
      <span className={`inline-flex items-center  px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${getStatusStyle(status)}`}>
        {status === "Hot" ?
          <Flame className="h-3.5 w-3.5 mr-0.5" />
          :
          <LucideSnowflake className="h-3.5 w-3.5 mr-0.5" />
        }
        {status}
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

  const truncateText = (text: string, maxLength: number = 50): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

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
          <CardTitle>Total Site Visits ({mockSiteVisits.length})</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2" >
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search Site Visits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div>
              <Select value={leadFilter} onValueChange={setLeadFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Select Lead</SelectItem>
                  {
                    mockSiteVisits.map((item) => {
                      return <SelectItem key={item.id} value={`${item.Lead.name}`}> {item.Lead.name} </SelectItem>
                    })
                  }
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Contact</TableHead>
                  {/* <TableHead>Status</TableHead> */}
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSiteVisits.map((siteVisit) => (
                  <TableRow key={siteVisit.id} >
                    <TableCell className="font-medium" onClick={() => handleViewLead(siteVisit)}>{siteVisit.Lead.name}</TableCell>

                    {/* <TableCell>{siteVisit.email}</TableCell> */}

                    <TableCell onClick={() => handleViewLead(siteVisit)}>
                      {siteVisit.Property}
                    </TableCell>
                    <TableCell onClick={() => handleViewLead(siteVisit)}>
                      {new Date(siteVisit.Lead.createdAt).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </TableCell>

                    <TableCell className="font-medium" onClick={() => handleViewLead(siteVisit)}>{siteVisit.Lead.phone}</TableCell>
                    {/* <TableCell onClick={() => handleViewLead(siteVisit)}>
                      <StatusBadge status={siteVisit.Lead.status} />
                    </TableCell> */}
                    <TableCell className="font-medium" onClick={() => handleViewLead(siteVisit)}>{truncateText(siteVisit.Notes, 25)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewLead(siteVisit)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onEdit(siteVisit)}>
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
                                This action cannot be undone. This will permanently delete {siteVisit.Lead.name} from the Leads.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(siteVisit.id)}>Delete</AlertDialogAction>
                              {/* <AlertDialogAction>Delete</AlertDialogAction> */}
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
              <SheetTitle className="text-2xl font-bold">{selectedSiteVisit?.Lead?.name}</SheetTitle>
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
                    <span className="font-medium text-sm">{selectedSiteVisit.Property}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Call Status:</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-green-600 text-sm">{selectedSiteVisit.Lead.callStatus}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Visit Status :</span>
                    <span className="font-medium text-sm">{selectedSiteVisit.Status}</span>
                  </div>
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
                      <StatusBadge status={selectedSiteVisit.Lead.status} />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Contact:</span>
                    <span className="font-medium text-sm">{selectedSiteVisit.Lead.phone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Requirement:</span>
                    <span className="font-medium text-sm">{selectedSiteVisit.Lead.requirement}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Email:</span>
                    <span className="font-medium text-sm">{selectedSiteVisit.Lead.email}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Has Reached:</span>
                    <ReachedBadge HasReached={selectedSiteVisit.Lead.HasReached} />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Call Priority:</span>
                    <CallImmediatelyBadge needsCall={selectedSiteVisit.Lead.needsImmediateCall} />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Created At:</span>
                    <span className="font-medium text-sm">
                      {new Date(selectedSiteVisit.Lead.createdAt).toLocaleString('en-IN', {
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
              <Card>
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
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-md font-semibold">CALL DETAILS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                        {selectedSiteVisit.Lead.callSummary}
                      </p>
                    </div>
                  </div>
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
    </>
  )
}
