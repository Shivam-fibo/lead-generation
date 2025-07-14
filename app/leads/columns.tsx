"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  Eye,
  Edit,
  Trash2,
  Flame,
  Locate,
  LocateOff,
  CheckCircle,
  PhoneOff,
  XCircle,
  AlertCircle,
  HelpCircle
} from "lucide-react"
import { LucideSnowflake } from "lucide-react"
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
import { FaLongArrowAltDown } from "react-icons/fa";

// Badge components from the original LeadsList
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
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors bg-slate-50 text-blue-800 border border-slate-200 hover:bg-slate-100">
        <FaLongArrowAltDown height={"10px"} width={"10px"} color="#1e40af" /> Low
      </span>
    )
  }
}

interface ColumnsProps {
  onView: (lead: any) => void
  onEdit: (lead: any) => void
  onDelete: (id: string) => void
}

export const createColumns = ({
  onView,
  onEdit,
  onDelete,
}: ColumnsProps): ColumnDef<any>[] => [
    {
      accessorKey: "first_name",
      header: "Name",
      cell: ({ row }) => {
        const lead = row.original
        return (
          <div>
            {lead.first_name + " " + lead.last_name}
          </div>
        )
      },
    },
    {
      accessorKey: "contact_number",
      header: "Contact",
      cell: ({ row }) => {
        const lead = row.original
        return (
          <div>
            {lead.contact_number}
          </div>
        )
      },
    },
    {
      accessorKey: "is_hot_lead",
      header: "Status",
      cell: ({ row }) => {
        const lead = row.original
        let temp;
        if (lead.lead_type === "Cold") {
          temp = false;
        } else if (lead.lead_type === "Hot") {
          temp = true
        } else {
          temp = false;
        }
        return (
          <div>
            <StatusBadge status={temp} />
          </div>
        )
      },
    },
    {
      id: "call_priority",
      header: "Call Priority",
      cell: ({ row }) => {
        const lead = row.original
        console.log('lead.call_immediately', lead.call_immediately)
        const needsCall = lead.call_immediately
        return (
          <div>
            <CallImmediatelyBadge needsCall={needsCall} />
          </div>
        )
      },
    },

    {
      accessorKey: "reached",
      header: "Has Reached",
      cell: ({ row }) => {
        const lead = row.original
        return (
          <div>
            <ReachedBadge HasReached={lead.reached} />
          </div>
        )
      },
    },
    {
      id: "visit_booking_datetime",
      header: "Site Visit Booking",
      cell: ({ row }) => {
        const lead = row.original;
        const rawDate = lead.visit_booking_datetime;
        const formattedDate = rawDate
          ? new Date(rawDate).toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }).replace(",", " at")
          : "-";
        return <div><span>{formattedDate}</span></div>;
      },
    },
    // {
    //   accessorKey: "createdAt",
    //   header: "CreatedAt",
    //   cell: ({ row }) => {
    //     const lead = row.original
    //     return (
    //       <div>
    //         {lead.created_at
    //           ? new Date(lead.created_at).toLocaleString('en-IN', {
    //             timeZone: 'Asia/Kolkata',
    //             day: 'numeric',
    //             month: 'long',
    //             year: 'numeric',
    //             hour: 'numeric',
    //             minute: '2-digit',
    //             hour12: true
    //           })
    //           : "-"
    //         }
    //       </div>
    //     )
    //   },
    // },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const lead = row.original
        return (
          <div className="flex space-x-2">
            {/* <Button variant="outline" size="sm" onClick={() => onView(lead)}>
              <Eye className="h-4 w-4" />
            </Button> */}
            <Button variant="outline" size="sm" onClick={() => onEdit(lead)}>
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
                    This action cannot be undone. This will permanently delete {lead.first_name} from the Leads.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(lead._id)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      },
    },
  ]
