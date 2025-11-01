"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Star, ShoppingCart, BookOpen, Calendar, Package } from "lucide-react"

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

interface BookDetailProps {
  book: Book
  onBack: () => void
}

const mockReviews = [
  {
    id: "1",
    reviewer: "Ahmed Hassan",
    rating: 5,
    date: "2024-01-10",
    comment: "Excellent resource for understanding constitutional principles. Highly recommended for law students.",
  },
  {
    id: "2",
    reviewer: "Fatima Ali",
    rating: 5,
    date: "2024-01-05",
    comment: "Clear explanations and comprehensive coverage. Great reference book for practitioners.",
  },
  {
    id: "3",
    reviewer: "Mohammad Khan",
    rating: 4,
    date: "2023-12-28",
    comment: "Good book overall. Some sections could be more detailed but still very useful.",
  },
]

export function BookDetail({ book, onBack }: BookDetailProps) {
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Bookshop
      </Button>

      {/* Book Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Book Cover */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-[3/4] bg-muted rounded-lg mb-4 relative overflow-hidden">
                {book.bestseller && (
                  <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">Bestseller</Badge>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-bold">৳{book.price}</span>
                    {book.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">৳{book.originalPrice}</span>
                    )}
                  </div>
                  {book.originalPrice && (
                    <Badge variant="destructive" className="text-xs">
                      Save ৳{book.originalPrice - book.price}
                    </Badge>
                  )}
                </div>
                <Button className="w-full" size="lg" disabled={!book.inStock}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {book.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Add to Wishlist
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Book Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Badge variant="outline">{book.category}</Badge>
                  <CardTitle className="text-3xl font-bold">{book.title}</CardTitle>
                  <CardDescription className="text-lg">by {book.author}</CardDescription>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-gray-400 text-gray-400" />
                      <span className="font-medium">{book.rating}</span>
                      <span className="text-muted-foreground">({book.reviewCount} reviews)</span>
                    </div>
                    <Badge variant={book.inStock ? "default" : "destructive"}>
                      {book.inStock ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{book.description}</p>
            </CardContent>
          </Card>

          {/* Book Details Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="author">Author</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Book Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-accent" />
                        <div>
                          <p className="font-medium">Pages</p>
                          <p className="text-sm text-muted-foreground">{book.pages} pages</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-accent" />
                        <div>
                          <p className="font-medium">Format</p>
                          <p className="text-sm text-muted-foreground">{book.format}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-accent" />
                        <div>
                          <p className="font-medium">Published</p>
                          <p className="text-sm text-muted-foreground">{book.publishedYear}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium">Publisher</p>
                        <p className="text-sm text-muted-foreground">{book.publisher}</p>
                      </div>
                      <div>
                        <p className="font-medium">ISBN</p>
                        <p className="text-sm text-muted-foreground">{book.isbn}</p>
                      </div>
                      <div>
                        <p className="font-medium">Language</p>
                        <p className="text-sm text-muted-foreground">{book.language}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                  <CardDescription>
                    {book.reviewCount} reviews with an average rating of {book.rating} stars
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockReviews.map((review) => (
                    <div key={review.id} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.reviewer}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "fill-gray-400 text-gray-400" : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="author" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>About the Author</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold">{book.author.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{book.author}</h3>
                        <p className="text-muted-foreground">
                          A renowned legal scholar and practitioner with over 20 years of experience in constitutional
                          law. Author of multiple acclaimed legal texts and frequent contributor to legal journals.
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <h4 className="font-medium mb-2">Other Books by {book.author}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <p className="text-sm text-muted-foreground">• Principles of Administrative Law</p>
                        <p className="text-sm text-muted-foreground">• Human Rights in Practice</p>
                        <p className="text-sm text-muted-foreground">• Legal Research Methodology</p>
                        <p className="text-sm text-muted-foreground">• Constitutional Interpretation</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
