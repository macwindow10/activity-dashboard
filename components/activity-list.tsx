"use client"

import type { IActivity } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CheckCircle2, Circle, Clock, Pencil, RefreshCw, X } from "lucide-react"
import { ActivityEditDialog } from "./activity-edit-dialog"
import { ActivityStatusDialog } from "./activity-status-dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

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

function ActivityDetails({ activity, onClose }: { activity: IActivity | null; onClose: () => void }) {
  return (
    <div className="w-full md:w-80 bg-white border-l flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-lg font-semibold">Activity Details</h3>
        {activity && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {activity ? (
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Details</h4>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge className={getTypeColor(activity.type)}>{activity.type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={getStatusColor(activity.status)}>{activity.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span>{format(new Date(activity.dueDate), "PPp")}</span>
                  </div>
                  {activity.completionDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completion Date:</span>
                      <span>{format(new Date(activity.completionDate), "PPp")}</span>
                    </div>
                  )}
                </div>
              </div>

              {activity.projects.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Projects</h4>
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
                  <h4 className="font-medium mb-2">Assigned To</h4>
                  <div className="space-y-2">
                    {activity.assignedPersons.map((ap) => (
                      <div key={ap.user.id} className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                          {ap.user.name?.[0] || ap.user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm">{ap.user.name || ap.user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">History</h4>
                <div className="space-y-4">
                  {/* Creation Event */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-1"></div>
                      <div className={`h-full w-px bg-gray-200 my-1 ${!activity.statusHistory?.length ? 'opacity-0' : ''}`}></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Activity Created</p>
                      <p className="text-xs text-muted-foreground">
                        By {activity.createdBy.name || activity.createdBy.email} • {format(new Date(activity.createdAt), "PPp")}
                      </p>
                    </div>
                  </div>

                  {/* Status History */}
                  {activity.statusHistory?.map((history, i, array) => {
                    const isLast = i === array.length - 1;
                    return (
                      <div key={history.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-1"></div>
                          {!isLast && <div className="h-full w-px bg-gray-200 my-1"></div>}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Status changed to <span className={getStatusColor(history.status) + " px-1.5 py-0.5 rounded text-xs"}>
                              {history.status}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            By {history.changedBy.name || history.changedBy.email} • {format(new Date(history.changedAt), "PPp")}
                          </p>
                          {history.remarks && (
                            <div className="mt-1 p-2 bg-gray-50 rounded text-xs text-muted-foreground">
                              <p className="font-medium text-gray-700">Remarks:</p>
                              <p className="whitespace-pre-line">{history.remarks}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Last Updated (if different from last status change) */}
                  {activity.updatedAt !== activity.createdAt && 
                   (!activity.statusHistory?.length || 
                    new Date(activity.updatedAt) > new Date(activity.statusHistory[activity.statusHistory.length - 1]?.changedAt)) && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-gray-400 mt-1"></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Last Updated</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(activity.updatedAt), "PPp")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
      ) : (
        <div className="flex-1 p-4 flex items-center justify-center text-muted-foreground">
          <p>Select an activity to view details</p>
        </div>
      )}
    </div>
  )
}

export function ActivityList({ activities, onSuccess = () => {} }: { activities: IActivity[]; onSuccess?: () => void }) {
  const [editingActivity, setEditingActivity] = useState<IActivity | null>(null)
  const [statusActivity, setStatusActivity] = useState<IActivity | null>(null)
  const [detailsActivity, setDetailsActivity] = useState<IActivity | null>(null)
  
  // console.log("Rendering activities:", activities);
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
    <div className="flex gap-4 h-full flex-col">
      <div className="text-sm text-muted-foreground font-medium">
        Total Activities: <span className="font-bold text-foreground">{activities.length}</span>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto">
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
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2"
                  onClick={() => setEditingActivity(activity)}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2"
                  onClick={() => setStatusActivity(activity)}
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Status
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2"
                  onClick={() => setDetailsActivity(activity)}
                >
                  <span className="text-sm">Details</span>
                </Button>
                {editingActivity && (
                  <ActivityEditDialog 
                    activity={editingActivity}
                    open={!!editingActivity}
                    onOpenChange={(open) => !open && setEditingActivity(null)}
                    onSuccess={() => {
                      setEditingActivity(null)
                      onSuccess()
                    }}
                  />
                )}
                {statusActivity && (
                  <ActivityStatusDialog 
                    activity={statusActivity}
                    open={!!statusActivity}
                    onOpenChange={(open) => !open && setStatusActivity(null)}
                    onSuccess={() => {
                      setStatusActivity(null)
                      onSuccess()
                    }}
                  />
                )}
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

      <ActivityDetails 
        activity={detailsActivity}
        onClose={() => setDetailsActivity(null)}
      />
    </div>
  )
}
