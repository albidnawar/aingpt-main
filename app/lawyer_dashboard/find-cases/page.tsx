"use client"

import { useState, useEffect } from "react"
import { LawyerDashboardLayout } from "@/components/lawyer-dashboard-layout"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  FileText,
  Search,
  Filter,
  Eye,
  Download,
  CheckCircle,
  Coins,
  MapPin,
  Calendar,
  Users,
  Scale,
  SortAsc,
} from "lucide-react"

interface AvailableCase {
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
  interestedLawyers: number
  status: "active" | "closed" | "pending"
  createdDate: string
  postedBy: string
  userId?: number
}


export default function FindCasesPage() {
  const [cases, setCases] = useState<AvailableCase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lawyerTokens, setLawyerTokens] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [caseTypeFilter, setCaseTypeFilter] = useState<string>("all")
  const [thanaFilter, setThanaFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [selectedCase, setSelectedCase] = useState<AvailableCase | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false)
  const [caseToAccept, setCaseToAccept] = useState<string | null>(null)

  // Fetch public cases from database
  useEffect(() => {
    const fetchPublicCases = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const supabase = createSupabaseBrowserClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user) {
          setError("Please log in to view cases")
          setIsLoading(false)
          return
        }

        // Get lawyer_id to fetch token balance
        const { data: lawyerData, error: lawyerError } = await supabase
          .from("lawyers")
          .select("id, token_balance")
          .eq("auth_user_id", session.user.id)
          .maybeSingle()

        if (lawyerError || !lawyerData) {
          console.error("Error fetching lawyer data:", lawyerError)
        } else {
          setLawyerTokens(lawyerData.token_balance || 0)
        }

        // Fetch all public cases with user information and documents
        const { data: casesData, error: casesError } = await supabase
          .from("cases")
          .select(`
            *,
            users (
              id,
              username,
              full_name,
              email
            ),
            case_documents (
              id,
              document_path
            ),
            case_lawyer_interests (
              id
            )
          `)
          .eq("is_public", true)
          .order("created_at", { ascending: false })

        if (casesError) {
          console.error("Error fetching cases:", casesError)
          setError("Failed to load cases")
          setIsLoading(false)
          return
        }

        if (casesData) {
          // Transform database cases to match AvailableCase interface
          const transformedCases: AvailableCase[] = casesData.map((c: any) => {
            // Extract document names from paths
            const documentNames = (c.case_documents || []).map((doc: any) => {
              const pathParts = doc.document_path.split('/')
              const fileName = pathParts[pathParts.length - 1]
              return fileName.replace(/^\d+-/, '') // Remove timestamp prefix
            })

            // Get user name for postedBy
            const userName = c.users?.full_name || c.users?.username || "Unknown User"

            // Count interested lawyers
            const interestedCount = c.case_lawyer_interests?.length || 0

            return {
              id: String(c.id),
              caseNumber: c.case_number || "",
              caseType: c.case_type || "",
              thanaName: c.thana_name || "",
              caseName: c.case_name_dhara || "",
              dharaNumber: c.dhara_number || "",
              caseTitle: c.case_title || "",
              registerDate: c.register_date || "",
              description: c.short_description || "",
              bpFormNo: c.bp_form_no || "",
              casePersons: c.case_persons || "",
              relationship: c.relationship || "",
              documents: documentNames,
              views: 0, // TODO: Calculate from case_views table if needed
              interestedLawyers: interestedCount,
              status: "active" as const,
              createdDate: c.created_at ? new Date(c.created_at).toISOString().split("T")[0] : "",
              postedBy: userName,
              userId: c.user_id,
            }
          })

          setCases(transformedCases)
        }
      } catch (err) {
        console.error("Error fetching public cases:", err)
        setError("Failed to load cases")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPublicCases()
  }, [])

  const TOKEN_COST_PER_CASE = 5

  const handleAcceptCase = (caseId: string) => {
    if (lawyerTokens >= TOKEN_COST_PER_CASE) {
      setCaseToAccept(caseId)
      setShowAcceptConfirm(true)
    }
  }

  const confirmAcceptCase = () => {
    if (caseToAccept && lawyerTokens >= TOKEN_COST_PER_CASE) {
      setLawyerTokens(lawyerTokens - TOKEN_COST_PER_CASE)
      setShowAcceptConfirm(false)
      setCaseToAccept(null)
      // Here you would typically send the acceptance to the backend
      // and the case would move to "My Cases" > "Pending Requests"
    }
  }

  const handleViewDetails = (caseItem: AvailableCase) => {
    setSelectedCase(caseItem)
    setIsDetailsOpen(true)
  }

  // Filter and search logic
  const filteredCases = cases
    .filter((caseItem) => {
      const matchesSearch =
        searchQuery === "" ||
        caseItem.caseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.thanaName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = caseTypeFilter === "all" || caseItem.caseType === caseTypeFilter
      const matchesThana = thanaFilter === "all" || caseItem.thanaName === thanaFilter

      return matchesSearch && matchesType && matchesThana
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
        case "oldest":
          return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime()
        case "views":
          return b.views - a.views
        case "interest":
          return b.interestedLawyers - a.interestedLawyers
        default:
          return 0
      }
    })

  const uniqueThanas = Array.from(new Set(cases.map((c) => c.thanaName))).sort()
  const uniqueCaseTypes = Array.from(new Set(cases.map((c) => c.caseType))).sort()

  const stats = {
    total: cases.length,
    available: filteredCases.length,
    highInterest: cases.filter((c) => c.interestedLawyers >= 5).length,
    recent: cases.filter(
      (c) => new Date(c.createdDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    ).length,
  }

  return (
    <LawyerDashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading cases...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {!isLoading && error && cases.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && (
          <>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Search className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
              <span className="break-words">Find Cases</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              Browse and accept cases posted by users
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cases by title, description, case number, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-sm sm:text-base"
                />
              </div>

              {/* Filter Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select value={caseTypeFilter} onValueChange={setCaseTypeFilter}>
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Case Type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Case Types</SelectItem>
                    {uniqueCaseTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={thanaFilter} onValueChange={setThanaFilter}>
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <SelectValue placeholder="Thana/Location" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueThanas.map((thana) => (
                      <SelectItem key={thana} value={thana}>
                        {thana}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2">
                      <SortAsc className="h-4 w-4" />
                      <SelectValue placeholder="Sort By" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="views">Most Viewed</SelectItem>
                    <SelectItem value="interest">Most Interested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCases.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No cases found</h3>
                  <p className="text-muted-foreground text-sm">
                    Try adjusting your search or filter criteria
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredCases.map((caseItem) => (
              <Card key={caseItem.id} className="hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-1">
                        {caseItem.caseTitle}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {caseItem.caseType}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            caseItem.interestedLawyers >= 5 ? "bg-yellow-100 text-yellow-800" : ""
                          }`}
                        >
                          <Users className="h-3 w-3 mr-1" />
                          {caseItem.interestedLawyers}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>#{caseItem.caseNumber}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {caseItem.thanaName}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col space-y-3">
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 flex-1">
                    {caseItem.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {caseItem.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {caseItem.documents.length} docs
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(caseItem.createdDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(caseItem)}
                      className="flex-1 text-xs sm:text-sm"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">Details</span>
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-accent hover:bg-accent/90 text-xs sm:text-sm"
                      onClick={() => handleAcceptCase(caseItem.id)}
                      disabled={lawyerTokens < TOKEN_COST_PER_CASE}
                    >
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Accept ({TOKEN_COST_PER_CASE} tokens)</span>
                      <span className="sm:hidden">Accept</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Case Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Case Details</DialogTitle>
              <DialogDescription className="text-sm">
                Complete information about the available case
              </DialogDescription>
            </DialogHeader>
            {selectedCase && (
              <div className="space-y-4 sm:space-y-6">
                {/* Case Information */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm sm:text-base flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Case Information
                  </h3>
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
                    <div>
                      <p className="text-muted-foreground">Posted By</p>
                      <p className="font-medium">{selectedCase.postedBy}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Relationship</p>
                      <p className="font-medium">{selectedCase.relationship}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-muted-foreground mb-2">Description</p>
                    <p className="text-xs sm:text-sm">{selectedCase.description}</p>
                  </div>
                </div>

                {/* Statistics */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 text-sm sm:text-base">Case Statistics</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Views</p>
                      <p className="text-lg sm:text-xl font-bold">{selectedCase.views}</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Interested</p>
                      <p className="text-lg sm:text-xl font-bold">{selectedCase.interestedLawyers}</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Documents</p>
                      <p className="text-lg sm:text-xl font-bold">{selectedCase.documents.length}</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <Badge
                        variant={selectedCase.status === "active" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {selectedCase.status}
                      </Badge>
                    </div>
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
                  <Button
                    className="bg-accent hover:bg-accent/90 w-full sm:w-auto"
                    onClick={() => {
                      setIsDetailsOpen(false)
                      handleAcceptCase(selectedCase.id)
                    }}
                    disabled={lawyerTokens < TOKEN_COST_PER_CASE}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Case ({TOKEN_COST_PER_CASE} tokens)
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Accept Confirmation Dialog */}
        <Dialog open={showAcceptConfirm} onOpenChange={setShowAcceptConfirm}>
          <DialogContent className="w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Accept Case?</DialogTitle>
              <DialogDescription>
                Accepting this case will cost you {TOKEN_COST_PER_CASE} tokens. You currently have{" "}
                {lawyerTokens} tokens available.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-4">
              <Button variant="outline" onClick={() => setShowAcceptConfirm(false)}>
                Cancel
              </Button>
              <Button
                className="bg-accent hover:bg-accent/90"
                onClick={confirmAcceptCase}
                disabled={lawyerTokens < TOKEN_COST_PER_CASE}
              >
                <Coins className="h-4 w-4 mr-2" />
                Accept & Pay {TOKEN_COST_PER_CASE} Tokens
              </Button>
            </div>
          </DialogContent>
        </Dialog>
          </>
        )}
      </div>
    </LawyerDashboardLayout>
  )
}

