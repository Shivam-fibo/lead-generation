import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
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

interface ColumnsProps {
  onEdit: (member: TeamMember) => void
  onDelete: (id: string) => void
}

export const createTeamMemberColumns = ({
  onEdit,
  onDelete,
}: ColumnsProps): ColumnDef<TeamMember>[] => [
  // {
  //   accessorKey: "username",
  //   header: "Username",
  //   cell: ({ row }) => row.original.username,
  // },
  {
    accessorKey: "first_name",
    header: "First Name",
    cell: ({ row }) => row.original.firstName,
  },
  {
    accessorKey: "last_name",
    header: "Last Name",
    cell: ({ row }) => row.original.lastName,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <Badge variant="outline">{row.original.role}</Badge>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const member = row.original
      return (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(member)}>
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
                  This action cannot be undone. This will permanently delete 
                  the user, &nbsp;<strong>{member.firstName}</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(member._id)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )
    },
  },
]
