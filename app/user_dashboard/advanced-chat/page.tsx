"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChatInterface } from "@/components/chat-interface"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  Sparkles,
  FileText,
  Upload,
  X,
  Star,
  MapPin,
  MessageCircle,
  Plus,
  FolderOpen,
  Scale,
  Briefcase,
  User,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CaseFile {
  id: string
  caseNumber: string
  caseType: string
  thanaName: string
  caseName: string
  dharaNumber: string
  caseTitle: string
  registerDate: string
  description: string
  bpFormNo: string
  casePersons: string
  relationship: string
  documents: string[]
  views: number
  interested: boolean
  status: "active" | "closed" | "pending"
  createdDate: string
}

interface ChatCase {
  id: string
  caseNumber: string
  caseName: string
  caseTitle: string
}

interface DocumentFile {
  id: string
  name: string
  size: string
  type: string
  uploadedAt: Date
}

interface SuggestedLawyer {
  id: string
  name: string
  photo?: string
  lawyerType: "Civil" | "Criminal" | "Both"
  firmLocation: string
  rating: number
  reviewCount: number
  totalCasesHandled: number
  consultationFee: number
}

// Mock data for user's cases (from my-cases)
const mockUserCases: CaseFile[] = [
  {
    id: "1",
    caseNumber: "2024-001",
    caseType: "Civil",
    thanaName: "Gulshan Thana",
    caseName: "Property Dispute",
    dharaNumber: "5",
    caseTitle: "Land ownership dispute",
    registerDate: "2024-01-15",
    description: "Property boundary dispute with neighbor regarding 500 square feet of land",
    bpFormNo: "BP-2024-001",
    casePersons: "Ahmed Rahman vs Fatima Khan",
    relationship: "Property Owner",
    documents: ["deed.pdf", "survey_report.pdf"],
    views: 12,
    interested: true,
    status: "active",
    createdDate: "2024-01-15",
  },
  {
    id: "2",
    caseNumber: "2024-002",
    caseType: "Criminal",
    thanaName: "Mirpur Thana",
    caseName: "Assault Case",
    dharaNumber: "294",
    caseTitle: "Public assault incident",
    registerDate: "2024-02-01",
    description: "Assault case during neighborhood dispute",
    bpFormNo: "BP-2024-002",
    casePersons: "State vs Mohammad Hassan",
    relationship: "Victim",
    documents: ["fir.pdf", "medical_report.pdf", "witness_statement.pdf"],
    views: 5,
    interested: false,
    status: "pending",
    createdDate: "2024-02-01",
  },
  {
    id: "3",
    caseNumber: "2024-003",
    caseType: "Civil",
    thanaName: "Dhanmondi Thana",
    caseName: "Employment Dispute",
    dharaNumber: "10",
    caseTitle: "Contract violation",
    registerDate: "2024-02-10",
    description: "Employment contract dispute with employer",
    bpFormNo: "BP-2024-003",
    casePersons: "Employee vs Company",
    relationship: "Employee",
    documents: ["contract.pdf", "termination_letter.pdf"],
    views: 8,
    interested: false,
    status: "active",
    createdDate: "2024-02-10",
  },
]

const mockDocuments: DocumentFile[] = [
  {
    id: "1",
    name: "Employment_Contract.pdf",
    size: "2.4 MB",
    type: "pdf",
    uploadedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "NDA_Agreement.docx",
    size: "1.8 MB",
    type: "docx",
    uploadedAt: new Date("2024-01-14"),
  },
]

const mockSuggestedLawyers: SuggestedLawyer[] = [
  {
    id: "1",
    name: "Sarah Ahmed",
    lawyerType: "Civil",
    firmLocation: "Gulshan, Dhaka",
    rating: 4.8,
    reviewCount: 124,
    totalCasesHandled: 342,
    consultationFee: 5000,
  },
  {
    id: "2",
    name: "Mohammad Rahman",
    lawyerType: "Both",
    firmLocation: "Agrabad, Chittagong",
    rating: 4.6,
    reviewCount: 89,
    totalCasesHandled: 278,
    consultationFee: 4500,
  },
  {
    id: "3",
    name: "Fatima Khan",
    lawyerType: "Criminal",
    firmLocation: "Dhanmondi, Dhaka",
    rating: 4.9,
    reviewCount: 156,
    totalCasesHandled: 456,
    consultationFee: 6000,
  },
]

