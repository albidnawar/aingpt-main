"use client"

import { useEffect, useMemo, useState } from "react"
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
import {
  FileText,
  Eye,
  Download,
  MessageCircle,
  User,
  Calendar,
  Phone,
  Mail,
  Check,
  X,
  Clock,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"

type CaseStatusOption = "accepted" | "in_progress" | "hold" | "completed"

const CASE_STATUS_OPTIONS: CaseStatusOption[] = ["accepted", "in_progress", "hold", "completed"]

const normalizeCaseStatus = (value?: string | null): CaseStatusOption => {
  if (!value) return "accepted"
  const normalized = value.toLowerCase()
  if (normalized === "hold" || normalized === "on_hold") {
    return "hold"
  }
  if (CASE_STATUS_OPTIONS.includes(normalized as CaseStatusOption)) {
    return normalized as CaseStatusOption
  }
  return "accepted"
}

interface CaseDocument {
  id: string
  name: string
  path?: string
}

interface PendingCaseRequest {
  id: string
  caseId?: string
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
  documents: CaseDocument[]
  requestedDate: string
  clientName: string
  clientPhone: string
  clientEmail: string
  proposedFee?: string
}

interface AcceptedCase {
  id: string
  caseId: string
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
  documents: CaseDocument[]
  status: CaseStatusOption
  acceptedDate: string
  clientName: string
  clientPhone: string
  clientEmail: string
  consultationFee: string
  lastUpdated: string
}

const createMockDocuments = (caseId: string, files: string[]): CaseDocument[] =>
  files.map((name, index) => ({
    id: `${caseId}-doc-${index + 1}`,
    name,
  }))

const mockPendingRequests: PendingCaseRequest[] = [
  {
    id: "req-1",
    caseId: "req-1",
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
    documents: createMockDocuments("req-1", ["contract.pdf", "payment_evidence.pdf"]),
    requestedDate: "2024-02-22",
    clientName: "Karim Uddin",
    clientPhone: "+880 1987-654321",
    clientEmail: "karim.uddin@email.com",
    proposedFee: "৳4,000",
  },
  {
    id: "req-2",
    caseId: "req-2",
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
    documents: createMockDocuments("req-2", ["fir.pdf", "police_report.pdf", "evidence_photos.pdf"]),
    requestedDate: "2024-02-21",
    clientName: "Rashida Khatun",
    clientPhone: "+880 1876-543210",
    clientEmail: "rashida.khatun@email.com",
    proposedFee: "৳5,000",
  },
  {
    id: "req-3",
    caseId: "req-3",
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
    documents: createMockDocuments("req-3", ["divorce_decree.pdf", "child_birth_certificate.pdf"]),
    requestedDate: "2024-02-22",
    clientName: "Ayesha Begum",
    clientPhone: "+880 1765-432109",
    clientEmail: "ayesha.begum@email.com",
  },
]

export default function LawyerMyCasesPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [pendingRequests, setPendingRequests] = useState<PendingCaseRequest[]>(mockPendingRequests)
  const [acceptedCases, setAcceptedCases] = useState<AcceptedCase[]>([])
  const [isLoadingAccepted, setIsLoadingAccepted] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selectedCase, setSelectedCase] = useState<PendingCaseRequest | AcceptedCase | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>("pending")

  const formatISODate = (value?: string | null) => {
    if (!value) return "N/A"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return "N/A"
    }
    return date.toISOString().split("T")[0]
  }

  const getFileNameFromPath = (path?: string | null) => {
    if (!path) return "document"
    const parts = path.split("/")
    return parts[parts.length - 1].replace(/^\d+-/, "")
  }

  useEffect(() => {
    const loadAcceptedCases = async () => {
      try {
        setIsLoadingAccepted(true)
        setFetchError(null)
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session?.user) {
          setFetchError("Please log in to view accepted cases.")
          setAcceptedCases([])
          return
        }

        const { data: lawyerData, error: lawyerError } = await supabase
          .from("lawyers")
          .select("id")
          .eq("auth_user_id", session.user.id)
          .maybeSingle()

        if (lawyerError || !lawyerData) {
          setFetchError("Lawyer profile not found.")
          setAcceptedCases([])
          return
        }

        const { data, error } = await supabase
          .from("case_acceptances")
          .select(
            `
            id,
            status,
            accepted_at,
            case_id,
            cases (
              id,
              case_number,
              case_type,
              thana_name,
              case_name_dhara,
              dhara_number,
              case_title,
              register_date,
              bp_form_no,
              case_persons,
              relationship,
              short_description,
              created_at,
              users (
                id,
                full_name,
                username,
                email,
                phone
              ),
              case_documents (
                id,
                document_path
              )
            )
          `,
          )
          .eq("lawyer_id", lawyerData.id)
          .order("accepted_at", { ascending: false })

        if (error) {
          console.error("Error fetching accepted cases:", error)
          setFetchError("Failed to load accepted cases.")
          setAcceptedCases([])
          return
        }

        const transformedCases: AcceptedCase[] = (data || [])
          .map((record: any) => {
            if (!record.cases) {
              return null
            }
            const caseInfo = record.cases
            const documents: CaseDocument[] = (caseInfo.case_documents || []).map(
              (doc: any, index: number) => ({
                id: doc.id ? String(doc.id) : `${caseInfo.id}-doc-${index + 1}`,
                name: getFileNameFromPath(doc.document_path),
                path: doc.document_path,
              }),
            )
            const client = caseInfo.users
            const caseStatus = normalizeCaseStatus(caseInfo.status || record.status)
            return {
              id: String(record.id),
              caseId: String(caseInfo.id),
              caseNumber: caseInfo.case_number || "",
              caseType: caseInfo.case_type || "",
              thanaName: caseInfo.thana_name || "",
              caseName: caseInfo.case_name_dhara || "",
              dharaNumber: caseInfo.dhara_number || "",
              caseTitle: caseInfo.case_title || "",
              registerDate: caseInfo.register_date ? formatISODate(caseInfo.register_date) : "N/A",
              description: caseInfo.short_description || "",
              bpFormNo: caseInfo.bp_form_no || "",
              casePersons: caseInfo.case_persons || "",
              documents,
              status: caseStatus,
              acceptedDate: record.accepted_at ? formatISODate(record.accepted_at) : "N/A",
              clientName: client?.full_name || client?.username || "Client",
              clientPhone: client?.phone || "Not provided",
              clientEmail: client?.email || "Not provided",
              consultationFee: "৳0",
              lastUpdated: formatISODate(caseInfo.created_at || record.accepted_at),
            }
          })
          .filter(Boolean) as AcceptedCase[]

        setAcceptedCases(transformedCases)
      } catch (err) {
        console.error("Unexpected error fetching accepted cases:", err)
        setFetchError("Something went wrong while loading accepted cases.")
      } finally {
        setIsLoadingAccepted(false)
      }
    }

    loadAcceptedCases()
  }, [supabase])

  const downloadCaseDocument = async (caseId: string, docMeta: CaseDocument) => {
    if (!docMeta.path) {
      setFetchError("Document path is missing for this file.")
      return
    }

    try {
      const response = await fetch(
        `/api/cases/${caseId}/download?filePath=${encodeURIComponent(docMeta.path)}`,
      )

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to download document.")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const linkElement = document.createElement("a")
      linkElement.href = url
      linkElement.download = docMeta.name
      document.body.appendChild(linkElement)
      linkElement.click()
      linkElement.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error downloading document:", err)
      setFetchError(err instanceof Error ? err.message : "Failed to download document.")
    }
  }

  const handleDownloadAllDocuments = async (caseItem: AcceptedCase) => {
    if (caseItem.documents.length === 0) {
      setFetchError("No documents available for this case.")
      return
    }

    for (const docMeta of caseItem.documents) {
      if (docMeta.path) {
        await downloadCaseDocument(caseItem.caseId, docMeta)
      }
    }
  }

  const handleAcceptRequest = (requestId: string, consultationFee: string) => {
    const request = pendingRequests.find((r) => r.id === requestId)
    if (request) {
      const today = new Date().toISOString().split("T")[0]
      const newAcceptedCase: AcceptedCase = {
        id: `accepted-${requestId}`,
        caseId: request.caseId || request.id,
        caseNumber: request.caseNumber,
        caseType: request.caseType,
        thanaName: request.thanaName,
        caseName: request.caseName,
        dharaNumber: request.dharaNumber,
        caseTitle: request.caseTitle,
        registerDate: request.registerDate,
        description: request.description,
        bpFormNo: request.bpFormNo,
        casePersons: request.casePersons,
        documents: request.documents,
        status: "accepted",
        acceptedDate: today,
        clientName: request.clientName,
        clientPhone: request.clientPhone,
        clientEmail: request.clientEmail,
        consultationFee: consultationFee || request.proposedFee || "৳0",
        lastUpdated: today,
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

  const handleStatusChange = async (caseItem: AcceptedCase, newStatus: CaseStatusOption) => {
    const previousCases = acceptedCases
    const now = new Date().toISOString()
    setAcceptedCases(
      acceptedCases.map((c) =>
        c.caseId === caseItem.caseId ? { ...c, status: newStatus, lastUpdated: formatISODate(now) } : c,
      ),
    )

    try {
      setFetchError(null)
      const response = await fetch(`/api/lawyer/cases/${caseItem.caseId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to update case status.")
      }
    } catch (err) {
      console.error("Failed to update case status:", err)
      setFetchError(err instanceof Error ? err.message : "Failed to update case status. Please try again.")
      setAcceptedCases(previousCases)
    }
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
    onHold: acceptedCases.filter((c) => c.status === "hold").length,
  }

  const getStatusBadgeColor = (status: AcceptedCase["status"]) => {
    switch (status) {
      case "accepted":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "hold":
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
      case "hold":
        return "Hold"
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
                  <SelectItem value="hold">Hold</SelectItem>
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

        {fetchError && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {fetchError}
          </div>
        )}

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
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 sm:flex-initial text-xs sm:text-sm"
                          disabled
                          title="Documents can be downloaded after accepting the case"
                        >
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
            {isLoadingAccepted ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading accepted cases...</p>
                </CardContent>
              </Card>
            ) : filteredAcceptedCases.length === 0 ? (
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
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 sm:flex-initial text-xs sm:text-sm"
                            onClick={() => handleDownloadAllDocuments(caseItem)}
                            disabled={caseItem.documents.length === 0}
                          >
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
                          onValueChange={(value: CaseStatusOption) => handleStatusChange(caseItem, value)}
                        >
                          <SelectTrigger className="w-full sm:w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CASE_STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {getStatusLabel(option)}
                              </SelectItem>
                            ))}
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
                      <p className="font-medium">{selectedCase.clientName}</p>
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
                        key={doc.id || idx}
                        className="flex items-center justify-between p-2 bg-muted rounded-lg gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-xs sm:text-sm truncate">{doc.name}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="shrink-0"
                          disabled={!("status" in selectedCase) || !doc.path}
                          onClick={() => {
                            if ("status" in selectedCase && doc.path) {
                              downloadCaseDocument(selectedCase.caseId, doc)
                            }
                          }}
                        >
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
