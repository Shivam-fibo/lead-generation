"use client"

import { TeamMember, Role, Project } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProjects } from "@/hooks/use-projects"
import { useAuth } from "@/hooks/use-auth"

// Roles synced with the Add Team Member form
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

// Define a type for the form data, including the optional password
type TeamMemberEditData = Partial<Omit<TeamMember, 'password'>> & { password?: string };

interface TeamMemberEditFormProps {
    initialData: TeamMember
    onSubmit: (data: TeamMemberEditData) => void
    onCancel: () => void
}

export default function TeamMemberEditForm({ initialData, onSubmit, onCancel }: TeamMemberEditFormProps) {
    const { user } = useAuth()
    // Fetch projects to populate the selection dropdown
    const { data: projectsData, isLoading: projectsLoading, isError: projectsError } = useProjects(user?._id)

    const form = useForm<TeamMemberEditData>({
        defaultValues: {
            username: initialData.username || "",
            first_name: initialData.firstName || "",
            last_name: initialData.lastName || "",
            email: initialData.email || "",
            number: initialData.phoneNo || "",
            roles: [
                roles.find((r) => r.name === initialData.role)
                    ? {
                        _id: roles.find((r) => r.name === initialData.role)!.id,
                        name: initialData.role,
                    }
                    : { _id: "", name: "" },
            ],
            projects: projectsData
                ? projectsData.filter((project) =>
                    initialData.projects.includes(project._id)
                )
                : [],
            password: "", // leave blank to not update
        },
    });

    // Handle form submission, removing password if it's empty
    const handleSubmit = (data: TeamMemberEditData) => {
        if (!data.password) {
            delete data.password;
        }
        onSubmit(data);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Username */}
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="john.doe" />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    {/* First Name */}
                    <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="John" />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    {/* Last Name */}
                    <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Doe" />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} type="email" placeholder="john@example.com" />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    {/* Phone Number */}
                    <FormField
                        control={form.control}
                        name="number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="9876543210" />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    {/* Role */}
                    <FormField
                        control={form.control}
                        name="roles"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select
                                    value={field.value?.[0]?._id || ""}
                                    onValueChange={(value) => {
                                        const selectedRole = roles.find(r => r.id === value);
                                        if (selectedRole) {
                                            field.onChange([{ _id: selectedRole.id, name: selectedRole.name }]);
                                        }
                                    }}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.id}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                    {/* Project */}
                    <FormField
                        control={form.control}
                        name="projects"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project</FormLabel>
                                <Select
                                    value={field.value?.[0]?._id || ""}
                                    onValueChange={(projectId) => {
                                        const selectedProject = projectsData?.find(p => p._id === projectId);
                                        if (selectedProject) {
                                            field.onChange([selectedProject]);
                                        }
                                    }}
                                    disabled={projectsLoading || projectsError}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={
                                                projectsLoading ? "Loading..." : (projectsError ? "Error" : "Select a project")
                                            } />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {projectsData?.map((project) => (
                                            <SelectItem key={project._id} value={project._id}>
                                                {project.projectName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />
                    {/* Password */}
                    {/* <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                    <Input {...field} type="password" placeholder="Leave blank to keep current password" />
                                </FormControl>
                            </FormItem>
                        )}
                    /> */}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </Form>
    )
}