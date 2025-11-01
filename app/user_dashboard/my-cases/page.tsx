"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
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
import { FileText, Plus, Eye, Trash2, Download, Users } from "lucide-react"

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
  const [cases, setCases] = useState<CaseFile[]>(mockCases)
  const [isFormOpen, setIsFormOpen] = useState(false)
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

  const handleAddCase = () => {
    if (formData.caseNumber && formData.caseType) {
      const newCase: CaseFile = {
        id: String(cases.length + 1),
        ...formData,
        documents: [],
        views: 0,
        interested: false,
        status: "active",
        createdDate: new Date().toISOString().split("T")[0],
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
      setIsFormOpen(false)
    }
  }

  const handleDeleteCase = (id: string) => {
    setCases(cases.filter((c) => c.id !== id))
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
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PDF, DOC, DOCX up to 10MB</p>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-accent hover:bg-accent/90" onClick={handleAddCase}>
                    File Case (৳100)
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

        {/* Cases List */}
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
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Documents
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
              </CardContent>
            </Card>
          ))}
        </div>

        {cases.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No cases filed yet</h3>
              <p className="text-muted-foreground mb-4">Start by filing your first case (৳100)</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
