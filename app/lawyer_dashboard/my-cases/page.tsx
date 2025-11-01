"use client"

import { useState } from "react"
import { LawyerDashboardLayout } from "@/components/lawyer-dashboard-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileText, Eye, Download, MessageCircle, User, Calendar, Phone, Mail, Check, X, Clock } from "lucide-react"
import Link from "next/link"

interface PendingCaseRequest {
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
  documents: string[]
  requestedDate: string
  clientName: string
  clientPhone: string
  clientEmail: string
  proposedFee?: string
}

interface AcceptedCase {
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
  documents: string[]
  status: "accepted" | "in_progress" | "completed" | "on_hold"
  acceptedDate: string
  clientName: string
  clientPhone: string
  clientEmail: string
  consultationFee: string
  lastUpdated: string
}

const mockPendingRequests: PendingCaseRequest[] = [
  {
    id: "req-1",
    caseNumber: "2024-050",
    caseType: "Civil",
    thanaName: "Banani Thana",
    caseName: "Contract Dispute",
    dharaNumber: "10",
    caseTitle: "Breach of contract - Payment default",
    registerDate: "2024-02-20",
    description: "Client failed to make payment as per the contract terms. Seeking legal remedy for breach of contract.",
    bpFormNo: "BP-2024-050",
    casePersons: "ABC Company vs XYZ Traders",
    documents: ["contract.pdf", "payment_evidence.pdf"],
    requestedDate: "2024-02-22",
    clientName: "Karim Uddin",
    clientPhone: "+880 1987-654321",
    clientEmail: "karim.uddin@email.com",
    proposedFee: "৳4,000",
  },
  {
    id: "req-2",
    caseNumber: "2024-051",
    caseType: "Criminal",
    thanaName: "Uttara Thana",
    caseName: "Theft Case",
    dharaNumber: "379",
    caseTitle: "Theft of valuable items",
    registerDate: "2024-02-18",
    description: "Theft case involving valuable electronic items from residence. FIR has been filed.",
    bpFormNo: "BP-2024-051",
    casePersons: "State vs Unknown",
    documents: ["fir.pdf", "police_report.pdf", "evidence_photos.pdf"],
    requestedDate: "2024-02-21",
    clientName: "Rashida Khatun",
    clientPhone: "+880 1876-543210",
    clientEmail: "rashida.khatun@email.com",
    proposedFee: "৳5,000",
  },
  {
    id: "req-3",
    caseNumber: "2024-052",
    caseType: "Family",
    thanaName: "Wari Thana",
    caseName: "Child Custody",
    dharaNumber: "25",
    caseTitle: "Child custody dispute",
    registerDate: "2024-02-19",
    description: "Seeking custody of minor child. Divorce proceedings completed, now need legal assistance for custody.",
    bpFormNo: "BP-2024-052",
    casePersons: "Ayesha Begum vs Hasan Ahmed",
    documents: ["divorce_decree.pdf", "child_birth_certificate.pdf"],
    requestedDate: "2024-02-22",
    clientName: "Ayesha Begum",
    clientPhone: "+880 1765-432109",
    clientEmail: "ayesha.begum@email.com",
  },
]

