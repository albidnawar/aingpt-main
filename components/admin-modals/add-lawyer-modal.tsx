"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

interface AddLawyerModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (lawyer: any) => void
}

const specializations = [
  "Corporate Law",
  "Criminal Law",
  "Family Law",
  "Intellectual Property",
  "Real Estate",
  "Tax Law",
  "Employment Law",
  "Immigration Law",
]

export function AddLawyerModal({ isOpen, onClose, onAdd }: AddLawyerModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    specializations: [] as string[],
    experience: "",
    hourlyRate: "",
    about: "",
  })

  const handleSpecializationChange = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      clients: 0,
      rating: 4.5,
      reviews: 0,
      verified: true,
    })
    setFormData({
      name: "",
      email: "",
      phone: "",
      location: "",
      specializations: [],
      experience: "",
      hourlyRate: "",
      about: "",
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Add New Lawyer</CardTitle>
            <CardDescription>Create a new lawyer profile</CardDescription>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X size={20} />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input
                  placeholder="Jane Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Phone</label>
                <Input
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Location</label>
                <Input
                  placeholder="New York, NY"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Experience & Rate */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">Years of Experience</label>
                <Input
                  type="number"
                  placeholder="10"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Hourly Rate ($)</label>
                <Input
                  type="number"
                  placeholder="250"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Specializations */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Areas of Interest</label>
              <div className="grid grid-cols-2 gap-3">
                {specializations.map((spec) => (
                  <label key={spec} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.specializations.includes(spec)}
                      onChange={() => handleSpecializationChange(spec)}
                      className="w-4 h-4 rounded border-input"
                    />
                    <span className="text-sm text-foreground">{spec}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* About */}
            <div>
              <label className="text-sm font-medium text-foreground">Professional Bio</label>
              <textarea
                placeholder="Tell us about your professional background and expertise..."
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground min-h-24 resize-none"
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Add Lawyer
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
