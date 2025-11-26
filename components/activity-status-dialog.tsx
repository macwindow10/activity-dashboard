"use client"

import { useState, ReactNode } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, Circle, MessageSquare } from "lucide-react"
import type { IActivity } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ActivityStatusDialogProps {
  activity: IActivity
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  children?: ReactNode
  className?: string
}

export function ActivityStatusDialog({ 
  activity, 
  open, 
  onOpenChange, 
  onSuccess, 
  children, 
  className = "" 
}: ActivityStatusDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [remarks, setRemarks] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus)
  }

  const handleSubmit = async () => {
    if (!selectedStatus) return
    
    try {
      setIsLoading(true)
      console.log('remarks: ', remarks);
      const response = await fetch(`/api/activities/${activity.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: selectedStatus,
          remarks: remarks.trim() || null,
          changedById: "1" // TODO: Replace with actual user ID from auth context
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      toast({
        title: 'Success',
        description: 'Activity status updated successfully',
      })
      
      const handleSuccess = () => {
        onOpenChange(false)
        onSuccess()
      }
      handleSuccess()
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update activity status',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setRemarks("")
          setSelectedStatus(null)
          onOpenChange(isOpen)
        }
      }}
    >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Activity Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Current status: <span className="font-medium">{activity.status}</span>
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <Button
                variant={selectedStatus === 'NotStarted' ? 'secondary' : 'outline'}
                className="justify-start"
                onClick={() => handleStatusChange('NotStarted')}
                disabled={isLoading}
              >
                <Circle className="mr-2 h-4 w-4 text-gray-400" />
                Not Started
              </Button>
              <Button
                variant={selectedStatus === 'InProgress' ? 'secondary' : 'outline'}
                className="justify-start"
                onClick={() => handleStatusChange('InProgress')}
                disabled={isLoading}
              >
                <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                In Progress
              </Button>
              <Button
                variant={selectedStatus === 'Completed' ? 'secondary' : 'outline'}
                className="justify-start"
                onClick={() => handleStatusChange('Completed')}
                disabled={isLoading}
              >
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                Completed
              </Button>
              
              {selectedStatus && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="remarks" className="flex items-center gap-2 text-sm">
                      <MessageSquare className="h-4 w-4" />
                      Remarks (Optional)
                    </Label>
                    <Textarea
                      id="remarks"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Add any notes about this status change..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button 
                    className="w-full mt-2" 
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Update Status'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
    </Dialog>
  )
}
