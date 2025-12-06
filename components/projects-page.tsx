"use client"

import React, { useMemo, useState } from "react"
import type { IActivity } from "@/lib/types"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ActivityList } from "@/components/activity-list"
import { Input } from "@/components/ui/input"

interface Project {
  id: string
  name: string
}

interface User {
  id: string
  name?: string
  email: string
}

interface ProjectsPageProps {
  projects: Project[]
  activities: IActivity[]
  users: User[]
}

export function ProjectsPage({ projects, activities, users }: ProjectsPageProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects?.[0]?.id ?? null)
  const [searchQuery, setSearchQuery] = useState("")

  const sortedAndFilteredProjects = useMemo(() => {
    return projects
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [projects, searchQuery])

  const projectActivities = useMemo(() => {
    if (!selectedProjectId) return []
    return activities
      .filter((a) => a.projects.some((p) => p.project.id === selectedProjectId))
      .sort((a, b) => {
        // Sort by status first
        const statusOrder = { "Created": 0, "InProgress": 1, "Completed": 2 }
        const statusA = statusOrder[a.status as keyof typeof statusOrder] ?? 3
        const statusB = statusOrder[b.status as keyof typeof statusOrder] ?? 3
        if (statusA !== statusB) return statusA - statusB
        
        // Then sort by createdAt
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA
      })
  }, [activities, selectedProjectId])

  const teamMembers = useMemo(() => {
    const map = new Map<string, User>()
    projectActivities.forEach((a) => {
      a.assignedPersons.forEach((ap) => {
        const u = ap.user
        if (!map.has(u.id)) map.set(u.id, { id: u.id, name: u.name ?? undefined, email: u.email })
      })
    })
    return Array.from(map.values())
  }, [projectActivities])

  const statuses = ["Created", "InProgress", "Completed"]
  const kanbanColumns = useMemo(() => {
    const cols: Record<string, IActivity[]> = {}
    statuses.forEach((s) => (cols[s] = []))
    projectActivities.forEach((a) => {
      const st = a.status || "Created"
      if (!cols[st]) cols[st] = []
      cols[st].push(a)
    })
    return cols
  }, [projectActivities])

  return (
    <div className="w-full">
      <div className="grid grid-cols-[18rem_1fr] gap-4">
        <aside className="bg-white rounded-lg border p-3 h-[600px] overflow-auto">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Projects</h3>
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-3 text-sm"
          />
          <div className="space-y-1">
            {sortedAndFilteredProjects.length === 0 && (
              <div className="text-sm text-muted-foreground">No projects</div>
            )}
            {sortedAndFilteredProjects.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className={`w-full text-left px-2 py-2 rounded-md transition-colors hover:bg-slate-50 ${selectedProjectId === p.id ? 'bg-slate-100 ring-1 ring-slate-200' : ''}`}
              >
                <div className="font-medium text-slate-700">{p.name}</div>
              </button>
            ))}
          </div>
        </aside>

        <section className="bg-white rounded-lg border p-4 h-[600px] overflow-auto">
          {!selectedProjectId ? (
            <div className="text-center text-sm text-muted-foreground">Select a project to view details</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-700">{projects.find(p => p.id === selectedProjectId)?.name}</h2>
                <div className="text-sm text-muted-foreground">{projectActivities.length} activities</div>
              </div>

              <Tabs defaultValue="activitiesTable" className="w-full">
                <div className="flex justify-start">
                  <TabsList className="grid grid-cols-5 w-full">
                    <TabsTrigger value="activitiesTable">Activities</TabsTrigger>
                    <TabsTrigger value="kanban">Kanban</TabsTrigger>
                    <TabsTrigger value="gantt">Gantt</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar</TabsTrigger>
                    <TabsTrigger value="team">Team</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="activitiesTable">
                  {projectActivities.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No activities for this project</div>
                  ) : (
                    <ActivityList activities={projectActivities} />
                  )}
                </TabsContent>

                <TabsContent value="kanban">
                  <div className="flex gap-3 overflow-auto">
                    {statuses.map((s) => (
                      <div key={s} className="min-w-[12rem] bg-slate-50 rounded-md p-2">
                        <div className="text-sm font-medium mb-2">{s} ({kanbanColumns[s]?.length || 0})</div>
                        <div className="space-y-2">
                          {(kanbanColumns[s] || []).map((a) => (
                            <div key={a.id} className="bg-white p-2 rounded-md shadow-sm border">
                              <div className="text-sm font-medium">{a.description}</div>
                              <div className="text-xs text-muted-foreground">Due {new Date(a.dueDate).toLocaleDateString()}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="gantt">
                  <div className="text-sm text-muted-foreground">Gantt chart placeholder — integrate a Gantt library (eg. react-gantt or vis-timeline) as next step.</div>
                </TabsContent>

                <TabsContent value="calendar">
                  <div className="text-sm text-muted-foreground">Calendar view placeholder — integrate FullCalendar or similar to display activities by due date.</div>
                </TabsContent>

                <TabsContent value="team">
                  <div className="space-y-2">
                    {teamMembers.length === 0 && (
                      <div className="text-sm text-muted-foreground">No team members found for this project</div>
                    )}
                    {teamMembers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <div className="font-medium text-slate-700">{u.name ?? u.email}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default ProjectsPage
