"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Clock, Eye, Search, BookOpen, Users } from "lucide-react"

interface Video {
  id: string
  title: string
  description: string
  duration: string
  views: number
  category: string
  level: "Beginner" | "Intermediate" | "Advanced"
  instructor: string
  thumbnail?: string
  isPremium: boolean
  uploadDate: string
}

const mockVideos: Video[] = [
  {
    id: "1",
    title: "Understanding Constitutional Rights in Bangladesh",
    description:
      "A comprehensive overview of fundamental rights guaranteed by the Constitution of Bangladesh and their practical applications.",
    duration: "45:30",
    views: 12500,
    category: "Constitutional Law",
    level: "Beginner",
    instructor: "Dr. Rashida Khan",
    isPremium: false,
    uploadDate: "2024-01-15",
  },
  {
    id: "2",
    title: "Contract Law Essentials for Business",
    description:
      "Learn the fundamentals of contract formation, interpretation, and enforcement in Bangladeshi business law.",
    duration: "38:45",
    views: 8900,
    category: "Contract Law",
    level: "Intermediate",
    instructor: "Advocate Mahmud Hassan",
    isPremium: true,
    uploadDate: "2024-01-10",
  },
  {
    id: "3",
    title: "Family Law and Personal Status",
    description:
      "Exploring marriage, divorce, inheritance, and custody laws under different personal status laws in Bangladesh.",
    duration: "52:15",
    views: 15600,
    category: "Family Law",
    level: "Intermediate",
    instructor: "Justice Fatima Ahmed",
    isPremium: false,
    uploadDate: "2024-01-08",
  },
  {
    id: "4",
    title: "Criminal Procedure and Evidence",
    description:
      "Advanced discussion on criminal procedure, evidence collection, and courtroom practice in Bangladesh.",
    duration: "67:20",
    views: 6700,
    category: "Criminal Law",
    level: "Advanced",
    instructor: "Senior Advocate Rahman Ali",
    isPremium: true,
    uploadDate: "2024-01-05",
  },
  {
    id: "5",
    title: "Property Rights and Land Laws",
    description: "Understanding property ownership, transfer, and land registration procedures in Bangladesh.",
    duration: "41:30",
    views: 9800,
    category: "Property Law",
    level: "Beginner",
    instructor: "Dr. Nasir Uddin",
    isPremium: false,
    uploadDate: "2024-01-03",
  },
  {
    id: "6",
    title: "Labor Law and Workers' Rights",
    description: "Comprehensive guide to employment law, workers' rights, and labor dispute resolution.",
    duration: "55:45",
    views: 7200,
    category: "Labor Law",
    level: "Intermediate",
    instructor: "Advocate Salma Khatun",
    isPremium: true,
    uploadDate: "2023-12-28",
  },
]

export function VideosSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLevel, setSelectedLevel] = useState("all")

  const categories = [
    "all",
    "Constitutional Law",
    "Contract Law",
    "Family Law",
    "Criminal Law",
    "Property Law",
    "Labor Law",
  ]
  const levels = ["all", "Beginner", "Intermediate", "Advanced"]

  const filteredVideos = mockVideos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || video.category === selectedCategory
    const matchesLevel = selectedLevel === "all" || video.level === selectedLevel
    return matchesSearch && matchesCategory && matchesLevel
  })

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Legal Education Videos</h1>
          <p className="text-muted-foreground">Learn from expert lawyers and legal scholars</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-accent/10">
            <BookOpen className="h-3 w-3 mr-1" />
            {mockVideos.length} Videos
          </Badge>
          <Badge variant="outline" className="bg-accent/10">
            <Users className="h-3 w-3 mr-1" />
            15+ Instructors
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search videos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level === "all" ? "All Levels" : level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Categories Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="constitutional">Constitutional</TabsTrigger>
          <TabsTrigger value="contract">Contract</TabsTrigger>
          <TabsTrigger value="family">Family</TabsTrigger>
          <TabsTrigger value="criminal">Criminal</TabsTrigger>
          <TabsTrigger value="property">Property</TabsTrigger>
          <TabsTrigger value="labor">Labor</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Featured Video */}
          <Card className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="aspect-video bg-muted relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button size="lg" className="rounded-full w-16 h-16">
                    <Play className="h-6 w-6 ml-1" />
                  </Button>
                </div>
                <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">Featured</Badge>
                {filteredVideos[0]?.isPremium && (
                  <Badge className="absolute top-4 right-4 bg-black text-white">Premium</Badge>
                )}
              </div>
              <div className="p-6">
                <Badge variant="outline" className="mb-2">
                  {filteredVideos[0]?.category}
                </Badge>
                <h3 className="text-2xl font-bold mb-2">{filteredVideos[0]?.title}</h3>
                <p className="text-muted-foreground mb-4">{filteredVideos[0]?.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {filteredVideos[0]?.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {formatViews(filteredVideos[0]?.views || 0)} views
                  </div>
                  <Badge variant="secondary">{filteredVideos[0]?.level}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Instructor: {filteredVideos[0]?.instructor}</p>
                <Button className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Watch Now
                </Button>
              </div>
            </div>
          </Card>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.slice(1).map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button size="sm" className="rounded-full w-12 h-12">
                      <Play className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                  {video.isPremium && (
                    <Badge className="absolute top-2 right-2 bg-black text-white text-xs">Premium</Badge>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <CardContent className="p-4">
                  <Badge variant="outline" className="mb-2 text-xs">
                    {video.category}
                  </Badge>
                  <h3 className="font-semibold mb-2 line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{video.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {formatViews(video.views)} views
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {video.level}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">by {video.instructor}</p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Play className="h-3 w-3 mr-2" />
                    Watch Video
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Other tab contents would filter by category */}
        <TabsContent value="constitutional">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos
              .filter((v) => v.category === "Constitutional Law")
              .map((video) => (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Same video card structure as above */}
                  <div className="aspect-video bg-muted relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button size="sm" className="rounded-full w-12 h-12">
                        <Play className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    {video.isPremium && (
                      <Badge className="absolute top-2 right-2 bg-black text-white text-xs">Premium</Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="outline" className="mb-2 text-xs">
                      {video.category}
                    </Badge>
                    <h3 className="font-semibold mb-2">{video.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{video.description}</p>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      <Play className="h-3 w-3 mr-2" />
                      Watch Video
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
