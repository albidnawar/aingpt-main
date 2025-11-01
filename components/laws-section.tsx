"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LawDocument } from "@/components/law-document"
import { Search, Calendar, Download, FileText, Star, Eye } from "lucide-react"

interface Law {
  id: string
  title: string
  description: string
  fullText: string
  category: string
  enactedDate: Date
  lastAmended?: Date
  fileSize: string
  downloadCount: number
  tags: string[]
  featured: boolean
  status: "Active" | "Amended" | "Repealed"
}

const mockLaws: Law[] = [
  {
    id: "1",
    title: "Employment Act 2024 (Amendment)",
    description:
      "Comprehensive amendments to employment regulations including minimum wage, working hours, and employee benefits.",
    fullText: `EMPLOYMENT ACT 2024 (AMENDMENT)

An Act to amend the Employment Act 2006 to provide for improved working conditions, fair wages, and enhanced employee protection.

CHAPTER I - PRELIMINARY
1. This Act may be cited as the Employment (Amendment) Act 2024.
2. This Act shall come into force on 1st March 2024.

CHAPTER II - MINIMUM WAGE
3. The minimum wage for entry-level positions shall be ৳12,000 per month.
4. Employers must review and adjust wages annually based on inflation.

CHAPTER III - WORKING HOURS
5. Standard working hours shall not exceed 8 hours per day or 48 hours per week.
6. Overtime work shall be compensated at 1.5 times the regular hourly rate.

CHAPTER IV - LEAVE PROVISIONS
7. Annual leave entitlement increased to 18 working days per year.
8. Maternity leave extended to 16 weeks with full pay.
9. Paternity leave of 10 working days introduced.

CHAPTER V - TERMINATION
10. Notice period for termination shall be minimum 60 days.
11. Severance pay calculated at one month's salary per year of service.`,
    category: "Employment Law",
    enactedDate: new Date("2024-01-15"),
    lastAmended: new Date("2024-01-15"),
    fileSize: "2.4 MB",
    downloadCount: 15420,
    tags: ["Employment", "Labor Rights", "Wages", "Amendment"],
    featured: true,
    status: "Active",
  },
  {
    id: "2",
    title: "Digital Security Act 2023",
    description: "Legislation governing digital security, data protection, and cybercrime prevention in Bangladesh.",
    fullText: `DIGITAL SECURITY ACT 2023

An Act to provide for digital security, protection of personal data, and prevention of cybercrimes.

CHAPTER I - DEFINITIONS
1. "Digital data" means information in electronic form.
2. "Personal data" means any information relating to an identified or identifiable individual.

CHAPTER II - DATA PROTECTION
3. Organizations must obtain explicit consent before collecting personal data.
4. Data subjects have the right to access, correct, and delete their personal data.
5. Organizations must implement appropriate security measures.

CHAPTER III - CYBERCRIMES
6. Unauthorized access to computer systems is prohibited.
7. Identity theft and fraud carry penalties up to 10 years imprisonment.
8. Distribution of malware is a criminal offense.

CHAPTER IV - ENFORCEMENT
9. Digital Security Agency established for enforcement.
10. Penalties range from fines to imprisonment based on severity.`,
    category: "Technology Law",
    enactedDate: new Date("2023-12-01"),
    fileSize: "3.1 MB",
    downloadCount: 12850,
    tags: ["Digital Security", "Data Protection", "Cybercrime"],
    featured: true,
    status: "Active",
  },
  {
    id: "3",
    title: "Property Transfer Act 2023",
    description: "Regulations governing property ownership, transfer, and registration procedures.",
    fullText: `PROPERTY TRANSFER ACT 2023

An Act to regulate the transfer of immovable property and ensure proper documentation.

CHAPTER I - PROPERTY TRANSFER
1. All property transfers must be registered with the land registry.
2. Transfer documents must include clear title verification.
3. Stamp duty applicable as per schedule.

CHAPTER II - REGISTRATION
4. Registration must be completed within 90 days of agreement.
5. Both parties must be present or represented by power of attorney.
6. Registration fees based on property value.

CHAPTER III - DISPUTES
7. Disputes to be resolved through civil courts.
8. Mediation encouraged before litigation.`,
    category: "Property Law",
    enactedDate: new Date("2023-11-15"),
    fileSize: "1.8 MB",
    downloadCount: 9340,
    tags: ["Property", "Real Estate", "Transfer"],
    featured: false,
    status: "Active",
  },
  {
    id: "4",
    title: "Consumer Rights Protection Act 2022",
    description:
      "Comprehensive consumer protection legislation covering product quality, warranties, and dispute resolution.",
    fullText: `CONSUMER RIGHTS PROTECTION ACT 2022

An Act to protect consumer rights and ensure fair business practices.

CHAPTER I - CONSUMER RIGHTS
1. Right to safety from hazardous products.
2. Right to information about products and services.
3. Right to choose from variety of products at competitive prices.
4. Right to be heard in consumer disputes.

CHAPTER II - BUSINESS OBLIGATIONS
5. Businesses must provide accurate product information.
6. Warranties must be honored as stated.
7. Defective products must be replaced or refunded.

CHAPTER III - ENFORCEMENT
8. Consumer Protection Authority established.
9. Penalties for violations include fines and business suspension.`,
    category: "Consumer Law",
    enactedDate: new Date("2022-06-01"),
    fileSize: "2.2 MB",
    downloadCount: 7890,
    tags: ["Consumer Rights", "Business", "Protection"],
    featured: false,
    status: "Active",
  },
]

