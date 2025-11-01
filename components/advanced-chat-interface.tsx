"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ChatInterface } from "@/components/chat-interface"
import {
  Upload,
  FileText,
  Search,
  Download,
  Share,
  Pin,
  Copy,
  AlertTriangle,
  CheckCircle,
  Clock,
  Scale,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AdvancedChatInterfaceProps {
  viewMode: "user" | "lawyer"
}

interface DocumentFile {
  id: string
  name: string
  size: string
  pages: number
  type: string
  uploadedAt: Date
}

const mockDocuments: DocumentFile[] = [
  {
    id: "1",
    name: "Employment_Contract.pdf",
    size: "2.4 MB",
    pages: 12,
    type: "pdf",
    uploadedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "NDA_Agreement.docx",
    size: "1.8 MB",
    pages: 8,
    type: "docx",
    uploadedAt: new Date("2024-01-14"),
  },
  {
    id: "3",
    name: "Property_Deed.pdf",
    size: "3.2 MB",
    pages: 15,
    type: "pdf",
    uploadedAt: new Date("2024-01-13"),
  },
]

export function AdvancedChatInterface({ viewMode }: AdvancedChatInterfaceProps) {
  const [documents, setDocuments] = useState<DocumentFile[]>(mockDocuments)
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [chatSettings, setChatSettings] = useState({
    answerFromFiles: true,
    useLawKnowledge: false,
    piiRedaction: true,
    ocrEnabled: true,
  })

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // Handle file upload logic here
      console.log("Files uploaded:", files)
    }
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
  }, [])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    // Handle dropped files here
    console.log("Files dropped:", files)
  }, [])

  if (viewMode === "user") {
    return (
      <div className="h-[calc(100vh-8rem)] flex gap-4">
        {/* Left Column - Documents Section */}
        <Card className="w-80 flex flex-col">
          <CardHeader className="flex-shrink-0 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4 text-accent" />
              Documents
            </CardTitle>
            <CardDescription className="text-xs">Upload and manage files</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-3">
            <div
              className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-accent/50 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-1">Drop files or click</p>
              <p className="text-xs text-muted-foreground">PDF, DOCX, TXT (10MB)</p>
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            <div className="space-y-2">
              {documents.map((doc) => (
                <Card
                  key={doc.id}
                  className={cn(
                    "p-2 cursor-pointer transition-colors",
                    selectedDocument === doc.id ? "border-accent bg-accent/5" : "hover:bg-muted/50",
                  )}
                  onClick={() => setSelectedDocument(doc.id)}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-accent flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.size} • {doc.pages}p
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Middle Column - Chat Section */}
        <Card className="flex-1 flex flex-col min-w-0">
          <CardHeader className="flex-shrink-0 pb-3">
            <CardTitle className="text-base">Ask Legal Question</CardTitle>
            <CardDescription className="text-xs">Chat with AI about your documents</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            <ChatInterface />
          </CardContent>
        </Card>

        {/* Right Column - Insights Section */}
        <Card className="w-80 flex flex-col">
          <CardHeader className="flex-shrink-0 pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-4 w-4 text-accent" />
              Insights
            </CardTitle>
            <CardDescription className="text-xs">Document analysis</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-3">
            <div className="flex flex-wrap gap-1">
              <Button size="sm" variant="outline" className="text-xs h-7 bg-transparent">
                Summarize
              </Button>
              <Button size="sm" variant="outline" className="text-xs h-7 bg-transparent">
                Explain
              </Button>
              <Button size="sm" variant="outline" className="text-xs h-7 bg-transparent">
                Key Info
              </Button>
            </div>

            <Card className="bg-muted/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-xs mb-1">Plain English</h4>
                  <p className="text-xs text-muted-foreground">
                    This employment contract establishes a full-time position with standard benefits and a 90-day
                    probationary period.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-xs mb-1">Key People & Dates</h4>
                  <div className="space-y-0.5 text-xs">
                    <p>• Employee: John Smith</p>
                    <p>• Start: Feb 1, 2024</p>
                    <p>• Probation End: May 1, 2024</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-xs mb-1">Potential Issues</h4>
                  <div className="space-y-1">
                    <Badge variant="destructive" className="text-xs">
                      High: Broad non-compete
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Medium: Unclear overtime
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="citations" className="w-full">
              <TabsList className="grid w-full grid-cols-3 text-xs h-8">
                <TabsTrigger value="citations" className="text-xs">
                  Citations
                </TabsTrigger>
                <TabsTrigger value="risks" className="text-xs">
                  Risks
                </TabsTrigger>
                <TabsTrigger value="clauses" className="text-xs">
                  Clauses
                </TabsTrigger>
              </TabsList>

              <TabsContent value="citations" className="space-y-2 mt-3">
                <div className="p-2 border rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <Scale className="h-3 w-3 text-accent" />
                    <span className="font-medium text-xs">Contract Act 1872</span>
                    <Badge variant="outline" className="text-xs ml-auto">
                      95%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Section 10 - Agreement validity</p>
                </div>
                <div className="p-2 border rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="h-3 w-3 text-accent" />
                    <span className="font-medium text-xs">Employment Law</span>
                    <Badge variant="outline" className="text-xs ml-auto">
                      88%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Non-compete regulations</p>
                </div>
              </TabsContent>

              <TabsContent value="risks" className="space-y-2 mt-3">
                <div className="p-2 border border-gray-200 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span className="font-medium text-xs text-gray-700">Medium Risk</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Termination notice period unclear</p>
                </div>
                <div className="p-2 border border-gray-300 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-3 w-3 text-gray-600" />
                    <span className="font-medium text-xs text-gray-800">Medium Risk</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Overly broad non-compete clause may be unenforceable</p>
                </div>
              </TabsContent>

              <TabsContent value="clauses" className="space-y-2 mt-3">
                <div className="p-2 border rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="font-medium text-xs">Suggested Addition</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Add force majeure clause</p>
                </div>
                <div className="p-2 border rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-3 w-3 text-gray-600" />
                    <span className="font-medium text-xs">Improvement</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Clarify IP ownership</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex-1 grid grid-cols-12 gap-6">
        <Card className="col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </CardTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search files..."
                className="flex-1 text-sm bg-transparent border-none outline-none"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {documents.map((doc) => (
                <Card
                  key={doc.id}
                  className={cn(
                    "p-2 cursor-pointer text-center",
                    selectedDocument === doc.id ? "border-accent bg-accent/5" : "hover:bg-muted/50",
                  )}
                  onClick={() => setSelectedDocument(doc.id)}
                >
                  <FileText className="h-6 w-6 text-accent mx-auto mb-1" />
                  <p className="text-xs font-medium truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.pages}p</p>
                </Card>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Label htmlFor="ocr-toggle" className="text-xs">
                OCR
              </Label>
              <Switch
                id="ocr-toggle"
                size="sm"
                checked={chatSettings.ocrEnabled}
                onCheckedChange={(checked) => setChatSettings({ ...chatSettings, ocrEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Legal Analysis Chat</CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Pin className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Switch
                  size="sm"
                  checked={chatSettings.answerFromFiles}
                  onCheckedChange={(checked) => setChatSettings({ ...chatSettings, answerFromFiles: checked })}
                />
                <Label>Answer from Files</Label>
              </div>
              <div className="flex items-center gap-1">
                <Switch
                  size="sm"
                  checked={chatSettings.useLawKnowledge}
                  onCheckedChange={(checked) => setChatSettings({ ...chatSettings, useLawKnowledge: checked })}
                />
                <Label>Use Law Knowledge Base</Label>
              </div>
              <div className="flex items-center gap-1">
                <Switch
                  size="sm"
                  checked={chatSettings.piiRedaction}
                  onCheckedChange={(checked) => setChatSettings({ ...chatSettings, piiRedaction: checked })}
                />
                <Label>PII Redaction</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <ChatInterface />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detailed Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="citations" className="w-full">
              <TabsList className="grid w-full grid-cols-3 text-xs h-8">
                <TabsTrigger value="citations" className="text-xs">
                  Citations
                </TabsTrigger>
                <TabsTrigger value="risks" className="text-xs">
                  Risks
                </TabsTrigger>
                <TabsTrigger value="clauses" className="text-xs">
                  Clauses
                </TabsTrigger>
              </TabsList>

              <TabsContent value="citations" className="space-y-3 mt-4">
                <div className="space-y-2">
                  <div className="p-2 border rounded text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <Scale className="h-3 w-3 text-accent" />
                      <span className="font-medium">Contract Act 1872</span>
                      <Badge variant="outline" className="text-xs">
                        95%
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">Section 10 - Agreement validity</p>
                  </div>
                  <div className="p-2 border rounded text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="h-3 w-3 text-accent" />
                      <span className="font-medium">Employment Law</span>
                      <Badge variant="outline" className="text-xs">
                        88%
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">Non-compete regulations</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="risks" className="space-y-3 mt-4">
                <div className="space-y-2">
                  <div className="p-2 border border-red-200 rounded text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                      <span className="font-medium text-red-700">High Risk</span>
                    </div>
                    <p className="text-muted-foreground">Overly broad non-compete clause may be unenforceable</p>
                  </div>
                  <div className="p-2 border border-gray-300 rounded text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-3 w-3 text-gray-600" />
                      <span className="font-medium text-gray-800">Medium Risk</span>
                    </div>
                    <p className="text-muted-foreground">Termination notice period unclear</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="clauses" className="space-y-3 mt-4">
                <div className="space-y-2">
                  <div className="p-2 border rounded text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="font-medium">Suggested Addition</span>
                    </div>
                    <p className="text-muted-foreground">Add force majeure clause for unforeseen circumstances</p>
                  </div>
                  <div className="p-2 border rounded text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-3 w-3 text-gray-600" />
                      <span className="font-medium">Improvement</span>
                    </div>
                    <p className="text-muted-foreground">Clarify intellectual property ownership</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 space-y-2">
              <Button size="sm" variant="outline" className="w-full text-xs bg-transparent">
                <Download className="h-3 w-3 mr-1" />
                Export PDF
              </Button>
              <Button size="sm" variant="outline" className="w-full text-xs bg-transparent">
                <Share className="h-3 w-3 mr-1" />
                Share Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