export default function AdvancedChatPage() {
  const router = useRouter()
  const [selectedCase, setSelectedCase] = useState<string | null>(null)
  const [openCases, setOpenCases] = useState<ChatCase[]>([])
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false)
  const [documents, setDocuments] = useState<DocumentFile[]>(mockDocuments)
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [isCasesDrawerOpen, setIsCasesDrawerOpen] = useState(false)
  const [isLawyersDrawerOpen, setIsLawyersDrawerOpen] = useState(false)

  const handleSelectCaseFromDialog = (caseFile: CaseFile) => {
    const chatCase: ChatCase = {
      id: caseFile.id,
      caseNumber: caseFile.caseNumber,
      caseName: caseFile.caseName,
      caseTitle: `${caseFile.caseTitle} - Case`,
    }
    
    // Check if case is already open
    if (!openCases.find((c) => c.id === caseFile.id)) {
      setOpenCases([...openCases, chatCase])
    }
    
    setSelectedCase(caseFile.id)
    setIsNewChatDialogOpen(false)
    setIsCasesDrawerOpen(false) // Close drawer on mobile after selection
  }

  const handleSelectCase = (caseId: string) => {
    setSelectedCase(caseId)
    setIsCasesDrawerOpen(false) // Close drawer on mobile after selection
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // Handle file upload logic here
      console.log("Files uploaded:", files)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    // Handle dropped files here
    console.log("Files dropped:", files)
  }

  const handleRemoveDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id))
    if (selectedDocument === id) {
      setSelectedDocument(null)
    }
  }

  const handleCloseCase = (caseId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenCases(openCases.filter((c) => c.id !== caseId))
    if (selectedCase === caseId) {
      setSelectedCase(null)
    }
  }

  const selectedCaseData = openCases.find((c) => c.id === selectedCase)

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4 flex-shrink-0 px-2 sm:px-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-foreground flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-accent flex-shrink-0" />
              <span className="truncate">Advanced Chat</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Document analysis and legal insights</p>
          </div>
          {/* Mobile: Action Buttons */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLawyersDrawerOpen(true)}
              className="h-9 px-3 text-xs"
            >
              <User className="h-3.5 w-3.5 mr-1.5" />
              Lawyers
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCasesDrawerOpen(true)}
              className="h-9 w-9 p-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row gap-2 sm:gap-4 min-h-0 overflow-hidden px-2 sm:px-0">
          {/* Left Column - Cases List (Desktop only) */}
          <Card className="hidden lg:flex w-56 flex-col flex-shrink-0 overflow-hidden h-auto">
            <CardHeader className="flex-shrink-0 pb-2 sm:pb-3 px-2 sm:px-4">
              <div className="flex items-center justify-between gap-1.5">
                <CardTitle className="text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 min-w-0">
                  <FolderOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-accent flex-shrink-0" />
                  <span className="truncate">Cases</span>
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setIsNewChatDialogOpen(true)}
                  className="h-6 sm:h-7 text-[10px] sm:text-xs px-1.5 sm:px-2 flex-shrink-0"
                >
                  <Plus className="h-2.5 w-2.5 sm:h-3 sm:w-3 sm:mr-1" />
                  <span className="hidden lg:inline">New Chat</span>
                  <span className="lg:hidden">New</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-1.5 sm:space-y-2 px-2 sm:px-3 py-1.5 sm:py-2">
              {openCases.length === 0 ? (
                <div className="text-center py-4 sm:py-8 text-muted-foreground">
                  <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1.5 sm:mb-2 opacity-50" />
                  <p className="text-xs sm:text-sm">No cases open</p>
                  <p className="text-[10px] sm:text-xs">Click "New Chat" to start</p>
                </div>
              ) : (
                openCases.map((caseItem) => (
                  <Card
                    key={caseItem.id}
                    className={cn(
                      "group cursor-pointer hover:shadow-md transition-all duration-200 border",
                      selectedCase === caseItem.id
                        ? "border-accent bg-accent/10 shadow-sm"
                        : "border-border hover:border-accent/50",
                    )}
                    onClick={() => handleSelectCase(caseItem.id)}
                  >
                    <CardContent className="p-2">
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-accent/10 flex items-center justify-center">
                            <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-accent" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <h3 className="font-semibold text-[11px] sm:text-xs text-foreground truncate leading-tight flex-1 min-w-0">
                              {caseItem.caseName}
                            </h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 sm:h-5 sm:w-5 p-0 flex-shrink-0 opacity-50 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all ml-1"
                              onClick={(e) => handleCloseCase(caseItem.id, e)}
                            >
                              <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            </Button>
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 mb-1 leading-relaxed">
                            {caseItem.caseTitle}
                          </p>
                          <Badge variant="outline" className="text-[10px] sm:text-xs font-normal">
                            #{caseItem.caseNumber}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* New Chat Dialog */}
          <Dialog open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto w-[95vw] sm:w-full">
              <DialogHeader>
                <DialogTitle>Select a case to open in chat</DialogTitle>
                <DialogDescription>Choose from your existing cases to start a new chat session</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                {mockUserCases.map((caseFile) => (
                  <Card
                    key={caseFile.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleSelectCaseFromDialog(caseFile)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-base">{caseFile.caseName}</h3>
                            <p className="text-sm text-muted-foreground">{caseFile.caseTitle}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            #{caseFile.caseNumber}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{caseFile.caseType}</span>
                          <span>•</span>
                          <span>{caseFile.thanaName}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Mobile: Cases Drawer */}
          <Sheet open={isCasesDrawerOpen} onOpenChange={setIsCasesDrawerOpen} side="right">
            <SheetContent onClose={() => setIsCasesDrawerOpen(false)} className="p-0">
              <div className="flex flex-col h-full">
                <div className="flex-shrink-0 pb-2 px-4 pt-4 border-b border-border">
                  <div className="flex items-center justify-between gap-1.5">
                    <h2 className="text-sm font-semibold flex items-center gap-1.5">
                      <FolderOpen className="h-3.5 w-3.5 text-accent" />
                      Cases
                    </h2>
                    <Button
                      size="sm"
                      onClick={() => setIsNewChatDialogOpen(true)}
                      className="h-7 text-xs px-2"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      New Chat
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 px-3 py-2">
                  {openCases.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No cases open</p>
                      <p className="text-xs">Click "New Chat" to start</p>
                    </div>
                  ) : (
                    openCases.map((caseItem) => (
                      <Card
                        key={caseItem.id}
                        className={cn(
                          "group cursor-pointer hover:shadow-md transition-all duration-200 border",
                          selectedCase === caseItem.id
                            ? "border-accent bg-accent/10 shadow-sm"
                            : "border-border hover:border-accent/50",
                        )}
                        onClick={() => handleSelectCase(caseItem.id)}
                      >
                        <CardContent className="p-2">
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-7 h-7 rounded-md bg-accent/10 flex items-center justify-center">
                                <FileText className="h-3.5 w-3.5 text-accent" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 pr-1">
                              <div className="flex items-start justify-between gap-1 mb-1">
                                <h3 className="font-semibold text-xs text-foreground truncate leading-tight flex-1 min-w-0">
                                  {caseItem.caseName}
                                </h3>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 flex-shrink-0 opacity-50 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all ml-1"
                                  onClick={(e) => handleCloseCase(caseItem.id, e)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1 mb-1 leading-relaxed">
                                {caseItem.caseTitle}
                              </p>
                              <Badge variant="outline" className="text-xs font-normal">
                                #{caseItem.caseNumber}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Mobile: Lawyers Drawer */}
          <Sheet open={isLawyersDrawerOpen} onOpenChange={setIsLawyersDrawerOpen} side="right">
            <SheetContent onClose={() => setIsLawyersDrawerOpen(false)} className="p-0">
              <div className="flex flex-col h-full">
                <div className="flex-shrink-0 pb-2 px-4 pt-4 border-b border-border">
                  <h2 className="text-sm font-semibold flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-accent" />
                    Suggested Lawyers
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Based on your chat</p>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 px-4 py-4">
                  {mockSuggestedLawyers.map((lawyer) => (
                    <Card key={lawyer.id} className="p-3 hover:shadow-md transition-shadow">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Avatar className="w-10 h-10 flex-shrink-0">
                            <AvatarImage src={lawyer.photo} alt={lawyer.name} />
                            <AvatarFallback className="text-xs">
                              {lawyer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{lawyer.name}</h4>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              <span className="text-xs font-medium">{lawyer.rating}</span>
                              <span className="text-xs text-muted-foreground">({lawyer.reviewCount})</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1 text-xs">
                            <Scale className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">Type:</span>
                            <Badge variant="outline" className="text-xs font-normal px-1.5 py-0 h-5">
                              {lawyer.lawyerType}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1 text-xs">
                            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground truncate">{lawyer.firmLocation}</span>
                          </div>

                          <div className="flex items-center gap-1 text-xs">
                            <Briefcase className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">Total Cases:</span>
                            <span className="font-medium">{lawyer.totalCasesHandled}</span>
                          </div>

                          <div className="pt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs w-full"
                              onClick={() => {
                                router.push(`/user_dashboard/lawyers?lawyer=${lawyer.id}`)
                                setIsLawyersDrawerOpen(false)
                              }}
                            >
                              <User className="h-3 w-3 mr-1.5" />
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Middle Column - Chat Section */}
          <Card className="flex-1 flex flex-col min-w-0 h-[calc(100vh-20rem)] sm:h-[calc(100vh-20rem)] lg:h-auto p-1">
            <CardContent className="flex-1 flex flex-col p-0 min-h-0">
              {selectedCase ? (
                <ChatInterface onFileUpload={handleFileUpload} />
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground px-4">
                  <div className="text-center space-y-2">
                    <MessageCircle className="h-8 w-8 sm:h-12 sm:w-12 mx-auto opacity-50" />
                    <p className="text-xs sm:text-sm px-2">Please select a case from the left to start chatting</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Documents & Suggested Lawyers (Desktop only) */}
          <Card className="hidden lg:flex lg:w-64 lg:flex-col flex-shrink-0 overflow-hidden h-auto">
            <CardHeader className="flex-shrink-0 pb-2 sm:pb-3 px-2 sm:px-4">
              <CardTitle className="text-xs sm:text-sm flex items-center gap-1 sm:gap-1.5 min-w-0">
                <Upload className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-accent flex-shrink-0" />
                <span className="truncate">Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 px-2 sm:px-4 pr-2 sm:pr-4 pb-2 sm:pb-4">
              {/* Upload Section */}
              <div
                className="border-2 border-dashed border-border rounded-lg p-2 sm:p-3 text-center hover:border-accent/50 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mx-auto mb-1 sm:mb-1.5" />
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5">Drop files or click</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">PDF, DOCX, TXT (10MB)</p>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              {/* Documents List */}
              {documents.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Uploaded Documents</p>
                  {documents.map((doc) => (
                    <Card
                      key={doc.id}
                      className={cn(
                        "p-1.5 cursor-pointer transition-colors",
                        selectedDocument === doc.id ? "border-accent bg-accent/5" : "hover:bg-muted/50",
                      )}
                      onClick={() => setSelectedDocument(doc.id)}
                    >
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-accent flex-shrink-0" />
                        <div className="flex-1 min-w-0 pr-1">
                          <p className="text-[10px] sm:text-xs font-medium truncate">{doc.name}</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">{doc.size}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 sm:h-5 sm:w-5 p-0 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveDocument(doc.id)
                          }}
                        >
                          <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Suggested Lawyers */}
              <div className="space-y-1.5 pt-2 sm:pt-3 border-t">
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground">Suggested Lawyers Based on chat</p>
                <div className="space-y-1.5 sm:space-y-2">
                  {mockSuggestedLawyers.map((lawyer) => (
                    <Card key={lawyer.id} className="p-1.5 sm:p-2 hover:shadow-md transition-shadow">
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-start gap-1.5 sm:gap-2">
                          <Avatar className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0">
                            <AvatarImage src={lawyer.photo} alt={lawyer.name} />
                            <AvatarFallback className="text-[10px] sm:text-xs">
                              {lawyer.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-[11px] sm:text-xs truncate">{lawyer.name}</h4>
                            <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5">
                              <Star className="h-2 w-2 sm:h-2.5 sm:w-2.5 fill-yellow-500 text-yellow-500" />
                              <span className="text-[10px] sm:text-xs font-medium">{lawyer.rating}</span>
                              <span className="text-[10px] sm:text-xs text-muted-foreground">({lawyer.reviewCount})</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1 sm:space-y-1.5">
                          <div className="flex items-center gap-1 text-[10px] sm:text-xs">
                            <Scale className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">Type:</span>
                            <Badge variant="outline" className="text-[10px] sm:text-xs font-normal px-1 py-0 h-4">
                              {lawyer.lawyerType}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] sm:text-xs">
                            <MapPin className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground truncate">{lawyer.firmLocation}</span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] sm:text-xs">
                            <Briefcase className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-muted-foreground">Total Cases:</span>
                            <span className="font-medium">{lawyer.totalCasesHandled}</span>
                          </div>

                          <div className="pt-0.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[10px] sm:text-xs w-full px-2"
                              onClick={() => {
                                router.push(`/user_dashboard/lawyers?lawyer=${lawyer.id}`)
                              }}
                            >
                              <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
