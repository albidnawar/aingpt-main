"use client"

import { LawyerDashboardLayout } from "@/components/lawyer-dashboard-layout"
import { LawsSection } from "@/components/laws-section"
import { Card, CardContent } from "@/components/ui/card"
import { Scale, FileText, Calendar, Download } from "lucide-react"

export default function LawyerLawsPage() {
  return (
    <LawyerDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Scale className="h-8 w-8 text-accent" />
              Laws & Regulations
            </h1>
            <p className="text-muted-foreground">Access the latest laws, amendments, and legal documents</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Laws</p>
                  <p className="text-2xl font-bold">1,247</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">New This Month</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Amendments</p>
                  <p className="text-2xl font-bold">23</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Downloads</p>
                  <p className="text-2xl font-bold">45.2K</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Laws Content */}
        <LawsSection />
      </div>
    </LawyerDashboardLayout>
  )
}

