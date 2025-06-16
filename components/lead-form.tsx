"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export interface Lead {
  id?: string;
  name: string;
  email: string;
  phone: string;
  status: "Hot" | "Warm" | "Cold";
  HasReached: boolean;
  createdAt?: string;
  needsImmediateCall: boolean;
  requirement: string;
  callStatus: "pending" | "completed" | "scheduled" | "failed";
  siteVisit?: string;
  property: string;
  callSummary?: string;
  followUpReason?: string;
}

interface LeadFormProps {
  initialData?: Lead;
  onSubmit: (data: Omit<Lead, "id" | "createdAt">) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function LeadForm({ initialData, onSubmit, onCancel, isEditing = false }: LeadFormProps) {
  const [formData, setFormData] = useState<Omit<Lead, "id" | "createdAt">>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    status: initialData?.status || "Warm",
    HasReached: initialData?.HasReached || false,
    needsImmediateCall: initialData?.needsImmediateCall || false,
    requirement: initialData?.requirement || "",
    callStatus: initialData?.callStatus || "pending",
    siteVisit: initialData?.siteVisit || "",
    property: initialData?.property || "",
    callSummary: initialData?.callSummary || "",
    followUpReason: initialData?.followUpReason || "",
  })

  const [siteVisitDate, setSiteVisitDate] = useState<Date | undefined>(
    initialData?.siteVisit ? new Date(initialData.siteVisit) : undefined
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleSiteVisitDateChange = (date: Date | undefined) => {
    setSiteVisitDate(date)
    if (date) {
      const formattedDate = format(date, "EEEE, dd-MM-yyyy")
      handleInputChange("siteVisit", formattedDate)
    } else {
      handleInputChange("siteVisit", "")
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number"
    }

    if (!formData.requirement.trim()) {
      newErrors.requirement = "Requirement is required"
    }

    if (!formData.property.trim()) {
      newErrors.property = "Property is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Information */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter full name"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Enter email address"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+91 9123456789"
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Lead Status</Label>
          <Select value={formData.status} onValueChange={(value: "Hot" | "Warm" | "Cold") => handleInputChange("status", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hot">Hot</SelectItem>
              <SelectItem value="Warm">Warm</SelectItem>
              <SelectItem value="Cold">Cold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requirement">Requirement *</Label>
          <Input
            id="requirement"
            value={formData.requirement}
            onChange={(e) => handleInputChange("requirement", e.target.value)}
            placeholder="e.g., 4BHK, 3BHK, Commercial"
            className={errors.requirement ? "border-red-500" : ""}
          />
          {errors.requirement && <p className="text-sm text-red-500">{errors.requirement}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="property">Property *</Label>
          <Input
            id="property"
            value={formData.property}
            onChange={(e) => handleInputChange("property", e.target.value)}
            placeholder="e.g., Naroda Lavish, Sky Villa"
            className={errors.property ? "border-red-500" : ""}
          />
          {errors.property && <p className="text-sm text-red-500">{errors.property}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="callStatus">Call Status</Label>
          <Select value={formData.callStatus} onValueChange={(value: "pending" | "completed" | "scheduled" | "failed") => handleInputChange("callStatus", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select call status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Site Visit Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !siteVisitDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {/* {siteVisitDate ? format(siteVisitDate, "EEEE, dd-MM-yyyy") : "Select date"} */}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={siteVisitDate}
                onSelect={handleSiteVisitDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Toggle Switches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="hasReached"
            checked={formData.HasReached}
            onCheckedChange={(checked) => handleInputChange("HasReached", checked)}
          />
          <Label htmlFor="hasReached">Has Reached</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="needsImmediateCall"
            checked={formData.needsImmediateCall}
            onCheckedChange={(checked) => handleInputChange("needsImmediateCall", checked)}
          />
          <Label htmlFor="needsImmediateCall">Needs Immediate Call</Label>
        </div>
      </div>

      {/* Text Areas */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="callSummary">Call Summary</Label>
          <Textarea
            id="callSummary"
            value={formData.callSummary}
            onChange={(e) => handleInputChange("callSummary", e.target.value)}
            placeholder="Enter call summary..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="followUpReason">Follow-up Reason</Label>
          <Textarea
            id="followUpReason"
            value={formData.followUpReason}
            onChange={(e) => handleInputChange("followUpReason", e.target.value)}
            placeholder="Enter follow-up reason..."
            rows={3}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? "Update Lead" : "Add Lead"}
        </Button>
      </div>
    </form>
  )
}