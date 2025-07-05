"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building2, User, Mail, Phone, Lock, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCompany } from "@/hooks/use-company"

interface CompanyFormData {
    companyName: string;
    companyAddress: string;
    adminFirstName: string;
    adminLastName: string;
    adminEmail: string;
    adminPassword: string;
    adminPhone: string;
}

interface CompanyFormProps {
    initialData?: CompanyFormData;
    onSubmit: (data: CompanyFormData) => void;
    onCancel: () => void;
    isEditing?: boolean;
}

export default function AddCompany({ initialData, onSubmit, onCancel, isEditing = false }: CompanyFormProps) {

    const {
        createCompany,
        isCreatingCompany,
    } = useCompany()

    // console.log('isCreatingCompany', isCreatingCompany)

    const [formData, setFormData] = useState<CompanyFormData>({
        companyName: initialData?.companyName || "",
        companyAddress: initialData?.companyAddress || "",
        adminFirstName: initialData?.adminFirstName || "",
        adminLastName: initialData?.adminLastName || "",
        adminEmail: initialData?.adminEmail || "",
        adminPassword: initialData?.adminPassword || "",
        adminPhone: initialData?.adminPhone || "",
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleInputChange = (field: keyof CompanyFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }))
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.companyName.trim()) newErrors.companyName = "Required"
        if (!formData.companyAddress.trim()) newErrors.companyAddress = "Required"
        if (!formData.adminFirstName.trim()) newErrors.adminFirstName = "Required"
        if (!formData.adminLastName.trim()) newErrors.adminLastName = "Required"

        if (!formData.adminEmail.trim()) {
            newErrors.adminEmail = "Required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
            newErrors.adminEmail = "Invalid email"
        }

        if (!formData.adminPassword.trim()) {
            newErrors.adminPassword = "Required"
        } else if (formData.adminPassword.length < 6) {
            newErrors.adminPassword = "Min 6 chars"
        }

        if (!formData.adminPhone.trim()) {
            newErrors.adminPhone = "Required"
        } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.adminPhone.replace(/\s/g, ""))) {
            newErrors.adminPhone = "Invalid phone"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return
        console.log(formData)

        // API CALL
        createCompany(formData)

        setFormData({
            companyName: "",
            companyAddress: "",
            adminFirstName: "",
            adminLastName: "",
            adminEmail: "",
            adminPassword: "",
            adminPhone: "",
        })
        setErrors({})
    }

    return (
        <DashboardLayout>
            <div className="h-full flex flex-col max-w-7xl p-4">
                <div className="flex-shrink-0 mb-6">
                    <h1 className="text-2xl font-bold text-foreground">
                        {isEditing ? "Edit Company" : "Add New Company"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {isEditing ? "Update company and admin details" : "Create company with admin credentials"}
                    </p>
                </div>

                <Card className="border-0 shadow-sm">
                    <form onSubmit={handleSubmit} className="flex flex-col">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Company Details - Left Side */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                                        <div className="p-1.5 bg-primary/10 rounded-md">
                                            <Building2 className="h-4 w-4 text-primary" />
                                        </div>
                                        <h3 className="font-semibold text-foreground">Company Details</h3>
                                    </div>

                                    {/* Company Name */}
                                    <div className="space-y-1">
                                        <Label htmlFor="companyName" className="text-xs font-medium">
                                            Company Name <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="companyName"
                                            value={formData.companyName}
                                            onChange={(e) => handleInputChange("companyName", e.target.value)}
                                            placeholder="Enter company name"
                                            className={cn(
                                                "h-8 text-sm transition-colors",
                                                errors.companyName && "border-destructive"
                                            )}
                                        />
                                        {errors.companyName && (
                                            <p className="text-xs text-destructive">{errors.companyName}</p>
                                        )}
                                    </div>

                                    {/* Company Address */}
                                    <div className="space-y-1 mt-1">
                                        <Label htmlFor="companyAddress" className="text-xs font-medium">
                                            Company Address <span className="text-destructive">*</span>
                                        </Label>
                                        <Textarea
                                            id="companyAddress"
                                            value={formData.companyAddress}
                                            onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                                            placeholder="Enter complete company address"
                                            rows={3}
                                            className={cn(
                                                "text-sm resize-none transition-colors",
                                                errors.companyAddress && "border-destructive"
                                            )}
                                        />
                                        {errors.companyAddress && (
                                            <p className="text-xs text-destructive">{errors.companyAddress}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Admin Details - Right Side */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/20 rounded-md">
                                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h3 className="font-semibold text-foreground">Admin Details</h3>
                                    </div>

                                    {/* Admin First Name and Last Name */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="adminFirstName" className="text-xs font-medium">
                                                First Name <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="adminFirstName"
                                                value={formData.adminFirstName}
                                                onChange={(e) => handleInputChange("adminFirstName", e.target.value)}
                                                placeholder="First name"
                                                className={cn(
                                                    "h-8 text-sm transition-colors",
                                                    errors.adminFirstName && "border-destructive"
                                                )}
                                            />
                                            {errors.adminFirstName && (
                                                <p className="text-xs text-destructive">{errors.adminFirstName}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="adminLastName" className="text-xs font-medium">
                                                Last Name <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="adminLastName"
                                                value={formData.adminLastName}
                                                onChange={(e) => handleInputChange("adminLastName", e.target.value)}
                                                placeholder="Last name"
                                                className={cn(
                                                    "h-8 text-sm transition-colors",
                                                    errors.adminLastName && "border-destructive"
                                                )}
                                            />
                                            {errors.adminLastName && (
                                                <p className="text-xs text-destructive">{errors.adminLastName}</p>
                                            )}
                                        </div>
                                    </div>


                                    {/* Admin Email and Password */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="adminEmail" className="text-xs font-medium">
                                                Admin Email <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="adminEmail"
                                                type="email"
                                                value={formData.adminEmail}
                                                onChange={(e) => handleInputChange("adminEmail", e.target.value)}
                                                placeholder="admin@company.com"
                                                className={cn(
                                                    "h-8 text-sm transition-colors",
                                                    errors.adminEmail && "border-destructive"
                                                )}
                                            />
                                            {errors.adminEmail && (
                                                <p className="text-xs text-destructive">{errors.adminEmail}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <Label htmlFor="adminPassword" className="text-xs font-medium">
                                                Admin Password <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="adminPassword"
                                                type="password"
                                                value={formData.adminPassword}
                                                onChange={(e) => handleInputChange("adminPassword", e.target.value)}
                                                placeholder="Min 6 characters"
                                                className={cn(
                                                    "h-8 text-sm transition-colors",
                                                    errors.adminPassword && "border-destructive"
                                                )}
                                            />
                                            {errors.adminPassword && (
                                                <p className="text-xs text-destructive">{errors.adminPassword}</p>
                                            )}
                                        </div>
                                    </div>


                                    {/* Admin Phone */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                        <div className="space-y-1">
                                            <Label htmlFor="adminPhone" className="text-xs font-medium">
                                                Admin Phone <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="adminPhone"
                                                value={formData.adminPhone}
                                                onChange={(e) => handleInputChange("adminPhone", e.target.value)}
                                                placeholder="+91 9876543210"
                                                className={cn(
                                                    "h-8 text-sm transition-colors",
                                                    errors.adminPhone && "border-destructive"
                                                )}
                                            />
                                            {errors.adminPhone && (
                                                <p className="text-xs text-destructive">{errors.adminPhone}</p>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </CardContent>

                        <div className="flex-shrink-0 px-6 py-3">
                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onCancel}
                                    disabled={isSubmitting}
                                    size="sm"
                                    className="min-w-20"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    size="sm"
                                    className="min-w-24"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                            {isEditing ? "Updating..." : "Creating..."}
                                        </>
                                    ) : (
                                        isEditing ? "Update" : "Submit"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    )
}