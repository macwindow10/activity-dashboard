"use client"

import { useState, useEffect } from "react"
import type { IActivity } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { format, startOfDay } from "date-fns"

interface DashboardProps {
  activities: IActivity[]
  projects: Array<{ id: string; name: string }>
  users: Array<{ id: string; name?: string; email: string }>
}

export function Dashboard({ activities, projects, users }: DashboardProps) {
  const [chartData, setChartData] = useState<Array<{ date: string; count: number }>>([])
  const [statusData, setStatusData] = useState<Array<{ status: string; count: number }>>([])
  const [projectData, setProjectData] = useState<Array<{ name: string; count: number }>>([])
  const [userActivityData, setUserActivityData] = useState<Array<{ name: string; count: number }>>([])
  const [userCompletionData, setUserCompletionData] = useState<Array<{ name: string; completionRate: number; total: number; completed: number }>>([])
  const [workloadDistribution, setWorkloadDistribution] = useState<Array<{ name: string; value: number; type: string }>>([])

  // Calculate chart data - activities by creation date
  useEffect(() => {
    if (activities.length === 0) {
      setChartData([])
      setStatusData([])
      setProjectData([])
      setUserActivityData([])
      setUserCompletionData([])
      setWorkloadDistribution([])
      return
    }

    // Group activities by date
    const dateMap = new Map<string, number>()
    activities.forEach((activity) => {
      const date = format(new Date(activity.createdAt), "MMM dd")
      dateMap.set(date, (dateMap.get(date) || 0) + 1)
    })

    // Convert to sorted array
    const dates = Array.from(dateMap.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, count]) => ({ date, count }))

    setChartData(dates)

    // Group activities by status
    const statusMap = new Map<string, number>()
    activities.forEach((activity) => {
      const status = activity.status || "Unknown"
      statusMap.set(status, (statusMap.get(status) || 0) + 1)
    })

    const statuses = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }))
    setStatusData(statuses)

    // Group activities by project and get top 5
    const projectMap = new Map<string, number>()
    activities.forEach((activity) => {
      activity.projects.forEach((ap) => {
        const projectName = ap.project.name
        projectMap.set(projectName, (projectMap.get(projectName) || 0) + 1)
      })
    })

    const topProjects = Array.from(projectMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    setProjectData(topProjects)

    // Group activities by assigned persons
    const userActivityMap = new Map<string, number>()
    activities.forEach((activity) => {
      activity.assignedPersons.forEach((ap) => {
        const userName = ap.user.name || ap.user.email
        userActivityMap.set(userName, (userActivityMap.get(userName) || 0) + 1)
      })
    })

    const userActivities = Array.from(userActivityMap.entries()).map(([name, count]) => ({ name, count }))
    setUserActivityData(userActivities)

    // Calculate completion rates by assigned persons
    const userCompletionMap = new Map<string, { total: number; completed: number }>()
    activities.forEach((activity) => {
      activity.assignedPersons.forEach((ap) => {
        const userName = ap.user.name || ap.user.email
        const existing = userCompletionMap.get(userName) || { total: 0, completed: 0 }
        existing.total += 1
        if (activity.status === "Completed") {
          existing.completed += 1
        }
        userCompletionMap.set(userName, existing)
      })
    })

    const completionRates = Array.from(userCompletionMap.entries())
      .map(([name, data]) => ({
        name,
        completionRate: Math.round((data.completed / data.total) * 100),
        total: data.total,
        completed: data.completed,
      }))
      .sort((a, b) => b.completionRate - a.completionRate)

    setUserCompletionData(completionRates)

    // Create workload distribution data (Heavy vs Under-utilized)
    const workloadData: Array<{ name: string; value: number; type: string }> = []
    const allCounts = Array.from(userActivityMap.values())
    if (allCounts.length > 0) {
      const avgCount = allCounts.reduce((a, b) => a + b, 0) / allCounts.length
      const threshold = avgCount * 0.5 // 50% of average

      userActivities.forEach((user) => {
        if (user.count > avgCount) {
          workloadData.push({ name: user.name, value: user.count, type: "Heavy" })
        } else if (user.count < threshold) {
          workloadData.push({ name: user.name, value: user.count, type: "Under-utilized" })
        }
      })
    }

    setWorkloadDistribution(workloadData)
  }, [activities, projects])

  const chartConfig = {
    count: {
      label: "Activities",
      color: "#64748b", // slate
    },
  }

  return (
    <div className="space-y-4 w-full">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
            <p className="text-xs text-muted-foreground">All activities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Persons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Team members</p>
          </CardContent>
        </Card>
      </div>

      {/* Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Activities Created Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#957C62"
                  strokeWidth={2}
                  dot={{ fill: "#957C62", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Activity Count"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No activity data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bar Chart - Activities by Status */}
      <Card>
        <CardHeader>
          <CardTitle>Activities by Status</CardTitle>
        </CardHeader>
        <CardContent>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="status" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#73AF6F"
                  name="Activity Count"
                  radius={[8, 8, 0, 0]}
                />
                </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No activity data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bar Chart - Top 5 Projects by Activities Count */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Projects by Activities Count</CardTitle>
        </CardHeader>
        <CardContent>
          {projectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#BBCB64" // dark ocean color
                  name="Activity Count"
                  radius={[8, 8, 0, 0]}
                />
                </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No project data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bar Chart - Team Members with Heavy Activity Load and Under-Utilized */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Heavy Load */}
        <Card>
          <CardHeader>
            <CardTitle>Heavy Activity Load (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            {userActivityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={userActivityData
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill="#FFE1AF"
                    name="Activity Count"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No user data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Under-Utilized */}
        <Card>
          <CardHeader>
            <CardTitle>Under-Utilized Team Members (Bottom 5)</CardTitle>
          </CardHeader>
          <CardContent>
            {userActivityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={userActivityData
                    .sort((a, b) => a.count - b.count)
                    .slice(0, 5)}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="count"
                    fill="#B77466"
                    name="Activity Count"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No user data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Best Completion Rates Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Team Member Completion Rates</CardTitle>
          <p className="text-sm text-muted-foreground">Who has the best activity completion percentage</p>
        </CardHeader>
        <CardContent>
          {userCompletionData.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={userCompletionData.slice(0, 8)}
                  layout="vertical"
                  margin={{ left: 150, right: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category"
                    width={140}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => `${value}%`}
                    labelFormatter={() => "Completion Rate"}
                  />
                  <Bar
                    dataKey="completionRate"
                    fill="#10b981"
                    name="Completion %"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {userCompletionData.slice(0, 6).map((item) => (
                  <div key={item.name} className="p-2 bg-green-50 rounded">
                    <p className="font-medium text-green-900">{item.name}</p>
                    <p className="text-green-600">{item.completed}/{item.total} completed ({item.completionRate}%)</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No completion data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