const categories = [
  "All Categories",
  "Employment Law",
  "Technology Law",
  "Property Law",
  "Consumer Law",
  "Family Law",
  "Criminal Law",
]

export function LawsSection() {
  const [laws] = useState<Law[]>(mockLaws)
  const [filteredLaws, setFilteredLaws] = useState<Law[]>(mockLaws)
  const [selectedLaw, setSelectedLaw] = useState<Law | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterLaws(query, selectedCategory)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    filterLaws(searchQuery, category)
  }

  const filterLaws = (query: string, category: string) => {
    let filtered = laws

    if (query) {
      filtered = filtered.filter(
        (law) =>
          law.title.toLowerCase().includes(query.toLowerCase()) ||
          law.description.toLowerCase().includes(query.toLowerCase()) ||
          law.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
      )
    }

    if (category !== "All Categories") {
      filtered = filtered.filter((law) => law.category === category)
    }

    setFilteredLaws(filtered)
  }

  const handleDownload = (law: Law) => {
    // Simulate download
    const blob = new Blob([law.fullText], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${law.title.replace(/\s+/g, "_")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (selectedLaw) {
    return <LawDocument law={selectedLaw} onBack={() => setSelectedLaw(null)} onDownload={handleDownload} />
  }

  const featuredLaws = filteredLaws.filter((law) => law.featured)
  const regularLaws = filteredLaws.filter((law) => !law.featured)

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-accent" />
            Search Laws & Regulations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by law name, category, or keywords..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Featured Laws */}
      {featuredLaws.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold">Recently Updated Laws</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredLaws.map((law) => (
              <Card key={law.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className="bg-accent text-accent-foreground">New</Badge>
                    <Badge
                      variant={law.status === "Active" ? "default" : law.status === "Amended" ? "secondary" : "outline"}
                    >
                      {law.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{law.title}</CardTitle>
                  <CardDescription>{law.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {law.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{law.enactedDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>{law.fileSize}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      <span>{law.downloadCount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => setSelectedLaw(law)}
                    >
                      <Eye className="h-3 w-3 mr-2" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-accent hover:bg-accent/90"
                      onClick={() => handleDownload(law)}
                    >
                      <Download className="h-3 w-3 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Regular Laws */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Laws & Regulations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {regularLaws.map((law) => (
            <Card key={law.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{law.category}</Badge>
                  <Badge
                    variant={law.status === "Active" ? "default" : law.status === "Amended" ? "secondary" : "outline"}
                  >
                    {law.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg line-clamp-2">{law.title}</CardTitle>
                <CardDescription className="line-clamp-3">{law.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex flex-wrap gap-1">
                  {law.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{law.enactedDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>{law.fileSize}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => setSelectedLaw(law)}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => handleDownload(law)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {filteredLaws.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No laws found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or category filter</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
