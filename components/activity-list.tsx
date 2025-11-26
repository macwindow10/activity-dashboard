"use client"

import type { IActivity } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CheckCircle2, Circle, Clock } from "lucide-react"
import { ActivityEditDialog } from "./activity-edit-dialog"

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

export function ActivityList({ activities, onSuccess = () => {} }: { activities: IActivity[]; onSuccess?: () => void }) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No activities found. Create one to get started!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <Card key={activity.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getStatusIcon(activity.status)}
                <div className="flex-1">
                  <CardTitle className="text-base">{activity.description}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge className={getTypeColor(activity.type)}>{activity.type}</Badge>
                    <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ActivityEditDialog activity={activity} onSuccess={onSuccess} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Due Date</p>
                <p className="font-medium">{format(new Date(activity.dueDate), "PPp")}</p>
              </div>
              {activity.completionDate && (
                <div>
                  <p className="text-muted-foreground">Completed</p>
                  <p className="font-medium">{format(new Date(activity.completionDate), "PPp")}</p>
                </div>
              )}
            </div>

            {activity.projects.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Projects</p>
                <div className="flex flex-wrap gap-1">
                  {activity.projects.map((ap) => (
                    <Badge key={ap.project.id} variant="outline">
                      {ap.project.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {activity.assignedPersons.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Assigned to</p>
                <div className="flex flex-wrap gap-1">
                  {activity.assignedPersons.map((ap) => (
                    <Badge key={ap.user.id} variant="outline">
                      {ap.user.name || ap.user.email}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Created by {activity.createdBy.name || activity.createdBy.email}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
