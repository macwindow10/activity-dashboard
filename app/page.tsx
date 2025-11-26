"use client"

import { useState, useEffect } from "react"
import { ActivityForm } from "@/components/activity-form"
import { ActivityFilters } from "@/components/activity-filters"
import { ActivityList } from "@/components/activity-list"
import type { IActivity } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface Project {
  id: string
  name: string
}

interface User {
  id: string
  name?: string
  email: string
}

export default function Dashboard() {
  const [activities, setActivities] = useState<IActivity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<IActivity[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activitiesRes, projectsRes, usersRes] = await Promise.all([
          fetch("/api/activities"),
          fetch("/api/projects"),
          fetch("/api/users"),
        ])

        const activitiesData = await activitiesRes.json()
        const projectsData = await projectsRes.json()
        const usersData = await usersRes.json()

        setActivities(activitiesData)
        setFilteredActivities(activitiesData)
        setProjects(projectsData)
        setUsers(usersData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleFilter = (filters: {
    dateFrom: string
    dateTo: string
    projectIds: string[]
    personIds: string[]
    status: string
  }) => {
    let filtered = [...activities]

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filtered = filtered.filter((a) => new Date(a.dueDate) >= fromDate)
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter((a) => new Date(a.dueDate) <= toDate)
    }

    if (filters.projectIds.length > 0) {
      filtered = filtered.filter((a) => a.projects.some((p) => filters.projectIds.includes(p.project.id)))
    }

    if (filters.personIds.length > 0) {
      filtered = filtered.filter((a) => a.assignedPersons.some((p) => filters.personIds.includes(p.user.id)))
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((a) => a.status === filters.status)
    }

    setFilteredActivities(filtered)
  }

  const handleActivityCreated = async () => {
    await refreshActivities()
  }

  const handleActivityUpdated = async () => {
    await refreshActivities()
  }

  const refreshActivities = async () => {
    try {
      const response = await fetch("/api/activities")
      const data = await response.json()
      setActivities(data)
      setFilteredActivities(data)
    } catch (error) {
      console.error("Error refreshing activities:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Activity Dashboard</h1>
          <p className="text-slate-600">Manage and track all your activities in one place</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="create">Create Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <ActivityFilters projects={projects} users={users} onFilter={handleFilter} />
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading activities...</p>
              </div>
            ) : (
              <ActivityList activities={filteredActivities} />
            )}
          </TabsContent>

          <TabsContent value="create">
            <div className="space-y-6">
              <ActivityForm onSuccess={handleActivityCreated} />
              <ActivityList activities={filteredActivities} onSuccess={handleActivityUpdated} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
