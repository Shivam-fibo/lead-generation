import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import TeamMemberForm from "@/components/team-member-form"
import TeamMemberEditForm from "@/components/team-member-edit-form"
import type { TeamMember } from "@/lib/api"

interface AddUserDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<TeamMember, "_id">) => void
}

export function AddUserDialog({ open, onClose, onSubmit }: AddUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Team Member</DialogTitle>
          <DialogDescription>Fill in the details to add a new team member</DialogDescription>
        </DialogHeader>
        <TeamMemberForm onSubmit={onSubmit} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  )
}

interface EditUserDialogProps {
  open: boolean
  onClose: () => void
  initialData: TeamMember
  onSubmit: (data: Partial<TeamMember>) => void
}

export function EditUserDialog({ open, onClose, initialData, onSubmit }: EditUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
          <DialogDescription>Update the team member information below</DialogDescription>
        </DialogHeader>
        <TeamMemberEditForm initialData={initialData} onSubmit={onSubmit} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  )
}