const mockAcceptedCases: AcceptedCase[] = [
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
    documents: ["deed.pdf", "survey_report.pdf", "ownership_certificate.pdf"],
    status: "in_progress",
    acceptedDate: "2024-01-20",
    clientName: "Ahmed Rahman",
    clientPhone: "+880 1712-345678",
    clientEmail: "ahmed.rahman@email.com",
    consultationFee: "৳2,000",
    lastUpdated: "2024-02-10",
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
    description: "Assault case during neighborhood dispute. Victim sustained minor injuries.",
    bpFormNo: "BP-2024-002",
    casePersons: "State vs Mohammad Hassan",
    documents: ["fir.pdf", "medical_report.pdf", "witness_statement.pdf"],
    status: "accepted",
    acceptedDate: "2024-02-05",
    clientName: "Mohammad Hassan",
    clientPhone: "+880 1945-678901",
    clientEmail: "m.hassan@email.com",
    consultationFee: "৳3,500",
    lastUpdated: "2024-02-08",
  },
  {
    id: "3",
    caseNumber: "2024-015",
    caseType: "Family",
    thanaName: "Dhanmondi Thana",
    caseName: "Divorce Case",
    dharaNumber: "13",
    caseTitle: "Mutual divorce proceedings",
    registerDate: "2024-01-10",
    description: "Mutual consent divorce case. Both parties have agreed to terms.",
    bpFormNo: "BP-2024-015",
    casePersons: "Fatima Begum vs Karim Uddin",
    documents: ["marriage_certificate.pdf", "agreement.pdf"],
    status: "completed",
    acceptedDate: "2024-01-12",
    clientName: "Fatima Begum",
    clientPhone: "+880 1755-123456",
    clientEmail: "fatima.begum@email.com",
    consultationFee: "৳5,000",
    lastUpdated: "2024-02-15",
  },
]

