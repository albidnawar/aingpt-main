"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileText, Plus, Eye, Trash2, Download, Users, Upload, X, Loader2, Lock, Globe } from "lucide-react"
import { Switch } from "@/components/ui/switch"

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
  documents: string[] | any[]
  views: number
  interested: boolean
  status: "active" | "closed" | "pending"
  createdDate: string
  filesData?: any[] // Full file metadata from database
  isPublic?: boolean // Public/private status
}

const mockCases: CaseFile[] = [
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
]

export default function MyCasesPage() {
  const [cases, setCases] = useState<CaseFile[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [selectedCase, setSelectedCase] = useState<CaseFile | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [formData, setFormData] = useState({
    caseNumber: "",
    caseType: "",
    thanaName: "",
    caseName: "",
    dharaNumber: "",
    caseTitle: "",
    registerDate: "",
    description: "",
    bpFormNo: "",
    casePersons: "",
    relationship: "",
  })

  // Fetch cases from database
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const supabase = createSupabaseBrowserClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user) {
          setError("Please log in to view your cases")
          setIsLoading(false)
          return
        }

        // Get user_id from users table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("auth_user_id", session.user.id)
          .maybeSingle()

        if (userError || !userData) {
          setError("User not found")
          setIsLoading(false)
          return
        }

        // Fetch cases for this user with their documents
        const { data: casesData, error: casesError } = await supabase
          .from("cases")
          .select(`
            *,
            case_documents (
              id,
              document_path
            )
          `)
          .eq("user_id", userData.id)
          .order("created_at", { ascending: false })

        if (casesError) {
          setError("Failed to load cases")
          console.error(casesError)
        } else {
          // Transform database cases to match CaseFile interface
          const transformedCases: CaseFile[] = (casesData || []).map((c: any) => {
            // Extract file paths from case_documents
            const documentPaths = (c.case_documents || []).map((doc: any) => doc.document_path)
            // Extract just filenames for display
            const documentNames = documentPaths.map((path: string) => {
              const parts = path.split('/')
              const fileName = parts[parts.length - 1]
              // Remove timestamp prefix if present
              return fileName.replace(/^\d+-/, '')
            })

            return {
              id: String(c.id),
              caseNumber: c.case_number,
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
              filesData: documentPaths, // Store full paths for download
              views: 0, // TODO: Calculate from case_views table
              interested: false, // TODO: Check from case_lawyer_interests table
              status: "active" as const, // TODO: Add status field to database
              createdDate: c.created_at ? new Date(c.created_at).toISOString().split("T")[0] : "",
              isPublic: c.is_public ?? false,
            }
          })
          setCases(transformedCases)
        }
      } catch (err) {
        console.error("Error fetching cases:", err)
        setError("Failed to load cases")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCases()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setUploadedFiles((prev) => [...prev, ...filesArray])
    }
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddCase = async () => {
    if (!formData.caseNumber || !formData.caseType) {
      setError("Case number and case type are required")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      let filesData: any[] = []

      // Upload files to Supabase Storage if any
      if (uploadedFiles.length > 0) {
        const uploadFormData = new FormData()
        uploadedFiles.forEach((file) => {
          uploadFormData.append("files", file)
        })

        const uploadResponse = await fetch("/api/cases/upload", {
          method: "POST",
          body: uploadFormData,
        })

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json()
          throw new Error(uploadError.error || "Failed to upload files")
        }

        const uploadData = await uploadResponse.json()
        filesData = uploadData.files || [] // Array of file paths
      }

      // File the case with file paths (stored in case_documents table)
      const response = await fetch("/api/cases/file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          files: filesData.length > 0 ? filesData : null,
          isPublic: isPublic,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to file case")
      }

      // Extract filenames from paths for display
      const documentNames = filesData.map((path: string) => {
        const parts = path.split('/')
        const fileName = parts[parts.length - 1]
        return fileName.replace(/^\d+-/, '') // Remove timestamp prefix
      })

      // Add the new case to the list
      const newCase: CaseFile = {
        id: String(data.case.id),
        caseNumber: data.case.case_number,
        caseType: data.case.case_type || "",
        thanaName: data.case.thana_name || "",
        caseName: data.case.case_name_dhara || "",
        dharaNumber: data.case.dhara_number || "",
        caseTitle: data.case.case_title || "",
        registerDate: data.case.register_date || "",
        description: data.case.short_description || "",
        bpFormNo: data.case.bp_form_no || "",
        casePersons: data.case.case_persons || "",
        relationship: data.case.relationship || "",
        documents: documentNames,
        filesData: filesData, // Store full paths for download
        views: 0,
        interested: false,
        status: "active",
        createdDate: data.case.created_at ? new Date(data.case.created_at).toISOString().split("T")[0] : "",
        isPublic: data.case.is_public ?? false,
      }

      setCases([newCase, ...cases])
      setFormData({
        caseNumber: "",
        caseType: "",
        thanaName: "",
        caseName: "",
        dharaNumber: "",
        caseTitle: "",
        registerDate: "",
        description: "",
        bpFormNo: "",
        casePersons: "",
        relationship: "",
      })
      setUploadedFiles([])
      setIsPublic(false)
      setIsFormOpen(false)
    } catch (err: any) {
      setError(err.message || "Failed to file case")
      console.error("Error filing case:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCase = (id: string) => {
    setCases(cases.filter((c) => c.id !== id))
  }

  const handleViewCase = (caseFile: CaseFile) => {
    setSelectedCase(caseFile)
    setIsViewModalOpen(true)
  }

  const handleDownloadFile = async (fileName: string, caseId: string) => {
    try {
      const response = await fetch(`/api/cases/${caseId}/download?fileName=${encodeURIComponent(fileName)}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to download file" }))
        throw new Error(errorData.error || "Failed to download file")
      }

      // Download the blob from Supabase Storage
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      console.error("Error downloading file:", err)
      setError(err.message || "Failed to download file")
    }
  }

  const handleTogglePublic = async (caseId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/cases/${caseId}/visibility`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublic: !currentStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to update case visibility" }))
        throw new Error(errorData.error || "Failed to update case visibility")
      }

      // Update the case in the local state
      setCases(
        cases.map((c) => (c.id === caseId ? { ...c, isPublic: !currentStatus } : c)),
      )
    } catch (err: any) {
      console.error("Error toggling case visibility:", err)
      setError(err.message || "Failed to update case visibility")
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-8 w-8 text-accent" />
              My Cases
            </h1>
            <p className="text-muted-foreground">Manage and track your legal cases</p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90">
                <Plus className="h-4 w-4 mr-2" />
                New Case (৳100)
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>File a New Case</DialogTitle>
                <DialogDescription>Fill out the case details. Filing cost: ৳100</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="case-number">Case Number</Label>
                    <Input
                      id="case-number"
                      placeholder="e.g., 2024-001"
                      value={formData.caseNumber}
                      onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="case-type">Case Type</Label>
                    <Select
                      value={formData.caseType}
                      onValueChange={(value) => setFormData({ ...formData, caseType: value })}
                    >
                      <SelectTrigger id="case-type">
                        <SelectValue placeholder="Select case type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Civil">Civil</SelectItem>
                        <SelectItem value="Criminal">Criminal</SelectItem>
                        <SelectItem value="Family">Family</SelectItem>
                        <SelectItem value="Property">Property</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thana-name">Thana Name</Label>
                    <Input
                      id="thana-name"
                      placeholder="e.g., Gulshan Thana"
                      value={formData.thanaName}
                      onChange={(e) => setFormData({ ...formData, thanaName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="case-name">Case Name & Dhara</Label>
                    <Input
                      id="case-name"
                      placeholder="e.g., Property Dispute"
                      value={formData.caseName}
                      onChange={(e) => setFormData({ ...formData, caseName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dhara-number">Dhara Number</Label>
                    <Input
                      id="dhara-number"
                      placeholder="e.g., 5"
                      value={formData.dharaNumber}
                      onChange={(e) => setFormData({ ...formData, dharaNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="case-title">Case Title</Label>
                    <Input
                      id="case-title"
                      placeholder="Brief case title"
                      value={formData.caseTitle}
                      onChange={(e) => setFormData({ ...formData, caseTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-date">Case Register Date</Label>
                    <Input
                      id="register-date"
                      type="date"
                      value={formData.registerDate}
                      onChange={(e) => setFormData({ ...formData, registerDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bp-form">BP Form No.</Label>
                    <Input
                      id="bp-form"
                      placeholder="e.g., BP-2024-001"
                      value={formData.bpFormNo}
                      onChange={(e) => setFormData({ ...formData, bpFormNo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="case-persons">Case Person: Who Vs Who</Label>
                    <Input
                      id="case-persons"
                      placeholder="e.g., Ahmed vs Fatima"
                      value={formData.casePersons}
                      onChange={(e) => setFormData({ ...formData, casePersons: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship with Case Person</Label>
                    <Input
                      id="relationship"
                      placeholder="e.g., Property Owner"
                      value={formData.relationship}
                      onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a brief description of your case..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Upload Documents (Optional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PDF, DOC, DOCX up to 10MB</p>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleRemoveFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    {isPublic ? (
                      <Globe className="h-5 w-5 text-green-600" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <Label className="text-sm font-medium cursor-pointer">
                        Make this case {isPublic ? "Public" : "Private"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {isPublic
                          ? "Case will be visible to lawyers"
                          : "Case will only be visible to you"}
                      </p>
                    </div>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsFormOpen(false)
                      setError(null)
                      setUploadedFiles([])
                      setIsPublic(false)
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-accent hover:bg-accent/90"
                    onClick={handleAddCase}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Filing...
                      </>
                    ) : (
                      "File Case (৳100)"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Cases</p>
                  <p className="text-2xl font-bold">{cases.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{cases.reduce((sum, c) => sum + c.views, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Interested</p>
                  <p className="text-2xl font-bold">{cases.filter((c) => c.interested).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">Active</Badge>
                <div>
                  <p className="text-sm text-muted-foreground">Active Cases</p>
                  <p className="text-2xl font-bold">{cases.filter((c) => c.status === "active").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading your cases...</p>
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

        {/* Cases List */}
        {!isLoading && (
          <div className="space-y-4">
            {cases.map((caseFile) => (
            <Card key={caseFile.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{caseFile.caseTitle}</h3>
                      <Badge
                        variant={
                          caseFile.status === "active"
                            ? "default"
                            : caseFile.status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                        className={caseFile.status === "active" ? "bg-green-100 text-green-800" : ""}
                      >
                        {caseFile.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Case #: {caseFile.caseNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Filed on</p>
                    <p className="font-medium">{caseFile.createdDate}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Case Type</p>
                    <p className="font-medium">{caseFile.caseType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Thana</p>
                    <p className="font-medium">{caseFile.thanaName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Persons Involved</p>
                    <p className="font-medium">{caseFile.casePersons}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">{caseFile.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {caseFile.views} views
                    </div>
                    {caseFile.interested && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Users className="h-4 w-4" />
                        Lawyer interested
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {caseFile.isPublic ? (
                        <Globe className="h-4 w-4 text-green-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={caseFile.isPublic ?? false}
                          onCheckedChange={() => handleTogglePublic(caseFile.id, caseFile.isPublic ?? false)}
                        />
                        <Label className="text-xs text-muted-foreground cursor-pointer">
                          {caseFile.isPublic ? "Public" : "Private"}
                        </Label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewCase(caseFile)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive bg-transparent"
                        onClick={() => handleDeleteCase(caseFile.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {!isLoading && cases.length === 0 && !error && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No cases filed yet</h3>
              <p className="text-muted-foreground mb-4">Start by filing your first case (৳100)</p>
            </CardContent>
          </Card>
        )}

        {/* Case Details Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Case Details</DialogTitle>
              <DialogDescription>Complete information about this case</DialogDescription>
            </DialogHeader>
            {selectedCase && (
              <div className="space-y-6">
                {/* Case Header */}
                <div className="flex items-start justify-between pb-4 border-b">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{selectedCase.caseTitle || "Untitled Case"}</h3>
                    <p className="text-sm text-muted-foreground">Case #: {selectedCase.caseNumber}</p>
                  </div>
                  <Badge
                    variant={
                      selectedCase.status === "active"
                        ? "default"
                        : selectedCase.status === "pending"
                          ? "secondary"
                          : "outline"
                    }
                    className={selectedCase.status === "active" ? "bg-green-100 text-green-800" : ""}
                  >
                    {selectedCase.status}
                  </Badge>
                </div>

                {/* Case Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Case Type</Label>
                    <p className="font-medium">{selectedCase.caseType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Thana Name</Label>
                    <p className="font-medium">{selectedCase.thanaName || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Case Name & Dhara</Label>
                    <p className="font-medium">{selectedCase.caseName || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Dhara Number</Label>
                    <p className="font-medium">{selectedCase.dharaNumber || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Register Date</Label>
                    <p className="font-medium">{selectedCase.registerDate || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">BP Form No.</Label>
                    <p className="font-medium">{selectedCase.bpFormNo || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Case Persons</Label>
                    <p className="font-medium">{selectedCase.casePersons || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Relationship</Label>
                    <p className="font-medium">{selectedCase.relationship || "N/A"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="font-medium whitespace-pre-wrap">{selectedCase.description || "No description provided"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Filed Date</Label>
                    <p className="font-medium">{selectedCase.createdDate}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Views</Label>
                    <p className="font-medium">{selectedCase.views}</p>
                  </div>
                </div>

                {/* Documents Section */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-lg font-semibold">Uploaded Documents</Label>
                    {selectedCase.documents && selectedCase.documents.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          selectedCase.documents.forEach((docName: string) => {
                            handleDownloadFile(docName, selectedCase.id)
                          })
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download All
                      </Button>
                    )}
                  </div>
                  {selectedCase.documents && selectedCase.documents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedCase.documents.map((docName: string, index: number) => {
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="h-5 w-5 text-accent flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{docName}</p>
                                <p className="text-xs text-muted-foreground">
                                  Document {index + 1}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadFile(docName, selectedCase.id)}
                              className="flex-shrink-0"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No documents uploaded for this case</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
