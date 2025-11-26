"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import type { IActivity } from "@/lib/types"
import { ActivityEditForm } from "./activity-edit-form"
import { ReactNode } from "react"

interface ActivityEditDialogProps {
  activity: IActivity
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  children?: ReactNode
  className?: string
}

export function ActivityEditDialog({ 
  activity, 
  open,
  onOpenChange, 
  onSuccess, 
  children, 
  className = "" 
}: ActivityEditDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false)
    onSuccess()
  }

  // Transform the activity data to match the expected format for ActivityEditForm
  const formattedActivity = {
    ...activity,
    projects: activity.projects.map(p => ({
      projectId: p.project.id,
      project: p.project
    })),
    assignedPersons: activity.assignedPersons.map(ap => ({
      userId: ap.user.id,
      user: ap.user
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Activity</DialogTitle>
        </DialogHeader>
        <ActivityEditForm activity={formattedActivity} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
