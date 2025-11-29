"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useEffect } from "react"

interface Project {
  id: string
  name: string
}

interface User {
  id: string
  name?: string
  email: string
}

interface FilterState {
  dateFrom: string
  dateTo: string
  projectIds: string[]
  personIds: string[]
  status: string
  type?: string
  noProject?: boolean
}

export function ActivityFilters({
  projects,
  users,
  onFilter,
}: {
  projects: Project[]
  users: User[]
  onFilter: (filters: FilterState) => void
}) {
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: "",
    dateTo: "",
    projectIds: [],
    personIds: [],
    status: "all",
    type: "all",
    noProject: false,
  })

  const handleFilter = () => {
    onFilter(filters)
  }

  const handleReset = () => {
    const emptyFilters: FilterState = {
      dateFrom: "",
      dateTo: "",
      projectIds: [],
      personIds: [],
      status: "all",
      type: "all",
      noProject: false,
    }
    setFilters(emptyFilters)
    onFilter(emptyFilters)
  }

  // Add global styles for the date picker
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .rdp {
        --rdp-cell-size: 32px;
        --rdp-accent-color: #3b82f6;
        --rdp-background-color: #f1f5f9;
        margin: 0;
      }
      .rdp-button {
        height: var(--rdp-cell-size);
        width: var(--rdp-cell-size);
        font-size: 0.75rem;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <Card className="border-0 shadow-sm w-full mx-auto">
      <CardContent className="p-4">
        <div className="space-y-3">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-row gap-3 flex-wrap">
                      <div className="flex flex-col space-y-1 min-w-[120px]">
                        <Label htmlFor="dateFrom" className="text-xs font-medium text-muted-foreground">From</Label>
                        <Input
                          id="dateFrom"
                          type="date"
                          value={filters.dateFrom}
                          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="flex flex-col space-y-1 min-w-[120px]">
                        <Label htmlFor="dateTo" className="text-xs font-medium text-muted-foreground">To</Label>
                        <Input
                          id="dateTo"
                          type="date"
                          value={filters.dateTo}
                          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="flex flex-col space-y-1 min-w-[120px]">
                        <Label htmlFor="status" className="text-xs font-medium text-muted-foreground">Status</Label>
                        <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="All statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="Created">Created</SelectItem>
                            <SelectItem value="InProgress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col space-y-1 min-w-[120px]">
                        <Label htmlFor="type" className="text-xs font-medium text-muted-foreground">Type</Label>
                        <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="All types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            <SelectItem value="ProjectTask">Project Task</SelectItem>
                            <SelectItem value="RoutineWork">Routine Work</SelectItem>
                            <SelectItem value="AttendMeeting">Attend Meeting</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col space-y-1 min-w-[180px]">
                        <Label className="text-xs font-medium text-muted-foreground">Projects</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left bg-transparent h-8 text-sm">
                              {filters.projectIds.length > 0 ? `${filters.projectIds.length} selected` : "Filter by projects..."}
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
                                        setFilters((prev) => ({
                                          ...prev,
                                          projectIds: prev.projectIds.includes(project.id)
                                            ? prev.projectIds.filter((p) => p !== project.id)
                                            : [...prev.projectIds, project.id],
                                        }))
                                      }}
                                    >
                                      <div className="mr-2 h-4 w-4 border border-primary rounded flex items-center justify-center">
                                        {filters.projectIds.includes(project.id) && <div className="h-2 w-2 bg-primary" />}
                                      </div>
                                      {project.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {filters.projectIds.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {filters.projectIds.map((projectId) => {
                              const project = projects.find((p) => p.id === projectId)
                              return (
                                <Badge key={projectId} variant="secondary" className="flex items-center gap-1">
                                  {project?.name}
                                  <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() =>
                                      setFilters((prev) => ({
                                        ...prev,
                                        projectIds: prev.projectIds.filter((p) => p !== projectId),
                                      }))
                                    }
                                  />
                                </Badge>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1 min-w-[180px]">
                        <Label className="text-xs font-medium text-muted-foreground">Team Members</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left bg-transparent h-8 text-sm">
                              {filters.personIds.length > 0 ? `${filters.personIds.length} selected` : "Filter by persons..."}
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
                                        setFilters((prev) => ({
                                          ...prev,
                                          personIds: prev.personIds.includes(user.id)
                                            ? prev.personIds.filter((p) => p !== user.id)
                                            : [...prev.personIds, user.id],
                                        }))
                                      }}
                                    >
                                      <div className="mr-2 h-4 w-4 border border-primary rounded flex items-center justify-center">
                                        {filters.personIds.includes(user.id) && <div className="h-2 w-2 bg-primary" />}
                                      </div>
                                      {user.name || user.email}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {filters.personIds.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {filters.personIds.map((userId) => {
                              const user = users.find((u) => u.id === userId)
                              return (
                                <Badge key={userId} variant="secondary" className="flex items-center gap-1">
                                  {user?.name || user?.email}
                                  <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() =>
                                      setFilters((prev) => ({
                                        ...prev,
                                        personIds: prev.personIds.filter((p) => p !== userId),
                                      }))
                                    }
                                  />
                                </Badge>
                              )
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 min-w-[250px]">
                        <input
                          type="checkbox"
                          id="noProject"
                          checked={filters.noProject || false}
                          onChange={e => setFilters({ ...filters, noProject: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="noProject" className="text-xs font-medium text-muted-foreground cursor-pointer">Activities not linked to any project</Label>
                      </div>
                    </div>
                    <div className="flex flex-row gap-4 items-center pt-2 justify-end">
                      <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleReset}>
                        Clear all
                      </Button>
                      <Button size="sm" className="h-8 text-xs" onClick={handleFilter}>
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
        </CardContent>
    </Card>
  )
}
