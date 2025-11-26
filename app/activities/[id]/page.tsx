"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import type { IActivity } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ArrowLeft, Edit2, Trash2, CheckCircle2, Clock, Circle } from "lucide-react"
import { toast } from "sonner"
import { ActivityEditForm } from "@/components/activity-edit-form"

function getStatusIcon(status: string) {
  switch (status) {
    case "Completed":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    case "InProgress":
      return <Clock className="h-5 w-5 text-yellow-500" />
    default:
      return <Circle className="h-5 w-5 text-gray-400" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800"
    case "InProgress":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case "ProjectTask":
      return "bg-blue-100 text-blue-800"
    case "RoutineWork":
      return "bg-purple-100 text-purple-800"
    case "AttendMeeting":
      return "bg-pink-100 text-pink-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function ActivityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activity, setActivity] = useState<IActivity | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch(`/api/activities/${params.id}`)
        if (!response.ok) throw new Error("Failed to fetch activity")
        const data = await response.json()
        setActivity(data)
      } catch (error) {
        console.error("Error fetching activity:", error)
        toast.error("Failed to load activity")
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchActivity()
    }
  }, [params.id, router])

  const handleDelete = async () => {
    if (!activity) return
    if (!confirm("Are you sure you want to delete this activity?")) return

    try {
      const response = await fetch(`/api/activities/${activity.id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete activity")
      toast.success("Activity deleted")
      router.push("/")
    } catch (error) {
      console.error("Error deleting activity:", error)
      toast.error("Failed to delete activity")
    }
  }

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/activities/${params.id}`)
      if (!response.ok) throw new Error("Failed to fetch updated activity")
      const data = await response.json()
      setActivity(data)
      setIsEditing(false)
      toast.success("Activity updated")
    } catch (error) {
      console.error("Error refreshing activity:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading activity...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Activity not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => router.push("/")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {isEditing ? (
          <ActivityEditForm activity={activity} onSuccess={handleUpdate} />
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1">
                    <CardTitle className="text-2xl">{activity.description}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className={getTypeColor(activity.type)}>{activity.type}</Badge>
                      <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Due Date</p>
                  <p className="font-medium text-lg">{format(new Date(activity.dueDate), "PPp")}</p>
                </div>
                {activity.completionDate && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Completed</p>
                    <p className="font-medium text-lg">{format(new Date(activity.completionDate), "PPp")}</p>
                  </div>
                )}
              </div>

              {activity.projects.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Projects</p>
                  <div className="flex flex-wrap gap-2">
                    {activity.projects.map((ap) => (
                      <Badge key={ap.project.id} variant="outline" className="text-base px-3 py-1">
                        {ap.project.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {activity.assignedPersons.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Assigned to</p>
                  <div className="flex flex-wrap gap-2">
                    {activity.assignedPersons.map((ap) => (
                      <Badge key={ap.user.id} variant="outline" className="text-base px-3 py-1">
                        {ap.user.name || ap.user.email}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Created by <span className="font-medium">{activity.createdBy.name || activity.createdBy.email}</span>
                </p>
                <p className="text-sm text-muted-foreground">{format(new Date(activity.createdAt), "PPp")}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
