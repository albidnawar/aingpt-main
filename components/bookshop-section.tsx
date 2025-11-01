"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookDetail } from "@/components/book-detail"
import { Search, Star, ShoppingCart, BookOpen } from "lucide-react"

interface Book {
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
  publisher: string
  publishedYear: number
  isbn: string
  language: string
  format: "Hardcover" | "Paperback" | "Digital" | "Audio"
  inStock: boolean
  bestseller: boolean
  cover?: string
}

const mockBooks: Book[] = [
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
    publisher: "University Press Limited",
    publishedYear: 2023,
    isbn: "978-984-05-0123-4",
    language: "English",
    format: "Hardcover",
    inStock: true,
    bestseller: true,
    cover: "/constitutional-law-book.jpg",
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
    publisher: "Legal Publications",
    publishedYear: 2023,
    isbn: "978-984-05-0124-1",
    language: "English",
    format: "Paperback",
    inStock: true,
    bestseller: false,
    cover: "/contract-law-book.jpg",
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
    publisher: "Supreme Court Bar Association",
    publishedYear: 2024,
    isbn: "978-984-05-0125-8",
    language: "English",
    format: "Hardcover",
    inStock: true,
    bestseller: true,
    cover: "/criminal-law-book.jpg",
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
    publisher: "Academic Publishers",
    publishedYear: 2023,
    isbn: "978-984-05-0126-5",
    language: "English",
    format: "Paperback",
    inStock: false,
    bestseller: false,
    cover: "/family-law-book.jpg",
  },
  {
    id: "5",
    title: "Property Law Handbook",
    author: "Barrister Aminul Haque",
    description:
      "Practical handbook covering property transactions, land laws, and real estate regulations in Bangladesh.",
    price: 1100,
    rating: 4.7,
    reviewCount: 142,
    category: "Property Law",
    pages: 620,
    publisher: "Law House",
    publishedYear: 2023,
    isbn: "978-984-05-0127-2",
    language: "English",
    format: "Hardcover",
    inStock: true,
    bestseller: false,
    cover: "/property-law-book.jpg",
  },
  {
    id: "6",
    title: "Legal Research Methodology",
    author: "Prof. Dr. Rashida Begum",
    description:
      "Essential guide for law students and researchers on legal research methods, citation, and academic writing.",
    price: 650,
    rating: 4.4,
    reviewCount: 98,
    category: "Legal Education",
    pages: 380,
    publisher: "Educational Books",
    publishedYear: 2024,
    isbn: "978-984-05-0128-9",
    language: "English",
    format: "Paperback",
    inStock: true,
    bestseller: false,
    cover: "/legal-research-book.jpg",
  },
]

const categories = [
  "All Categories",
  "Constitutional Law",
  "Contract Law",
  "Criminal Law",
  "Family Law",
  "Property Law",
  "Legal Education",
  "Corporate Law",
  "Tax Law",
]

export function BookshopSection() {
  const [books] = useState<Book[]>(mockBooks)
  const [filteredBooks, setFilteredBooks] = useState<Book[]>(mockBooks)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [sortBy, setSortBy] = useState("featured")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterBooks(query, selectedCategory, sortBy)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    filterBooks(searchQuery, category, sortBy)
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    filterBooks(searchQuery, selectedCategory, sort)
  }

  const filterBooks = (query: string, category: string, sort: string) => {
    let filtered = books

    if (query) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(query.toLowerCase()) ||
          book.author.toLowerCase().includes(query.toLowerCase()) ||
          book.description.toLowerCase().includes(query.toLowerCase()),
      )
    }

    if (category !== "All Categories") {
      filtered = filtered.filter((book) => book.category === category)
    }

    // Sort books
    switch (sort) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        filtered.sort((a, b) => b.publishedYear - a.publishedYear)
        break
      default:
        // Featured first (bestsellers)
        filtered.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0))
    }

    setFilteredBooks(filtered)
  }

  if (selectedBook) {
    return <BookDetail book={selectedBook} onBack={() => setSelectedBook(null)} />
  }

  const bestsellerBooks = filteredBooks.filter((book) => book.bestseller)
  const regularBooks = filteredBooks.filter((book) => !book.bestseller)

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-accent" />
            Find Legal Books
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search books, authors, or topics..."
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
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bestsellers */}
      {bestsellerBooks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold">Bestsellers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bestsellerBooks.map((book) => (
              <Card key={book.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <div className="aspect-[3/4] bg-muted rounded-t-lg relative overflow-hidden">
                  <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground z-10">Bestseller</Badge>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
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
                      <Button size="sm" className="flex-1" onClick={() => setSelectedBook(book)}>
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
        </div>
      )}

      {/* All Books */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Books</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {regularBooks.map((book) => (
            <Card key={book.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <div className="aspect-[3/4] bg-muted rounded-t-lg relative overflow-hidden">
                {!book.inStock && (
                  <Badge variant="destructive" className="absolute top-2 left-2 z-10">
                    Out of Stock
                  </Badge>
                )}
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
                    <Button size="sm" className="flex-1" onClick={() => setSelectedBook(book)}>
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
      </div>

      {filteredBooks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No books found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
