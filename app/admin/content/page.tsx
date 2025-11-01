"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AddContentModal } from "@/components/admin-modals/add-content-modal"
import { Plus, Search, Trash2, Edit2, Eye } from "lucide-react"

const initialContent = [
  {
    id: "1",
    title: "Corporate Law Basics",
    type: "video",
    category: "corporate",
    duration: "45",
    views: 1250,
    published: true,
    date: "2024-01-15",
    description: "Introduction to corporate law fundamentals",
  },
  {
    id: "2",
    title: "Criminal Defense Handbook",
    type: "book",
    category: "criminal",
    duration: "120",
    views: 890,
    published: true,
    date: "2024-02-20",
    description: "Comprehensive guide to criminal defense strategies",
  },
]

export default function ContentPage() {
  const [content, setContent] = useState(initialContent)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredContent = content.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddContent = (newContent: any) => {
    setContent([...content, newContent])
  }

  const handleDeleteContent = (id: string) => {
    setContent(content.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Content Management</h1>
          <p className="text-muted-foreground mt-2">Manage videos, books, and articles</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus size={20} />
          Add Content
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Content</CardTitle>
          <CardDescription>Total: {content.length} items</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 bg-input px-3 py-2 rounded-md">
            <Search size={20} className="text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-foreground">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Duration</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Views</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContent.map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-foreground font-medium">{item.title}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground capitalize">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground capitalize">{item.category}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.duration} min</td>
                    <td className="py-3 px-4 flex items-center gap-1 text-foreground">
                      <Eye size={16} />
                      {item.views}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-700 dark:text-green-400">
                        Published
                      </span>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteContent(item.id)}>
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AddContentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddContent} />
    </div>
  )
}
