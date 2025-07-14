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
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Project } from "@/lib/api"
import { useProjects } from "@/hooks/use-projects"
import { useAuth } from "@/hooks/use-auth"

export interface Lead {
  id?: string;
  first_name: string;
  last_name: string;
  contact_number: string;
  project_id: string;
  project_name: string;
  lead_type: "Hot" | "Cold";
  site_visit_booked: boolean;
  visit_booking_datetime?: string;
  call_immediately: boolean;
  reason_to_call_immediately?: string;
  reached: boolean;
  createdAt?: string;
}

interface LeadFormProps {
  initialData?: Lead;
  onSubmit: (data: Omit<Lead, "id" | "createdAt">) => void;
  onCancel: () => void;
  isEditing?: boolean;
  projects?: Project[]; // Keep as fallback prop
}

export default function LeadForm({ initialData, onSubmit, onCancel, isEditing = false }: LeadFormProps) {
  const { user } = useAuth()
  const { data: projectsData, isLoading: projectsLoading, isError: projectsError } = useProjects(user?._id)
  const [formData, setFormData] = useState<Omit<Lead, "id" | "createdAt">>(() => {
    const initialVisitDateTime = initialData?.visit_booking_datetime;
    let processedVisitDateTime = "";

    // Handle initial visit_booking_datetime formatting
    if (initialVisitDateTime &&
      initialVisitDateTime !== "Not specified" &&
      initialVisitDateTime !== null) {
      try {
        const date = new Date(initialVisitDateTime);
        processedVisitDateTime = date.toISOString();
      } catch (error) {
        console.log('Could not parse initial visit date, keeping as empty string');
        processedVisitDateTime = "";
      }
    }

    return {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      contact_number: initialData?.contact_number || "",
      project_id: initialData?.project_id || "",
      project_name: initialData?.project_name || "",
      lead_type: initialData?.lead_type || "Cold",
      site_visit_booked: initialData?.site_visit_booked || false,
      visit_booking_datetime: processedVisitDateTime,
      call_immediately: initialData?.call_immediately || false,
      reason_to_call_immediately: initialData?.reason_to_call_immediately || "",
      reached: initialData?.reached || false,
    };
  })

  console.log('isEditing', isEditing)
  console.log('initialData', initialData)

  const [visitDate, setVisitDate] = useState<Date | undefined>(() => {
    if (initialData?.visit_booking_datetime &&
      initialData.visit_booking_datetime !== "Not specified" &&
      initialData.visit_booking_datetime !== null) {
      try {
        // Try to parse the date if it's in a valid format
        return new Date(initialData.visit_booking_datetime);
      } catch (error) {
        console.log('Could not parse initial visit date:', initialData.visit_booking_datetime);
        return undefined;
      }
    }
    return undefined;
  })

  const [visitTime, setVisitTime] = useState<string>(() => {
    if (initialData?.visit_booking_datetime &&
      initialData.visit_booking_datetime !== "Not specified" &&
      initialData.visit_booking_datetime !== null) {
      try {
        const date = new Date(initialData.visit_booking_datetime);
        // Format as HH:MM for time input
        return format(date, "HH:mm");
      } catch (error) {
        console.log('Could not parse initial visit time:', initialData.visit_booking_datetime);
        return "";
      }
    }
    return "";
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const availableProjects = projectsData

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleProjectChange = (projectId: string) => {
    const selectedProject = availableProjects?.find(p => p._id === projectId)
    if (selectedProject) {
      setFormData(prev => ({
        ...prev,
        project_id: selectedProject._id,
        project_name: selectedProject.projectName
      }))
    }
  }

  const combineDateTime = (date: Date | undefined, time: string) => {
    if (!date || !time) return ""

    try {
      const [hours, minutes] = time.split(':').map(Number)
      const combined = new Date(date)
      combined.setHours(hours, minutes, 0, 0)
      return combined.toISOString()
    } catch (error) {
      console.error('Error combining date and time:', error)
      return ""
    }
  }

  const handleVisitDateChange = (date: Date | undefined) => {
    setVisitDate(date)
    const combinedDateTime = combineDateTime(date, visitTime)
    handleInputChange("visit_booking_datetime", combinedDateTime)
  }

  const handleVisitTimeChange = (time: string) => {
    setVisitTime(time)
    const combinedDateTime = combineDateTime(visitDate, time)
    handleInputChange("visit_booking_datetime", combinedDateTime)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required"
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required"
    }

    if (!formData.contact_number.trim()) {
      newErrors.contact_number = "Contact number is required"
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.contact_number.replace(/\s/g, ""))) {
      newErrors.contact_number = "Please enter a valid contact number"
    }

    if (!formData.project_id.trim()) {
      newErrors.project_id = "Project is required"
    }

    if (formData.call_immediately && !formData.reason_to_call_immediately?.trim()) {
      newErrors.reason_to_call_immediately = "Reason for immediate call is required when call immediately is enabled"
    }

    // Validate visit date and time if site visit is booked
    if (formData.site_visit_booked) {
      if (!visitDate) {
        newErrors.visit_date = "Visit date is required when site visit is booked"
      }
      if (!visitTime) {
        newErrors.visit_time = "Visit time is required when site visit is booked"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Format the visit booking datetime
    // let sanitizedBookingDatetime = null;

    // if (formData.site_visit_booked && formData.visit_booking_datetime) {
    //   try {
    //     const date = new Date(formData.visit_booking_datetime);

    //     // Convert to IST (UTC+5:30)
    //     const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));

    //     // Format as "Sunday, 06 July 2025 at 03:30 PM"
    //     const options: Intl.DateTimeFormatOptions = {
    //       weekday: 'long',
    //       day: '2-digit',
    //       month: 'long',
    //       year: 'numeric',
    //       hour: '2-digit',
    //       minute: '2-digit',
    //       hour12: true,
    //       timeZone: 'Asia/Kolkata'
    //     };

    //     sanitizedBookingDatetime = istDate.toLocaleDateString('en-US', options)
    //       .replace(/,/g, '')
    //       .replace(/(\d{1,2}:\d{2}) (AM|PM)/, ' $1 $2');
    //   } catch (error) {
    //     console.error('Error formatting date:', error);
    //     sanitizedBookingDatetime = null;
    //   }
    // }

    // Ensure visit_booking_datetime is in UTC format
    let utcVisitDateTime = null;

    if (formData.site_visit_booked && formData.visit_booking_datetime) {
      try {
        const date = new Date(formData.visit_booking_datetime);
        // Convert to UTC and format as ISO string
        utcVisitDateTime = date.toISOString();
      } catch (error) {
        console.error('Error formatting date to UTC:', error);
        utcVisitDateTime = null;
      }
    }
    
    const submissionData = {
      ...formData,
      reason_to_call_immediately: formData.call_immediately ? formData.reason_to_call_immediately : null,
      // visit_booking_datetime: sanitizedBookingDatetime,
      visit_booking_datetime: formData.site_visit_booked ? formData.visit_booking_datetime : null,
      ...(isEditing && { lead_id: initialData?._id })
    }

    onSubmit(submissionData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Information */}
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            value={formData.first_name}
            onChange={(e) => handleInputChange("first_name", e.target.value)}
            placeholder="Enter first name"
            className={errors.first_name ? "border-red-500" : ""}
          />
          {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name *</Label>
          <Input
            id="last_name"
            value={formData.last_name}
            onChange={(e) => handleInputChange("last_name", e.target.value)}
            placeholder="Enter last name"
            className={errors.last_name ? "border-red-500" : ""}
          />
          {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_number">Contact Number *</Label>
          <Input
            id="contact_number"
            value={formData.contact_number}
            onChange={(e) => handleInputChange("contact_number", e.target.value)}
            placeholder="+91 9123456789"
            className={errors.contact_number ? "border-red-500" : ""}
          />
          {errors.contact_number && <p className="text-sm text-red-500">{errors.contact_number}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lead_type">Lead Type</Label>
          <Select value={formData.lead_type} onValueChange={(value: "Hot" | "Cold") => handleInputChange("lead_type", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select lead type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Hot">Hot</SelectItem>
              <SelectItem value="Cold">Cold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="project">Project *</Label>
          <Select
            value={formData.project_id || ""}
            onValueChange={handleProjectChange}
            disabled={projectsLoading}
          >
            <SelectTrigger className={errors.project_id ? "border-red-500" : ""}>
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
            <p className="text-sm text-red-500">Failed to load projects.</p>
          )}
          {errors.project_id && <p className="text-sm text-red-500">{errors.project_id}</p>}
        </div>

        {/* Site Visit Date and Time - Only show if site visit is booked */}
        {formData.site_visit_booked && (
          <>
            <div className="space-y-2">
              <Label>Visit Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !visitDate && "text-muted-foreground",
                      errors.visit_date && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {visitDate ? format(visitDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={visitDate}
                    onSelect={handleVisitDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.visit_date && <p className="text-sm text-red-500">{errors.visit_date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="visit_time">Visit Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="visit_time"
                  type="time"
                  value={visitTime}
                  onChange={(e) => handleVisitTimeChange(e.target.value)}
                  className={cn(
                    "pl-10",
                    errors.visit_time && "border-red-500"
                  )}
                />
              </div>
              {errors.visit_time && <p className="text-sm text-red-500">{errors.visit_time}</p>}
            </div>
          </>
        )}
      </div>

      {/* Toggle Switches */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="reached"
            checked={formData.reached}
            onCheckedChange={(checked) => handleInputChange("reached", checked)}
          />
          <Label htmlFor="reached">Reached</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="site_visit_booked"
            checked={formData.site_visit_booked}
            onCheckedChange={(checked) => handleInputChange("site_visit_booked", checked)}
          />
          <Label htmlFor="site_visit_booked">Site Visit Booked</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="call_immediately"
            checked={formData.call_immediately}
            onCheckedChange={(checked) => handleInputChange("call_immediately", checked)}
          />
          <Label htmlFor="call_immediately">Call Immediately</Label>
        </div>
      </div>

      {/* Reason for Immediate Call - Only show if call immediately is enabled */}
      {formData.call_immediately && (
        <div className="space-y-2">
          <Label htmlFor="reason_to_call_immediately">Reason to Call Immediately *</Label>
          <Textarea
            id="reason_to_call_immediately"
            value={formData.reason_to_call_immediately}
            onChange={(e) => handleInputChange("reason_to_call_immediately", e.target.value)}
            placeholder="Enter reason for immediate call..."
            rows={3}
            className={errors.reason_to_call_immediately ? "border-red-500" : ""}
          />
          {errors.reason_to_call_immediately && <p className="text-sm text-red-500">{errors.reason_to_call_immediately}</p>}
        </div>
      )}

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