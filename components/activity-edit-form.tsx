// components/activity-edit-form.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandInput, CommandItem, CommandList, CommandGroup } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"

interface Project {
  id: string
  name: string
}

interface User {
  id: string
  name: string | null
  email: string
}

interface ActivityEditFormProps {
  activity: {
    id: string
    description: string
    projects: { projectId: string; project: { id: string; name: string } }[]
    assignedPersons: { userId: string; user: { id: string; name: string | null; email: string } }[]
    dueDate: string
    completionDate: string | null
  }
  onSuccess: () => void
}

export function ActivityEditForm({ activity, onSuccess }: ActivityEditFormProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedProjects, setSelectedProjects] = useState<string[]>(activity.projects?.map(p => p.projectId) || [])
  const [selectedPersons, setSelectedPersons] = useState<string[]>(activity.assignedPersons?.map(p => p.userId) || [])
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    description: activity.description,
    dueDate: activity.dueDate ? new Date(activity.dueDate).toISOString().slice(0, 16) : "",
    completionDate: activity.completionDate ? new Date(activity.completionDate).toISOString().slice(0, 16) : "",
  })

  // Fetch projects and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace with your actual API endpoints
        const [projectsRes, usersRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/users')
        ])
        
        if (projectsRes.ok) setProjects(await projectsRes.json())
        if (usersRes.ok) setUsers(await usersRes.json())
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/activities/${activity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          projectIds: selectedProjects,
          assignedUserIds: selectedPersons,
        }),
      })

      if (!response.ok) throw new Error('Failed to update activity')
      
      toast.success('Activity updated successfully')
      onSuccess()
    } catch (error) {
      console.error('Error updating activity:', error)
      toast.error('Failed to update activity')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter activity description"
          required
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label>Projects</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start" type="button">
              {selectedProjects.length > 0 
                ? `${selectedProjects.length} selected` 
                : "Select projects..."}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Command>
              <CommandInput placeholder="Search projects..." />
              <CommandList>
                <CommandGroup>
                  {projects.map((project) => (
                    <CommandItem
                      key={project.id}
                      onSelect={() => {
                        setSelectedProjects(prev =>
                          prev.includes(project.id)
                            ? prev.filter(id => id !== project.id)
                            : [...prev, project.id]
                        )
                      }}
                    >
                      <div
                        className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border 
                          ${selectedProjects.includes(project.id) 
                            ? 'bg-primary text-primary-foreground' 
                            : 'opacity-50'}`}
                      >
                        {selectedProjects.includes(project.id) && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                      {project.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedProjects.map(projectId => {
            const project = projects.find(p => p.id === projectId)
            return project ? (
              <Badge key={projectId} variant="secondary" className="flex items-center gap-1">
                {project.name}
                <button
                  type="button"
                  onClick={() => 
                    setSelectedProjects(prev => prev.filter(id => id !== projectId))
                  }
                  className="ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Assigned Persons</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start" type="button">
              {selectedPersons.length > 0 
                ? `${selectedPersons.length} selected` 
                : "Select persons..."}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Command>
              <CommandInput placeholder="Search persons..." />
              <CommandList>
                <CommandGroup>
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      onSelect={() => {
                        setSelectedPersons(prev =>
                          prev.includes(user.id)
                            ? prev.filter(id => id !== user.id)
                            : [...prev, user.id]
                        )
                      }}
                    >
                      <div
                        className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border 
                          ${selectedPersons.includes(user.id) 
                            ? 'bg-primary text-primary-foreground' 
                            : 'opacity-50'}`}
                      >
                        {selectedPersons.includes(user.id) && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                      {user.name || user.email}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedPersons.map(userId => {
            const user = users.find(u => u.id === userId)
            return user ? (
              <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                {user.name || user.email}
                <button
                  type="button"
                  onClick={() => 
                    setSelectedPersons(prev => prev.filter(id => id !== userId))
                  }
                  className="ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="completionDate">Completion Date (Optional)</Label>
          <Input
            id="completionDate"
            type="datetime-local"
            value={formData.completionDate}
            onChange={(e) => setFormData(prev => ({ ...prev, completionDate: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  )
}