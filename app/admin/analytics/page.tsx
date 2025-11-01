"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const userGrowthData = [
  { month: "Jan", users: 400, newUsers: 50 },
  { month: "Feb", users: 520, newUsers: 120 },
  { month: "Mar", users: 680, newUsers: 160 },
  { month: "Apr", users: 890, newUsers: 210 },
  { month: "May", users: 1200, newUsers: 310 },
  { month: "Jun", users: 1450, newUsers: 250 },
]

const pageAnalytics = [
  { page: "Dashboard", views: 2400, avgTime: "3:45" },
  { page: "Lawyers", views: 1890, avgTime: "4:20" },
  { page: "Content", views: 1650, avgTime: "5:10" },
  { page: "Chat", views: 3200, avgTime: "8:30" },
  { page: "Profile", views: 1200, avgTime: "2:15" },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
        <p className="text-muted-foreground mt-2">Platform usage and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Total users and new registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                <XAxis dataKey="month" stroke="hsl(var(--color-muted-foreground))" />
                <YAxis stroke="hsl(var(--color-muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--color-card))",
                    border: "1px solid hsl(var(--color-border))",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="hsl(var(--color-chart-1))" strokeWidth={2} />
                <Line type="monotone" dataKey="newUsers" stroke="hsl(var(--color-chart-2))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Page Analytics</CardTitle>
            <CardDescription>Top pages by views</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pageAnalytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                <XAxis dataKey="page" stroke="hsl(var(--color-muted-foreground))" />
                <YAxis stroke="hsl(var(--color-muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--color-card))",
                    border: "1px solid hsl(var(--color-border))",
                  }}
                />
                <Bar dataKey="views" fill="hsl(var(--color-chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Page Analytics</CardTitle>
          <CardDescription>Performance metrics for each page</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">Page</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Views</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Avg. Time</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Bounce Rate</th>
                </tr>
              </thead>
              <tbody>
                {pageAnalytics.map((page) => (
                  <tr key={page.page} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-foreground font-medium">{page.page}</td>
                    <td className="py-3 px-4 text-muted-foreground">{page.views}</td>
                    <td className="py-3 px-4 text-muted-foreground">{page.avgTime}</td>
                    <td className="py-3 px-4 text-muted-foreground">12%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
