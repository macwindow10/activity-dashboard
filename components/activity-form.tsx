"use client"

import { CommandEmpty } from "@/components/ui/command"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandList, CommandInput, CommandGroup, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { toast } from "sonner"

const ACTIVITY_TYPES = ["ProjectTask", "RoutineWork", "AttendMeeting", "Other"]
const ACTIVITY_STATUSES = ["Created", "InProgress", "Completed"]

interface Project {
  id: string
  name: string
}

interface User {
  id: string
  name?: string
  email: string
}

export function ActivityForm({ onSuccess }: { onSuccess: () => void }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [selectedPersons, setSelectedPersons] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    description: "",
    type: "ProjectTask",
    status: "Created",
    dueDate: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, usersRes] = await Promise.all([fetch("/api/projects"), fetch("/api/users")])

        if (!projectsRes.ok || !usersRes.ok) {
          throw new Error("Failed to load data. Please ensure database is set up by running: npm run seed")
        }

        const projectsData = await projectsRes.json()
        const usersData = await usersRes.json()
        setProjects(projectsData)
        setUsers(usersData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Database not initialized. Run: npm run seed")
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          projectIds: selectedProjects,
          personIds: selectedPersons,
          createdById: users[0]?.id || "default-user",
        }),
      })

      if (!response.ok) throw new Error("Failed to create activity")

      toast.success("Activity created successfully")
      setFormData({ description: "", type: "ProjectTask", status: "Created", dueDate: "" })
      setSelectedProjects([])
      setSelectedPersons([])
      onSuccess()
    } catch (error) {
      console.error("Error creating activity:", error)
      toast.error("Failed to create activity")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create New Activity</CardTitle>
        <CardDescription>Add a new activity to your dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter activity description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Activity Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Projects</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left bg-transparent">
                  {selectedProjects.length > 0 ? `${selectedProjects.length} selected` : "Select projects..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search projects..." />
                  <CommandList>
                    <CommandEmpty>No project found.</CommandEmpty>
                    <CommandGroup>
                      {projects.map((project) => (
                        <CommandItem
                          key={project.id}
                          value={project.id}
                          onSelect={() => {
                            setSelectedProjects((prev) =>
                              prev.includes(project.id) ? prev.filter((p) => p !== project.id) : [...prev, project.id],
                            )
                          }}
                        >
                          <div className="mr-2 h-4 w-4 border border-primary rounded flex items-center justify-center">
                            {selectedProjects.includes(project.id) && <div className="h-2 w-2 bg-primary" />}
                          </div>
                          {project.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedProjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedProjects.map((projectId) => {
                  const project = projects.find((p) => p.id === projectId)
                  return (
                    <Badge key={projectId} variant="secondary" className="flex items-center gap-1">
                      {project?.name}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setSelectedProjects((prev) => prev.filter((p) => p !== projectId))}
                      />
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Assign to Persons</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left bg-transparent">
                  {selectedPersons.length > 0 ? `${selectedPersons.length} selected` : "Select persons..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search persons..." />
                  <CommandList>
                    <CommandEmpty>No person found.</CommandEmpty>
                    <CommandGroup>
                      {users.map((user) => (
                        <CommandItem
                          key={user.id}
                          value={user.id}
                          onSelect={() => {
                            setSelectedPersons((prev) =>
                              prev.includes(user.id) ? prev.filter((p) => p !== user.id) : [...prev, user.id],
                            )
                          }}
                        >
                          <div className="mr-2 h-4 w-4 border border-primary rounded flex items-center justify-center">
                            {selectedPersons.includes(user.id) && <div className="h-2 w-2 bg-primary" />}
                          </div>
                          {user.name || user.email}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedPersons.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedPersons.map((userId) => {
                  const user = users.find((u) => u.id === userId)
                  return (
                    <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                      {user?.name || user?.email}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setSelectedPersons((prev) => prev.filter((p) => p !== userId))}
                      />
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating..." : "Create Activity"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
