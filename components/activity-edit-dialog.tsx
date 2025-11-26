"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import type { IActivity } from "@/lib/types"
import { ActivityEditForm } from "./activity-edit-form"

interface ActivityEditDialogProps {
  activity: IActivity
  onSuccess: () => void
}

export function ActivityEditDialog({ activity, onSuccess }: ActivityEditDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSuccess = () => {
    setIsOpen(false)
    onSuccess()
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setIsOpen(true)}
        aria-label="Edit activity"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
          </DialogHeader>
          <ActivityEditForm activity={activity} onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </>
  )
}
