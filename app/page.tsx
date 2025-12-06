"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ActivityForm } from "@/components/activity-form"
import { ActivityFilters } from "@/components/activity-filters"
import { ActivityList } from "@/components/activity-list"
import { Dashboard } from "@/components/dashboard"
import ProjectsPage from "@/components/projects-page"
import type { IActivity } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { LogOut } from "lucide-react"

interface Project {
  id: string
  name: string
}

interface User {
  id: string
  name?: string
  email: string
}

export default function MainPage() {
  const [activities, setActivities] = useState<IActivity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<IActivity[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { logout, session } = useAuth()
  const router = useRouter()

  const sortActivities = (arr: IActivity[]) => {
    return [...arr].sort((a, b) => {
      const statusOrder = { "Created": 0, "InProgress": 1, "Completed": 2 }
        const statusA = statusOrder[a.status as keyof typeof statusOrder] ?? 3
        const statusB = statusOrder[b.status as keyof typeof statusOrder] ?? 3
        if (statusA !== statusB) return statusA - statusB
        
        // Then sort by createdAt
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA
    })
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logged out successfully")
      router.refresh()
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

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
        // console.log("Fetched activities data:", activitiesData);
        const projectsData = await projectsRes.json()
        const usersData = await usersRes.json()

        const sorted = sortActivities(activitiesData)

        setActivities(sorted)
        setFilteredActivities(sorted)
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
    type?: string
    noProject?: boolean
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

    if (filters.noProject) {
      filtered = filtered.filter((a) => a.projects.length === 0)
    } else if (filters.projectIds.length > 0) {
      filtered = filtered.filter((a) => a.projects.some((p) => filters.projectIds.includes(p.project.id)))
    }

    if (filters.personIds.length > 0) {
      filtered = filtered.filter((a) => a.assignedPersons.some((p) => filters.personIds.includes(p.user.id)))
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((a) => a.status === filters.status)
    }

    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter((a) => a.type === filters.type)
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
      const sorted = sortActivities(data)
      setActivities(sorted)
      setFilteredActivities(sorted)
    } catch (error) {
      console.error("Error refreshing activities:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8 flex flex-col items-center pt-2 md:pt-4">
      <div className="w-full max-w-[1800px] space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-slate-600 mb-1">Activity Dashboard</h1>
            {session && (
              <p className="text-sm text-slate-600">Welcome, {session.name || session.email}</p>
            )}
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2 border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut className="w-4 h-4" />
            
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-2 w-full">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="create">Create Activity</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-3 w-full">
            <Dashboard activities={activities} projects={projects} users={users} />
          </TabsContent>

          <TabsContent value="activities" className="space-y-3 w-full">
            <ActivityFilters projects={projects} users={users} onFilter={handleFilter} />
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading activities...</p>
              </div>
            ) : (
              <ActivityList activities={filteredActivities} />
            )}
          </TabsContent>

          <TabsContent value="create" className="w-full">
              <div className="space-y-6">
                  <ActivityForm onSuccess={handleActivityCreated} compact />
              </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-3 w-full">
            <ProjectsPage projects={projects} activities={activities} users={users} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
