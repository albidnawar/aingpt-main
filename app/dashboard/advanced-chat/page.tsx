"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AdvancedChatInterface } from "@/components/advanced-chat-interface"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Sparkles, Users, Eye } from "lucide-react"

export default function AdvancedChatPage() {
  const [currentCase, setCurrentCase] = useState("case-1")
  const [viewMode, setViewMode] = useState<"user" | "lawyer">("user")
  const [uploadedFiles, setUploadedFiles] = useState(3)
  const [ocrConfidence, setOcrConfidence] = useState(92)
  const [citationsCount, setCitationsCount] = useState(15)

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col space-y-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-accent" />
                Advanced Chat
              </h1>
              <p className="text-muted-foreground">Document analysis and legal insights</p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="view-mode" className="text-sm">
                View:
              </Label>
              <Select value={viewMode} onValueChange={(value: "user" | "lawyer") => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User View</SelectItem>
                  <SelectItem value="lawyer">Lawyer View</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="outline" className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {uploadedFiles} files
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                OCR {ocrConfidence}%
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {citationsCount} citations
              </Badge>
            </div>
            <Select value={currentCase} onValueChange={setCurrentCase}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="case-1">Contract Review Case</SelectItem>
                <SelectItem value="case-2">Employment Dispute</SelectItem>
                <SelectItem value="case-3">Property Agreement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Chat Interface */}
        <div className="flex-1">
          <AdvancedChatInterface viewMode={viewMode} />
        </div>
      </div>
    </DashboardLayout>
  )
}
