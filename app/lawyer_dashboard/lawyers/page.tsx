"use client"
import { LawyerDashboardLayout } from "@/components/lawyer-dashboard-layout"
import { LawyerDirectory } from "@/components/lawyer-directory"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Search, Filter, MapPin } from "lucide-react"

export default function LawyerLawyersPage() {
  return (
    <LawyerDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-8 w-8 text-accent" />
              Lawyer Directory
            </h1>
            <p className="text-muted-foreground">Find and connect with qualified legal professionals</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Lawyers</p>
                  <p className="text-2xl font-bold">1,247</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Practice Areas</p>
                  <p className="text-2xl font-bold">15</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Cities Covered</p>
                  <p className="text-2xl font-bold">64</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Available Now</p>
                  <p className="text-2xl font-bold">342</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lawyer Directory */}
        <LawyerDirectory />
      </div>
    </LawyerDashboardLayout>
  )
}

