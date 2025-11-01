"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { LawyerProfile } from "@/components/lawyer-profile"
import { Search, MapPin, Star, Clock, SlidersHorizontal, Users, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

interface Lawyer {
  id: string
  name: string
  photo?: string
  specialization: string[]
  location: string
  experience: number
  rating: number
  reviewCount: number
  tagline: string
  availability: "available" | "busy" | "unavailable"
  languages: string[]
  education: string
  firm: string
  hourlyRate: number
  responseTime: string
}

const mockLawyers: Lawyer[] = [
  {
    id: "1",
    name: "Sarah Ahmed",
    photo: "/professional-woman-lawyer.png",
    specialization: ["Corporate Law", "Contract Law", "Business Formation"],
    location: "Dhaka, Bangladesh",
    experience: 12,
    rating: 4.9,
    reviewCount: 127,
    tagline: "Helping businesses navigate complex legal landscapes",
    availability: "available",
    languages: ["English", "Bengali"],
    education: "Harvard Law School",
    firm: "Ahmed & Associates",
    hourlyRate: 150,
    responseTime: "Within 2 hours",
  },
  {
    id: "2",
    name: "Mohammad Rahman",
    photo: "/professional-lawyer.png",
    specialization: ["Criminal Law", "Family Law", "Personal Injury"],
    location: "Chittagong, Bangladesh",
    experience: 8,
    rating: 4.7,
    reviewCount: 89,
    tagline: "Dedicated to protecting your rights and interests",
    availability: "busy",
    languages: ["English", "Bengali", "Arabic"],
    education: "University of Dhaka",
    firm: "Rahman Legal Services",
    hourlyRate: 120,
    responseTime: "Within 4 hours",
  },
  {
    id: "3",
    name: "Fatima Khan",
    photo: "/professional-woman-lawyer-hijab.jpg",
    specialization: ["Immigration Law", "Human Rights", "Employment Law"],
    location: "Sylhet, Bangladesh",
    experience: 15,
    rating: 4.8,
    reviewCount: 203,
    tagline: "Advocating for justice and equality",
    availability: "available",
    languages: ["English", "Bengali", "Urdu"],
    education: "London School of Economics",
    firm: "Khan Immigration Law",
    hourlyRate: 180,
    responseTime: "Within 1 hour",
  },
  {
    id: "4",
    name: "Dr. Aminul Islam",
    photo: "/professional-lawyer.png",
    specialization: ["Constitutional Law", "Public Interest", "Administrative Law"],
    location: "Dhaka, Bangladesh",
    experience: 25,
    rating: 4.9,
    reviewCount: 156,
    tagline: "Constitutional expert with decades of experience",
    availability: "available",
    languages: ["English", "Bengali"],
    education: "Oxford University",
    firm: "Supreme Court Bar",
    hourlyRate: 250,
    responseTime: "Within 6 hours",
  },
  {
    id: "5",
    name: "Rashida Begum",
    photo: "/professional-woman-lawyer.png",
    specialization: ["Property Law", "Real Estate", "Land Disputes"],
    location: "Rajshahi, Bangladesh",
    experience: 10,
    rating: 4.6,
    reviewCount: 74,
    tagline: "Resolving property disputes with expertise",
    availability: "unavailable",
    languages: ["English", "Bengali"],
    education: "University of Rajshahi",
    firm: "Begum Property Law",
    hourlyRate: 100,
    responseTime: "Within 8 hours",
  },
  {
    id: "6",
    name: "Karim Hassan",
    photo: "/professional-lawyer.png",
    specialization: ["Tax Law", "Financial Law", "Banking"],
    location: "Dhaka, Bangladesh",
    experience: 18,
    rating: 4.8,
    reviewCount: 142,
    tagline: "Expert in tax and financial regulations",
    availability: "available",
    languages: ["English", "Bengali"],
    education: "BUET",
    firm: "Hassan Tax Consultancy",
    hourlyRate: 200,
    responseTime: "Within 3 hours",
  },
]

const practiceAreas = [
  "Corporate Law",
  "Criminal Law",
  "Family Law",
  "Immigration Law",
  "Property Law",
  "Tax Law",
  "Employment Law",
  "Personal Injury",
  "Constitutional Law",
  "Contract Law",
  "Human Rights",
  "Business Formation",
  "Real Estate",
  "Banking",
  "Administrative Law",
]

const locations = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh"]

export function LawyerDirectory() {
  const [lawyers] = useState<Lawyer[]>(mockLawyers)
  const [filteredLawyers, setFilteredLawyers] = useState<Lawyer[]>(mockLawyers)
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<string>("all")
  const [selectedPracticeAreas, setSelectedPracticeAreas] = useState<string[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all")
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterLawyers(query, selectedLocation, selectedPracticeAreas, selectedLanguage, availabilityFilter)
  }

  const filterLawyers = (
    query: string,
    location: string,
    practiceAreas: string[],
    language: string,
    availability: string,
  ) => {
    let filtered = lawyers

    if (query) {
      filtered = filtered.filter(
        (lawyer) =>
          lawyer.name.toLowerCase().includes(query.toLowerCase()) ||
          lawyer.specialization.some((spec) => spec.toLowerCase().includes(query.toLowerCase())) ||
          lawyer.tagline.toLowerCase().includes(query.toLowerCase()),
      )
    }

    if (location !== "all") {
      filtered = filtered.filter((lawyer) => lawyer.location.includes(location))
    }

    if (practiceAreas.length > 0) {
      filtered = filtered.filter((lawyer) => practiceAreas.some((area) => lawyer.specialization.includes(area)))
    }

    if (language !== "all") {
      filtered = filtered.filter((lawyer) => lawyer.languages.includes(language))
    }

    if (availability !== "all") {
      filtered = filtered.filter((lawyer) => lawyer.availability === availability)
    }

    setFilteredLawyers(filtered)
  }

  const handlePracticeAreaChange = (area: string, checked: boolean) => {
    const newAreas = checked ? [...selectedPracticeAreas, area] : selectedPracticeAreas.filter((a) => a !== area)
    setSelectedPracticeAreas(newAreas)
    filterLawyers(searchQuery, selectedLocation, newAreas, selectedLanguage, availabilityFilter)
  }

  if (selectedLawyer) {
    return <LawyerProfile lawyer={selectedLawyer} onBack={() => setSelectedLawyer(null)} />
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-accent" />
              Find Lawyers
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, practice area, or expertise..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-lg">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Location</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Language</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="All languages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All languages</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Bengali">Bengali</SelectItem>
                    <SelectItem value="Arabic">Arabic</SelectItem>
                    <SelectItem value="Urdu">Urdu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Availability</Label>
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All availability</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Practice Areas</Label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {practiceAreas.slice(0, 6).map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={area}
                        checked={selectedPracticeAreas.includes(area)}
                        onCheckedChange={(checked) => handlePracticeAreaChange(area, checked as boolean)}
                      />
                      <Label htmlFor={area} className="text-xs">
                        {area}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLawyers.map((lawyer) => (
          <Card key={lawyer.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={lawyer.photo || "/placeholder.svg"} alt={lawyer.name} />
                  <AvatarFallback>
                    {lawyer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg truncate">{lawyer.name}</h3>
                    <Badge
                      variant={
                        lawyer.availability === "available"
                          ? "default"
                          : lawyer.availability === "busy"
                            ? "secondary"
                            : "outline"
                      }
                      className={cn(
                        "text-xs",
                        lawyer.availability === "available" && "bg-green-100 text-green-800",
                        lawyer.availability === "busy" && "bg-gray-100 text-gray-800",
                        lawyer.availability === "unavailable" && "bg-red-100 text-red-800",
                      )}
                    >
                      {lawyer.availability}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-gray-400 text-gray-400" />
                    <span className="text-sm font-medium">{lawyer.rating}</span>
                    <span className="text-sm text-muted-foreground">({lawyer.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{lawyer.location}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">{lawyer.tagline}</p>

              <div className="flex flex-wrap gap-1">
                {lawyer.specialization.slice(0, 3).map((spec) => (
                  <Badge key={spec} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
                {lawyer.specialization.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{lawyer.specialization.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{lawyer.experience}y exp</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{lawyer.responseTime}</span>
                  </div>
                </div>
                <div className="font-medium">৳{lawyer.hourlyRate}/hr</div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1" onClick={() => setSelectedLawyer(lawyer)}>
                  View Profile
                </Button>
                <Button size="sm" className="flex-1 bg-accent hover:bg-accent/90">
                  Propose (5 Tokens)
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLawyers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No lawyers found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
