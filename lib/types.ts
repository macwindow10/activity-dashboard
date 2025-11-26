export type ActivityType = "ProjectTask" | "RoutineWork" | "AttendMeeting" | "Other"
export type ActivityStatus = "Created" | "InProgress" | "Completed"

export interface IActivity {
  id: string
  description: string
  type: string
  status: string
  dueDate: string | Date
  completionDate: string | Date | null
  createdById: string
  createdAt: string | Date
  updatedAt: string | Date
  createdBy: {
    id: string
    name: string | null
    email: string
  }
  projects: Array<{
    project: {
      id: string
      name: string
    }
  }>
  assignedPersons: Array<{
    user: {
      id: string
      name: string | null
      email: string
    }
  }>
  statusHistory?: Array<{
    id: string
    status: string
    remarks: string | null
    changedAt: Date
    changedBy: {
      id: string
      name: string | null
      email: string
    }
  }>
}
