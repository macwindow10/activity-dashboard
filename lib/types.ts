export type ActivityType = "ProjectTask" | "RoutineWork" | "AttendMeeting" | "Other"
export type ActivityStatus = "Created" | "InProgress" | "Completed"

export interface IActivity {
  id: string
  description: string
  type: ActivityType
  status: ActivityStatus
  dueDate: Date
  completionDate?: Date | null
  createdBy: { id: string; name?: string; email: string }
  projects: { project: { id: string; name: string } }[]
  assignedPersons: { user: { id: string; name?: string; email: string } }[]
  createdAt: Date
  updatedAt: Date
}
