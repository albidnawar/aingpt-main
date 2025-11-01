"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Eye, Search, Star, ShoppingCart, BookOpen, Video } from "lucide-react"

interface VideoItem {
  id: string
  title: string
  description: string
  duration: string
  views: number
  category: string
  level: "Beginner" | "Intermediate" | "Advanced"
  instructor: string
  isPremium: boolean
}

interface BookItem {
  id: string
  title: string
  author: string
  description: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  category: string
  pages: number
  format: "Hardcover" | "Paperback" | "Digital" | "Audio"
  inStock: boolean
  bestseller: boolean
}

const mockVideos: VideoItem[] = [
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
  },
]

const mockBooks: BookItem[] = [
  {
    id: "1",
    title: "Constitutional Law of Bangladesh",
    author: "Dr. Kamal Hossain",
    description:
      "Comprehensive guide to Bangladesh's constitutional framework, covering fundamental rights, state principles, and judicial interpretations.",
    price: 1200,
    originalPrice: 1500,
    rating: 4.8,
    reviewCount: 156,
    category: "Constitutional Law",
    pages: 680,
    format: "Hardcover",
    inStock: true,
    bestseller: true,
  },
  {
    id: "2",
    title: "Contract Law Made Simple",
    author: "Advocate Sarah Rahman",
    description:
      "Easy-to-understand guide to contract law principles, perfect for law students and practicing professionals.",
    price: 800,
    rating: 4.6,
    reviewCount: 89,
    category: "Contract Law",
    pages: 420,
    format: "Paperback",
    inStock: true,
    bestseller: false,
  },
  {
    id: "3",
    title: "Criminal Procedure Code Commentary",
    author: "Justice Mohammad Ali",
    description:
      "Detailed commentary on Bangladesh's Criminal Procedure Code with case law references and practical applications.",
    price: 1800,
    originalPrice: 2000,
    rating: 4.9,
    reviewCount: 203,
    category: "Criminal Law",
    pages: 920,
    format: "Hardcover",
    inStock: true,
    bestseller: true,
  },
  {
    id: "4",
    title: "Family Law in Bangladesh",
    author: "Dr. Fatima Khan",
    description:
      "Comprehensive coverage of family law including marriage, divorce, inheritance, and child custody matters.",
    price: 950,
    rating: 4.5,
    reviewCount: 74,
    category: "Family Law",
    pages: 540,
    format: "Paperback",
    inStock: true,
    bestseller: false,
  },
]

export function ContentSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = ["all", "Constitutional Law", "Contract Law", "Family Law", "Criminal Law", "Property Law"]

  const filteredVideos = mockVideos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || video.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredBooks = mockBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-accent" />
            Legal Content Library
          </h1>
          <p className="text-muted-foreground">Educational videos and books for legal professionals</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-accent/10">
            <Video className="h-3 w-3 mr-1" />
            {mockVideos.length} Videos
          </Badge>
          <Badge variant="outline" className="bg-accent/10">
            <BookOpen className="h-3 w-3 mr-1" />
            {mockBooks.length} Books
          </Badge>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search videos and books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
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
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="videos">
            <Video className="h-4 w-4 mr-2" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="books">
            <BookOpen className="h-4 w-4 mr-2" />
            Books
          </TabsTrigger>
        </TabsList>

        {/* Videos Tab */}
        <TabsContent value="videos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
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

        {/* Books Tab */}
        <TabsContent value="books" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <div className="aspect-[3/4] bg-muted rounded-t-lg relative overflow-hidden">
                  {book.bestseller && (
                    <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground z-10">Bestseller</Badge>
                  )}
                  {!book.inStock && (
                    <Badge variant="destructive" className="absolute top-2 right-2 z-10">
                      Out of Stock
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-xs">
                      {book.category}
                    </Badge>
                    <h3 className="font-semibold line-clamp-2">{book.title}</h3>
                    <p className="text-sm text-muted-foreground">by {book.author}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-gray-400 text-gray-400" />
                      <span className="text-sm font-medium">{book.rating}</span>
                      <span className="text-sm text-muted-foreground">({book.reviewCount})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">৳{book.price}</span>
                        {book.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">৳{book.originalPrice}</span>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {book.format}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" disabled={!book.inStock}>
                        <ShoppingCart className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
