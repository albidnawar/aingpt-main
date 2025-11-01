"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ChatInterface } from "@/components/chat-interface"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome to AinGPT</h1>
            <p className="text-muted-foreground">Your AI-powered legal assistant</p>
          </div>
          <Badge variant="secondary" className="bg-accent/10 text-accent">
            Free Plan
          </Badge>
        </div>

        {/* Main Chat Interface */}
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Free AI Legal Chat
            </CardTitle>
            <CardDescription>
              Ask legal questions and get AI-powered guidance. Remember, this is for informational purposes only.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <ChatInterface showUpgradePrompt={true} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
