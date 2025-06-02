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
import { Edit, Trash2, Search } from "lucide-react"

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
  onEdit: (member: TeamMember) => void
  onDelete: (id: string) => void
}

export default function TeamMemberList({ members, onEdit, onDelete }: TeamMemberListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredMembers = members.filter(
    (member) =>
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.roles[0].name.toLowerCase().includes(searchTerm.toLowerCase()) 
      // member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // member.skillTags.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Team Members ({members.length})</CardTitle>
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
                <TableHead>Username</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                {/* <TableHead>Department</TableHead> */}
                {/* <TableHead>Skills</TableHead> */}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member._id}>
                  <TableCell className="font-medium">{member.username}</TableCell>
                  <TableCell className="font-medium">{member.first_name}</TableCell>
                  <TableCell className="font-medium">{member.last_name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{member.roles[0].name}</Badge>
                  </TableCell>
                  {/* <TableCell> - </TableCell> */}
                  {/* <TableCell>
                     <div className="flex flex-wrap gap-1">
                      {member.skillTags.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {member.skillTags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{member.skillTags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell> */}
                  <TableCell>
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
                              This action cannot be undone. This will permanently delete {member.first_name} from the team.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(member._id)}>Delete</AlertDialogAction>
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
