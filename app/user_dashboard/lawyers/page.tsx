"use client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { LawyerDirectory } from "@/components/lawyer-directory"
import { Users } from "lucide-react"

export default function LawyersPage() {
  return (
    <DashboardLayout>
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

        {/* Lawyer Directory */}
        <LawyerDirectory />
      </div>
    </DashboardLayout>
  )
}
