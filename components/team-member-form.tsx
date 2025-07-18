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
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

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
      // Check if project is already selected
      const isAlreadySelected = formData.projects.some(p => p._id === projectId)
      if (!isAlreadySelected) {
        setFormData({
          ...formData,
          projects: [...formData.projects, selectedProject]
        })
      }
    }
  }

  const removeProject = (projectId: string) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter(p => p._id !== projectId)
    })
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
          <Label htmlFor="project">Projects</Label>
          <Select
            value=""
            onValueChange={handleProjectChange}
            disabled={projectsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                projectsLoading 
                  ? "Loading projects..." 
                  : projectsError 
                    ? "Error loading projects" 
                    : "Select projects"
              } />
            </SelectTrigger>
            <SelectContent>
              {availableProjects?.filter(project => 
                !formData.projects.some(p => p._id === project._id)
              ).map((project) => (
                <SelectItem key={project._id} value={project._id}>
                  {project.projectName}
                </SelectItem>
              ))}
              {availableProjects?.filter(project => 
                !formData.projects.some(p => p._id === project._id)
              ).length === 0 && (
                <SelectItem value="no-projects" disabled>
                  {formData.projects.length === availableProjects?.length 
                    ? "All projects selected" 
                    : "No projects available"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          
          {/* Selected Projects as compact badges */}
          {formData.projects.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 max-h-20 overflow-y-auto">
              {formData.projects.map((project) => (
                <Badge 
                  key={project._id} 
                  variant="secondary" 
                  className="flex items-center gap-1 text-xs py-1 px-2 h-auto"
                >
                  <span className="truncate max-w-[120px]">{project.projectName}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive flex-shrink-0" 
                    onClick={() => removeProject(project._id)}
                  />
                </Badge>
              ))}
            </div>
          )}
          
          {projectsError && (
            <p className="text-sm text-destructive">Failed to load projects</p>
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