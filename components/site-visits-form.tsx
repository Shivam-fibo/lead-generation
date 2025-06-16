"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export interface SiteVisit {
  id?: string;
  leadId: string;
  leadName?: string; // For display purposes
  property: string;
  dateTime: string;
  status: "Confirmed" | "Pending" | "Cancelled" | "Completed";
  notes: string;
  createdAt?: string;
}

interface SiteVisitFormProps {
  initialData?: SiteVisit;
  onSubmit: (data: Omit<SiteVisit, "id" | "createdAt">) => void;
  onCancel: () => void;
  isEditing?: boolean;
  availableLeads?: Array<{ id: string; name: string; phone: string; email: string }>; // List of leads to choose from
}

export default function SiteVisitForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isEditing = false,
  availableLeads = []
}: SiteVisitFormProps) {
  const [formData, setFormData] = useState<Omit<SiteVisit, "id" | "createdAt">>({
    leadId: initialData?.leadId || "",
    leadName: initialData?.leadName || "",
    property: initialData?.property || "",
    dateTime: initialData?.dateTime || "",
    status: initialData?.status || "Pending",
    notes: initialData?.notes || "",
  })

  const [visitDate, setVisitDate] = useState<Date | undefined>(
    initialData?.dateTime ? new Date(initialData.dateTime) : undefined
  )
  
  const [visitTime, setVisitTime] = useState<string>(
    initialData?.dateTime ? format(new Date(initialData.dateTime), "HH:mm") : "10:00"
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Mock leads data for demonstration
  const mockLeads = [
    { id: "1", name: "Sarah Johnson", phone: "+91 9123867523", email: "sarah@company.com" },
    { id: "2", name: "Rahul Sharma", phone: "+91 9876543210", email: "rahul@example.com" },
    { id: "3", name: "Priya Patel", phone: "+91 9555123456", email: "priya@company.com" },
    { id: "4", name: "Mike Wilson", phone: "+91 9444987654", email: "mike@business.com" },
    { id: "5", name: "Anjali Singh", phone: "+91 9333876543", email: "anjali@email.com" }
  ]

  const leadsToUse = availableLeads.length > 0 ? availableLeads : mockLeads

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleLeadChange = (leadId: string) => {
    const selectedLead = leadsToUse.find(lead => lead.id === leadId)
    setFormData(prev => ({ 
      ...prev, 
      leadId: leadId,
      leadName: selectedLead?.name || ""
    }))
    if (errors.leadId) {
      setErrors(prev => ({ ...prev, leadId: "" }))
    }
  }

  const handleDateChange = (date: Date | undefined) => {
    setVisitDate(date)
    updateDateTime(date, visitTime)
  }

  const handleTimeChange = (time: string) => {
    setVisitTime(time)
    updateDateTime(visitDate, time)
  }

  const updateDateTime = (date: Date | undefined, time: string) => {
    if (date && time) {
      const [hours, minutes] = time.split(':').map(Number)
      const dateTime = new Date(date)
      dateTime.setHours(hours, minutes, 0, 0)
      handleInputChange("dateTime", dateTime.toISOString())
    } else {
      handleInputChange("dateTime", "")
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.leadId.trim()) {
      newErrors.leadId = "Please select a lead"
    }

    if (!formData.property.trim()) {
      newErrors.property = "Property is required"
    }

    if (!formData.dateTime.trim()) {
      newErrors.dateTime = "Date and time are required"
    }

    if (!formData.notes.trim()) {
      newErrors.notes = "Notes are required"
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
        {/* Lead Selection */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="lead">Select Lead *</Label>
          <Select value={formData.leadId} onValueChange={handleLeadChange} disabled={isEditing}>
            <SelectTrigger className={errors.leadId ? "border-red-500" : ""}>
              <SelectValue placeholder="Choose a lead for site visit" />
            </SelectTrigger>
            <SelectContent>
              {leadsToUse.map((lead) => (
                <SelectItem key={lead.id} value={lead.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{lead.name}</span>
                    <span className="text-sm text-gray-500">{lead.phone} • {lead.email}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.leadId && <p className="text-sm text-red-500">{errors.leadId}</p>}
          {isEditing && (
            <p className="text-sm text-gray-500">Lead cannot be changed when editing a site visit</p>
          )}
        </div>

        {/* Property */}
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

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Visit Status</Label>
          <Select 
            value={formData.status} 
            onValueChange={(value: "Confirmed" | "Pending" | "Cancelled" | "Completed") => handleInputChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Visit Date */}
        <div className="space-y-2">
          <Label>Visit Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !visitDate && "text-muted-foreground",
                  errors.dateTime && "border-red-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {visitDate ? format(visitDate, "EEEE, dd-MM-yyyy") : "Select visit date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={visitDate}
                onSelect={handleDateChange}
                initialFocus
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} // Disable past dates
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Visit Time */}
        <div className="space-y-2">
          <Label htmlFor="time">Visit Time *</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="time"
              type="time"
              value={visitTime}
              onChange={(e) => handleTimeChange(e.target.value)}
              className={cn("pl-10", errors.dateTime && "border-red-500")}
            />
          </div>
          {errors.dateTime && <p className="text-sm text-red-500">{errors.dateTime}</p>}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Visit Notes *</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          placeholder="Enter details about the site visit - client preferences, requirements, special instructions..."
          rows={4}
          className={errors.notes ? "border-red-500" : ""}
        />
        {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
        <p className="text-sm text-gray-500">
          Include client preferences, specific requirements, parking needs, floor preferences, etc.
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? "Update Site Visit" : "Schedule Site Visit"}
        </Button>
      </div>
    </form>
  )
}