export default function LawyerMyCasesPage() {
  const [pendingRequests, setPendingRequests] = useState<PendingCaseRequest[]>(mockPendingRequests)
  const [acceptedCases, setAcceptedCases] = useState<AcceptedCase[]>(mockAcceptedCases)
  const [selectedCase, setSelectedCase] = useState<PendingCaseRequest | AcceptedCase | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>("pending")

  const handleAcceptRequest = (requestId: string, consultationFee: string) => {
    const request = pendingRequests.find((r) => r.id === requestId)
    if (request) {
      const newAcceptedCase: AcceptedCase = {
        id: `accepted-${requestId}`,
        ...request,
        status: "accepted",
        acceptedDate: new Date().toISOString().split("T")[0],
        consultationFee: consultationFee || request.proposedFee || "৳0",
        lastUpdated: new Date().toISOString().split("T")[0],
      }
      setAcceptedCases([newAcceptedCase, ...acceptedCases])
      setPendingRequests(pendingRequests.filter((r) => r.id !== requestId))
      if (activeTab === "pending") {
        setActiveTab("accepted")
      }
    }
  }

  const handleRejectRequest = (requestId: string) => {
    setPendingRequests(pendingRequests.filter((r) => r.id !== requestId))
  }

  const handleStatusChange = (caseId: string, newStatus: AcceptedCase["status"]) => {
    setAcceptedCases(
      acceptedCases.map((c) =>
        c.id === caseId
          ? { ...c, status: newStatus, lastUpdated: new Date().toISOString().split("T")[0] }
          : c,
      ),
    )
  }

  const handleViewDetails = (caseItem: PendingCaseRequest | AcceptedCase) => {
    setSelectedCase(caseItem)
    setIsDetailsOpen(true)
  }

  const filteredAcceptedCases =
    statusFilter === "all"
      ? acceptedCases
      : acceptedCases.filter((c) => c.status === statusFilter)

  const stats = {
    pending: pendingRequests.length,
    total: acceptedCases.length,
    active: acceptedCases.filter((c) => c.status === "in_progress" || c.status === "accepted").length,
    completed: acceptedCases.filter((c) => c.status === "completed").length,
    onHold: acceptedCases.filter((c) => c.status === "on_hold").length,
  }

  const getStatusBadgeColor = (status: AcceptedCase["status"]) => {
    switch (status) {
      case "accepted":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "on_hold":
        return "bg-gray-100 text-gray-800"
      default:
        return ""
    }
  }

  const getStatusLabel = (status: AcceptedCase["status"]) => {
    switch (status) {
      case "accepted":
        return "Accepted"
      case "in_progress":
        return "In Progress"
      case "completed":
        return "Completed"
      case "on_hold":
        return "On Hold"
      default:
        return status
    }
  }

  return (
    <LawyerDashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
              <span className="break-words">My Cases</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              Manage case requests and your accepted cases
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === "accepted" && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cases</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-800 shrink-0">⚡</Badge>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Active</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 shrink-0">✓</Badge>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-100 text-gray-800 shrink-0">⏸</Badge>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">On Hold</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.onHold}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="text-xs sm:text-sm">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Pending Requests
              {stats.pending > 0 && (
                <Badge className="ml-2 bg-accent text-accent-foreground text-xs">
                  {stats.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="accepted" className="text-xs sm:text-sm">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Accepted Cases
            </TabsTrigger>
          </TabsList>

          {/* Pending Requests Tab */}
          <TabsContent value="pending" className="space-y-4">
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No pending requests</h3>
                  <p className="text-muted-foreground text-sm">
                    You don't have any pending case requests at the moment
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-yellow-500">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base sm:text-lg break-words">
                            {request.caseTitle}
                          </h3>
                          <Badge className="bg-yellow-100 text-yellow-800 shrink-0">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          <span>Case #: {request.caseNumber}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="break-words">Client: {request.clientName}</span>
                          {request.proposedFee && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="text-accent font-medium">
                                Proposed: {request.proposedFee}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <p className="text-xs sm:text-sm text-muted-foreground">Requested on</p>
                        <p className="font-medium text-xs sm:text-sm">{request.requestedDate}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 text-xs sm:text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Case Type</p>
                        <p className="font-medium">{request.caseType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Thana</p>
                        <p className="font-medium break-words">{request.thanaName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Documents</p>
                        <p className="font-medium">{request.documents.length} files</p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {request.description}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
                      <div className="flex gap-2 flex-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(request)}
                          className="flex-1 sm:flex-initial text-xs sm:text-sm"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">Details</span>
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 sm:flex-initial text-xs sm:text-sm">
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Documents</span>
                          <span className="sm:hidden">Docs</span>
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200 text-xs sm:text-sm"
                          onClick={() => handleRejectRequest(request.id)}
                        >
                          <X className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Reject</span>
                          <span className="sm:hidden">Reject</span>
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-accent hover:bg-accent/90 text-xs sm:text-sm"
                          onClick={() => handleAcceptRequest(request.id, request.proposedFee || "৳0")}
                        >
                          <Check className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Accept</span>
                          <span className="sm:hidden">Accept</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Accepted Cases Tab */}
          <TabsContent value="accepted" className="space-y-4">
            {filteredAcceptedCases.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No cases found</h3>
                  <p className="text-muted-foreground text-sm">
                    {statusFilter === "all"
                      ? "You haven't accepted any cases yet"
                      : `No ${getStatusLabel(statusFilter as AcceptedCase["status"])} cases found`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredAcceptedCases.map((caseItem) => (
                <Card key={caseItem.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base sm:text-lg break-words">
                            {caseItem.caseTitle}
                          </h3>
                          <Badge className={`${getStatusBadgeColor(caseItem.status)} shrink-0`}>
                            {getStatusLabel(caseItem.status)}
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          <span>Case #: {caseItem.caseNumber}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="break-words">Client: {caseItem.clientName}</span>
                        </div>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <p className="text-xs sm:text-sm text-muted-foreground">Accepted on</p>
                        <p className="font-medium text-xs sm:text-sm">{caseItem.acceptedDate}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 text-xs sm:text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Case Type</p>
                        <p className="font-medium">{caseItem.caseType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Thana</p>
                        <p className="font-medium break-words">{caseItem.thanaName}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Consultation Fee</p>
                        <p className="font-medium text-accent">{caseItem.consultationFee}</p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {caseItem.description}
                    </p>

                    <div className="flex flex-col gap-3 pt-2 border-t border-border">
                      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Updated: {caseItem.lastUpdated}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span>{caseItem.documents.length} docs</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex flex-wrap gap-2 flex-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(caseItem)}
                            className="flex-1 sm:flex-initial text-xs sm:text-sm"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">Details</span>
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 sm:flex-initial text-xs sm:text-sm">
                            <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Documents</span>
                            <span className="sm:hidden">Docs</span>
                          </Button>
                          <Link
                            href={`/lawyer_dashboard/accepted-cases-chat?case=${caseItem.id}`}
                            className="flex-1 sm:flex-initial"
                          >
                            <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
                              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                              Chat
                            </Button>
                          </Link>
                        </div>
                        <Select
                          value={caseItem.status}
                          onValueChange={(value: AcceptedCase["status"]) =>
                            handleStatusChange(caseItem.id, value)
                          }
                        >
                          <SelectTrigger className="w-full sm:w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="on_hold">On Hold</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Case Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Case Details</DialogTitle>
              <DialogDescription className="text-sm">
                {selectedCase && "status" in selectedCase
                  ? "Complete information about the accepted case"
                  : "Case information requested by client"}
              </DialogDescription>
            </DialogHeader>
            {selectedCase && (
              <div className="space-y-4 sm:space-y-6">
                {/* Case Information */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm sm:text-base">Case Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <p className="text-muted-foreground">Case Number</p>
                      <p className="font-medium">{selectedCase.caseNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Case Title</p>
                      <p className="font-medium">{selectedCase.caseTitle}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Case Type</p>
                      <p className="font-medium">{selectedCase.caseType}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Thana Name</p>
                      <p className="font-medium">{selectedCase.thanaName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dhara Number</p>
                      <p className="font-medium">{selectedCase.dharaNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">BP Form No.</p>
                      <p className="font-medium">{selectedCase.bpFormNo}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Register Date</p>
                      <p className="font-medium">{selectedCase.registerDate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Case Persons</p>
                      <p className="font-medium">{selectedCase.casePersons}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-muted-foreground mb-2">Description</p>
                    <p className="text-xs sm:text-sm">{selectedCase.description}</p>
                  </div>
                </div>

                {/* Client Information */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <User className="h-4 w-4" />
                    Client Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <p className="text-muted-foreground">Client Name</p>
                      <p className="font-medium">
                        {"clientName" in selectedCase
                          ? selectedCase.clientName
                          : selectedCase.clientName}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{selectedCase.clientPhone}</p>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Phone className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{selectedCase.clientEmail}</p>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Mail className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {"status" in selectedCase ? (
                      <div>
                        <p className="text-muted-foreground">Consultation Fee</p>
                        <p className="font-medium text-accent">{selectedCase.consultationFee}</p>
                      </div>
                    ) : (
                      selectedCase.proposedFee && (
                        <div>
                          <p className="text-muted-foreground">Proposed Fee</p>
                          <p className="font-medium text-accent">{selectedCase.proposedFee}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Documents */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 text-sm sm:text-base">Documents</h3>
                  <div className="space-y-2">
                    {selectedCase.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-muted rounded-lg gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-xs sm:text-sm truncate">{doc}</span>
                        </div>
                        <Button size="sm" variant="ghost" className="shrink-0">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t pt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailsOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Close
                  </Button>
                  {"status" in selectedCase ? (
                    <Link
                      href={`/lawyer_dashboard/accepted-cases-chat?case=${selectedCase.id}`}
                      className="w-full sm:w-auto"
                    >
                      <Button className="bg-accent hover:bg-accent/90 w-full sm:w-auto">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Chat with Client
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                        onClick={() => {
                          handleRejectRequest(selectedCase.id)
                          setIsDetailsOpen(false)
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject Request
                      </Button>
                      <Button
                        className="bg-accent hover:bg-accent/90 w-full sm:w-auto"
                        onClick={() => {
                          handleAcceptRequest(selectedCase.id, selectedCase.proposedFee || "৳0")
                          setIsDetailsOpen(false)
                        }}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Accept Case
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </LawyerDashboardLayout>
  )
}
