"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Calendar, Clock, Share, Bookmark, ThumbsUp } from "lucide-react"

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

interface BlogPostProps {
  article: Article
  onBack: () => void
}

export function BlogPost({ article, onBack }: BlogPostProps) {
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Articles
      </Button>

      {/* Article Header */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{article.category}</Badge>
            {article.featured && <Badge className="bg-accent text-accent-foreground">Featured</Badge>}
          </div>
          <CardTitle className="text-3xl font-bold text-balance">{article.title}</CardTitle>
          <p className="text-lg text-muted-foreground text-pretty">{article.summary}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {article.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{article.author}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{article.publishedAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{article.readTime} min read</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <ThumbsUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Article Content */}
      <Card>
        <CardContent className="p-8">
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-line text-foreground leading-relaxed">{article.content}</div>
          </div>
        </CardContent>
      </Card>

      {/* Article Tags */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Tags:</span>
            <div className="flex flex-wrap gap-1">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
