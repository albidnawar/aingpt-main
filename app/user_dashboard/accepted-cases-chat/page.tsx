"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { CaseChatView } from "@/components/case-chat-view"

export default function AcceptedCasesChatPage() {
  return (
    <DashboardLayout>
      <CaseChatView variant="user" />
    </DashboardLayout>
  )
}
