"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BlogPost } from "@/components/blog-post"
import { Search, Calendar, User, Clock, ArrowRight, TrendingUp } from "lucide-react"

interface Article {
  id: string
  title: string
  summary: string
  content: string
  author: string
  publishedAt: Date
  readTime: number
  category: string
  tags: string[]
  image?: string
  featured: boolean
}

const mockArticles: Article[] = [
  {
    id: "1",
    title: "New Employment Law Reforms in Bangladesh 2024",
    summary:
      "Comprehensive overview of the latest employment law changes affecting both employers and employees in Bangladesh.",
    content: `The Bangladesh government has introduced significant reforms to employment law in 2024, aimed at protecting worker rights while maintaining business flexibility. These changes affect minimum wage standards, working hours, and termination procedures.

Key changes include:
- Minimum wage increase to ৳12,000 for entry-level positions
- Mandatory 8-hour work day with overtime compensation
- Enhanced maternity and paternity leave provisions
- Stronger protection against workplace discrimination

Employers must ensure compliance by March 2024 to avoid penalties. Workers should understand their new rights and how to exercise them effectively.`,
    author: "Dr. Rashida Khan",
    publishedAt: new Date("2024-01-15"),
    readTime: 8,
    category: "Legal Reforms",
    tags: ["Employment", "Labor Law", "Bangladesh", "2024"],
    image: "/legal-reform-news.jpg",
    featured: true,
  },
  {
    id: "2",
    title: "Understanding Contract Law: A Beginner's Guide",
    summary: "Essential principles of contract law explained in simple terms for everyday business and personal use.",
    content: `Contract law forms the foundation of business relationships and personal agreements. Understanding basic principles can help you avoid disputes and protect your interests.

Essential elements of a valid contract:
1. Offer and acceptance
2. Consideration (exchange of value)
3. Legal capacity of parties
4. Lawful purpose

Common contract types include employment agreements, service contracts, and purchase agreements. Always read terms carefully and seek legal advice for complex agreements.`,
    author: "Advocate Mohammad Ali",
    publishedAt: new Date("2024-01-12"),
    readTime: 6,
    category: "Legal Guides",
    tags: ["Contract Law", "Business", "Legal Basics"],
    image: "/contract-law-guide.jpg",
    featured: false,
  },
  {
    id: "3",
    title: "Digital Privacy Rights in the Modern Age",
    summary: "How new technology laws protect your personal data and what you need to know about digital privacy.",
    content: `With increasing digitalization, protecting personal data has become crucial. Recent legislation provides stronger privacy rights and imposes obligations on companies handling personal information.

Your digital rights include:
- Right to know what data is collected
- Right to access your personal data
- Right to correct inaccurate information
- Right to delete personal data
- Right to data portability

Companies must obtain clear consent before collecting data and implement security measures to protect it. Violations can result in significant penalties.`,
    author: "Fatima Ahmed",
    publishedAt: new Date("2024-01-10"),
    readTime: 7,
    category: "Technology Law",
    tags: ["Privacy", "Data Protection", "Digital Rights"],
    image: "/digital-privacy.jpg",
    featured: true,
  },
  {
    id: "4",
    title: "Property Disputes: Prevention and Resolution",
    summary: "Common property disputes and effective strategies for prevention and resolution through legal channels.",
    content: `Property disputes are among the most common legal issues in Bangladesh. Understanding prevention strategies and resolution mechanisms can save time, money, and stress.

Common property disputes:
- Boundary disagreements
- Title disputes
- Inheritance conflicts
- Landlord-tenant issues

Prevention strategies:
- Proper documentation
- Clear agreements
- Regular property surveys
- Professional legal advice

Resolution options include negotiation, mediation, arbitration, and court proceedings. Early intervention often leads to better outcomes.`,
    author: "Barrister Aminul Haque",
    publishedAt: new Date("2024-01-08"),
    readTime: 9,
    category: "Property Law",
    tags: ["Property", "Disputes", "Real Estate"],
    image: "/property-disputes.jpg",
    featured: false,
  },
]

const categories = ["All Categories", "Legal Reforms", "Legal Guides", "Technology Law", "Property Law", "Family Law"]

export function BlogSection() {
  const [articles] = useState<Article[]>(mockArticles)
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(mockArticles)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterArticles(query, selectedCategory)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    filterArticles(searchQuery, category)
  }

  const filterArticles = (query: string, category: string) => {
    let filtered = articles

    if (query) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.summary.toLowerCase().includes(query.toLowerCase()) ||
          article.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
      )
    }

    if (category !== "All Categories") {
      filtered = filtered.filter((article) => article.category === category)
    }

    setFilteredArticles(filtered)
  }

  if (selectedArticle) {
    return <BlogPost article={selectedArticle} onBack={() => setSelectedArticle(null)} />
  }

  const featuredArticles = filteredArticles.filter((article) => article.featured)
  const regularArticles = filteredArticles.filter((article) => !article.featured)

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-accent" />
            Explore Legal Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles, guides, and news..."
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

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold">Featured Articles</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredArticles.map((article) => (
              <Card key={article.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted rounded-t-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">Featured</Badge>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <Badge variant="secondary" className="mb-2">
                      {article.category}
                    </Badge>
                    <h3 className="font-semibold text-lg line-clamp-2">{article.title}</h3>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{article.summary}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{article.readTime}m read</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{article.publishedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-3 justify-between"
                    onClick={() => setSelectedArticle(article)}
                  >
                    Read Article
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Regular Articles */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Latest Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {regularArticles.map((article) => (
            <Card key={article.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{article.category}</Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{article.readTime}m</span>
                  </div>
                </div>
                <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                <CardDescription className="line-clamp-3">{article.summary}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1 mb-3">
                  {article.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{article.publishedAt.toLocaleDateString()}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                  onClick={() => setSelectedArticle(article)}
                >
                  Read More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {filteredArticles.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No articles found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms or category filter</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
