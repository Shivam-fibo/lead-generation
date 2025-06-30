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
      {status === "Hot" ? (
        <Flame className="h-3.5 w-3.5 mr-0.5" />
      ) : (
        <LucideSnowflake className="h-3.5 w-3.5 mr-0.5" />
      )}
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
    accessorKey: "Lead.name",
    header: "Lead",
    cell: ({ row }) => {
      const siteVisit = row.original
      return (
        <div className="font-medium cursor-pointer" onClick={() => onView(siteVisit)}>
          {siteVisit.Lead?.name || "-"}
        </div>
      )
    },
  },
  {
    accessorKey: "Property",
    header: "Property",
    cell: ({ row }) => {
      const siteVisit = row.original
      return (
        <div className="cursor-pointer" onClick={() => onView(siteVisit)}>
          {siteVisit.Property || "-"}
        </div>
      )
    },
  },
  {
    accessorKey: "Lead.createdAt",
    header: "Date & Time",
    cell: ({ row }) => {
      const siteVisit = row.original
      return (
        <div className="cursor-pointer" onClick={() => onView(siteVisit)}>
          {siteVisit.Lead?.createdAt
            ? new Date(siteVisit.Lead.createdAt).toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })
            : "-"
          }
        </div>
      )
    },
  },
  {
    accessorKey: "Lead.phone",
    header: "Contact",
    cell: ({ row }) => {
      const siteVisit = row.original
      return (
        <div className="font-medium cursor-pointer" onClick={() => onView(siteVisit)}>
          {siteVisit.Lead?.phone || "-"}
        </div>
      )
    },
  },
  {
    accessorKey: "Lead.status",
    header: "Lead Status",
    cell: ({ row }) => {
      const siteVisit = row.original
      return (
        <div>
          {siteVisit.Lead?.status ? (
            <StatusBadge status={siteVisit.Lead.status} />
          ) : (
            "-"
          )}
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
                  This action cannot be undone. This will permanently delete the site visit for {siteVisit.Lead?.name} from the records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(siteVisit.id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )
    },
  },
]