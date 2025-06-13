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
  LocateOff
} from "lucide-react"

interface Role {
  _id: string;
  name: string;
}

interface TeamMember {
  _id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  number: string;
  roles: Role[];
  password: string;
}

interface TeamMemberListProps {
  members: TeamMember[]
  onEdit: (lead: TeamMember) => void
  onDelete: (id: string) => void
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
    value: 50000
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@tech.com",
    phone: "+91 7789867523",
    status: "Cold",
    IsReached: false,
    createdAt: "2024-06-09",
    value: 75000
  },
  {
    id: "3",
    name: "Emma Davis",
    email: "emma.davis@startup.io",
    phone: "+91 7564867523",
    status: "Cold",
    IsReached: true,
    createdAt: "2024-06-08",
    value: 25000
  },
  {
    id: "4",
    name: "James Wilson",
    email: "james.w@enterprise.com",
    phone: "+91 9753867523",
    status: "Hot",
    IsReached: false,
    createdAt: "2024-06-07",
    value: 100000
  },
  {
    id: "5",
    name: "Lisa Anderson",
    email: "l.anderson@company.net",
    phone: "+91 8425867523",
    status: "Cold",
    IsReached: true,
    createdAt: "2024-06-06",
    value: 60000
  }
]


export default function LeadsList({ members, onEdit, onDelete }: TeamMemberListProps) {
  const [searchTerm, setSearchTerm] = useState("")

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Total Leads ({members.length})</CardTitle>
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search members..."
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
                    <ReachedBadge isReached={lead.IsReached} />
                  </TableCell>
                  <TableCell>{lead.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {/* <Button variant="outline" size="sm" onClick={() => onEdit(lead)}> */}
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
  )
}
