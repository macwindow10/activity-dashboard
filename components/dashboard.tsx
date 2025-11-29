"use client"

import { useState, useEffect } from "react"
import type { IActivity } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
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

  // Calculate chart data - activities by creation date
  useEffect(() => {
    if (activities.length === 0) {
      setChartData([])
      setStatusData([])
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
  }, [activities])

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
                  stroke="#64748b"
                  strokeWidth={2}
                  dot={{ fill: "#64748b", r: 4 }}
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
                  fill="#64748b"
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
    </div>
  )
}
