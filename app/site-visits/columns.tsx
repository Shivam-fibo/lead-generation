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

// Badge components for Site Visits
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

const truncateText = (text: string, maxLength: number = 25): string => {
  if (!text) return "-";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

interface ColumnsProps {
  onView: (siteVisit: any) => void
  onEdit: (siteVisit: any) => void
  onDelete: (id: string) => void
}

export const createColumns = ({
  onView,
  onEdit,
  onDelete,
}: ColumnsProps): ColumnDef<any>[] => [
    {
      accessorKey: "first_name",
      header: "Lead",
      cell: ({ row }) => {
        const Lead = row.original
        return (
          <div className="font-medium cursor-pointer" >
            {Lead?.first_name + " " + Lead?.last_name || "-"}
          </div>
        )
      },
    },
    {
      accessorKey: "project",
      header: "Project",
      cell: ({ row }) => {
        const Lead = row.original
        return (
          <div className="cursor-pointer" >
            {Lead.project_name || "-"}
          </div>
        )
      },
    },
    {
      accessorKey: "schedule_datetime",
      header: "Date & Time",
      cell: ({ row }) => {
        const Lead = row.original
        return (
          <div className="cursor-pointer" >
            {Lead?.visit_booking_datetime
              ? Lead?.visit_booking_datetime
              : "-"
            }
          </div>
        )
      },
    },
    {
      accessorKey: "contact_number",
      header: "Contact",
      cell: ({ row }) => {
        const Lead = row.original
        return (
          <div className="font-medium cursor-pointer" >
            {Lead?.contact_number || "-"}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Lead Status",
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
    // {
    //   accessorKey: "Lead.HasReached",
    //   header: "Has Reached",
    //   cell: ({ row }) => {
    //     const siteVisit = row.original
    //     return (
    //       <div>
    //         <ReachedBadge HasReached={siteVisit.Lead?.HasReached || false} />
    //       </div>
    //     )
    //   },
    // },
    // {
    //   id: "call_priority",
    //   header: "Call Priority",
    //   cell: ({ row }) => {
    //     const siteVisit = row.original
    //     const needsCall = siteVisit.Lead?.needsImmediateCall || false
    //     return (
    //       <div>
    //         <CallImmediatelyBadge needsCall={needsCall} />
    //       </div>
    //     )
    //   },
    // },
    // {
    //   accessorKey: "Notes",
    //   header: "Notes",
    //   cell: ({ row }) => {
    //     const siteVisit = row.original
    //     return (
    //       <div className="font-medium cursor-pointer" onClick={() => onView(siteVisit)}>
    //         {truncateText(siteVisit.Notes)}
    //       </div>
    //     )
    //   },
    // },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const siteVisit = row.original
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => onView(siteVisit)}>
              <Eye className="h-4 w-4" />
            </Button>
            {/* <Button variant="outline" size="sm" onClick={() => onEdit(siteVisit)}>
            <Edit className="h-4 w-4" />
          </Button> */}
            {/* <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the site visit for {siteVisit.Lead?.name} from the records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(siteVisit.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog> */}
          </div>
        )
      },
    },
  ]