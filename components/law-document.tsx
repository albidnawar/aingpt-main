"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Calendar, FileText, Share2, Printer } from "lucide-react"

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
  status: "Active" | "Amended" | "Repealed"
}

interface LawDocumentProps {
  law: Law
  onBack: () => void
  onDownload: (law: Law) => void
}

export function LawDocument({ law, onBack, onDownload }: LawDocumentProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: law.title,
        text: law.description,
        url: window.location.href,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Laws
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button size="sm" className="bg-accent hover:bg-accent/90" onClick={() => onDownload(law)}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Document Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{law.title}</CardTitle>
              <p className="text-muted-foreground">{law.description}</p>
            </div>
            <Badge
              variant={law.status === "Active" ? "default" : law.status === "Amended" ? "secondary" : "outline"}
              className="ml-4"
            >
              {law.status}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {law.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Category</p>
              <p className="text-sm font-medium">{law.category}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Enacted Date</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {law.enactedDate.toLocaleDateString()}
              </p>
            </div>
            {law.lastAmended && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Last Amended</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {law.lastAmended.toLocaleDateString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-1">File Size</p>
              <p className="text-sm font-medium flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {law.fileSize}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Text */}
      <Card>
        <CardHeader>
          <CardTitle>Full Text</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{law.fullText}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
