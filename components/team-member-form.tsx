"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TeamMember, Role, Project } from "@/lib/api"
import { useProjects } from "@/hooks/use-projects"
import { useAuth } from "@/hooks/use-auth"

type NewTeamMember = Omit<TeamMember, '_id'>;

interface TeamMemberFormProps {
  initialData?: TeamMember
  onSubmit: (data: NewTeamMember) => void
  onCancel: () => void
  projects?: Project[] // Keep as fallback prop
}

const roles = [
  {
    id: "1",
    name: "CompanyAdmin",
  },
  {
    id: "2",
    name: "CompanyEmployee",
  },
]

export default function TeamMemberForm({ initialData, onSubmit, onCancel }: TeamMemberFormProps) {
  const { user } = useAuth()
  const { data: projectsData, isLoading: projectsLoading, isError: projectsError } = useProjects(user?._id) 

  console.log('projectsData', projectsData)

  const [formData, setFormData] = useState<Omit<NewTeamMember, 'roles'> & { roles: Role[] }>(
    initialData || {
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      number: "",
      roles: [],
      password: "",
      projects: [], // Add projects to initial state
    }
  )

  const availableProjects = projectsData 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      roles: formData.roles.length > 0 ? formData.roles : [{ _id: roles[0].id, name: roles[0].name }]
    })
  }

  const handleProjectChange = (projectId: string) => {
    const selectedProject = availableProjects?.find(p => p._id === projectId)
    if (selectedProject) {
      setFormData({
        ...formData,
        projects: [selectedProject]
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            placeholder="johnDoe"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
            placeholder="John"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
            placeholder="Doe"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="john@gmail.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select
            value={formData.roles[0]?._id || roles[0].id}
            onValueChange={(value) => setFormData({
              ...formData,
              roles: [{ _id: value, name: roles.find(r => r.id === value)?.name || roles[0].name }]
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="project">Project</Label>
          <Select
            value={formData.projects?.[0]?._id || ""}
            onValueChange={handleProjectChange}
            disabled={projectsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                projectsLoading 
                  ? "Loading projects..." 
                  : projectsError 
                    ? "Error loading projects" 
                    : "Select a project"
              } />
            </SelectTrigger>
            <SelectContent>
              {availableProjects?.map((project) => (
                <SelectItem key={project._id} value={project._id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{project.projectName}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {projectsError && (
            <p className="text-sm text-red-500">Failed to load projects. Using fallback data.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="number">Phone Number</Label>
          <Input
            id="number"
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            required
            placeholder="9876543210"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialData ? "Update" : "Add"} Member</Button>
      </div>
    </form>
  )
}