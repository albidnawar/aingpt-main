"use client"

import { CaseChatView } from "@/components/case-chat-view"
import { LawyerDashboardLayout } from "@/components/lawyer-dashboard-layout"

export default function LawyerAcceptedCasesChatPage() {
  return (
    <LawyerDashboardLayout>
      <CaseChatView variant="lawyer" />
    </LawyerDashboardLayout>
  )
}

