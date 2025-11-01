"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface AddContentModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (content: any) => void
}

export function AddContentModal({ isOpen, onClose, onAdd }: AddContentModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    type: "video",
    category: "general",
    duration: "",
    description: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      views: 0,
      published: true,
      date: new Date().toLocaleDateString(),
    })
    setFormData({ title: "", type: "video", category: "general", duration: "", description: "" })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Add New Content</CardTitle>
            <CardDescription>Create new video or book content</CardDescription>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X size={20} />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Title</label>
              <Input
                placeholder="Content title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="video">Video</option>
                  <option value="book">Book</option>
                  <option value="article">Article</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="general">General</option>
                  <option value="corporate">Corporate</option>
                  <option value="criminal">Criminal</option>
                  <option value="family">Family</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Duration (minutes)</label>
              <Input
                type="number"
                placeholder="45"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                placeholder="Content description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-20 resize-none"
                required
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Add Content
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
