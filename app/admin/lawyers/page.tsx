"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AddLawyerModal } from "@/components/admin-modals/add-lawyer-modal"
import { Plus, Search, Trash2, Edit2, Star, MapPin, DollarSign } from "lucide-react"

const initialLawyers = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    specializations: ["Corporate Law", "Intellectual Property"],
    experience: "15",
    hourlyRate: "350",
    about: "Experienced corporate lawyer with 15 years of practice in mergers and acquisitions.",
    clients: 45,
    rating: 4.8,
    reviews: 32,
    verified: true,
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael@example.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    specializations: ["Criminal Law", "Employment Law"],
    experience: "12",
    hourlyRate: "300",
    about: "Criminal defense specialist with proven track record in complex cases.",
    clients: 38,
    rating: 4.6,
    reviews: 28,
    verified: true,
  },
]

export default function LawyersPage() {
  const [lawyers, setLawyers] = useState(initialLawyers)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLawyers = lawyers.filter(
    (lawyer) =>
      lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lawyer.specializations.some((spec) => spec.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleAddLawyer = (newLawyer: any) => {
    setLawyers([...lawyers, newLawyer])
  }

  const handleDeleteLawyer = (id: string) => {
    setLawyers(lawyers.filter((lawyer) => lawyer.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lawyers Management</h1>
          <p className="text-muted-foreground mt-2">Manage lawyer profiles and details</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus size={20} />
          Add Lawyer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Lawyers</CardTitle>
          <CardDescription>Total: {lawyers.length} lawyers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 bg-input px-3 py-2 rounded-md">
            <Search size={20} className="text-muted-foreground" />
            <Input
              placeholder="Search lawyers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLawyers.map((lawyer) => (
              <Card key={lawyer.id} className="border border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{lawyer.name}</CardTitle>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={16} className="fill-yellow-500 text-yellow-500" />
                        <span className="text-sm font-medium">{lawyer.rating}</span>
                        <span className="text-xs text-muted-foreground">({lawyer.reviews} reviews)</span>
                      </div>
                    </div>
                    {lawyer.verified && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-700 dark:text-green-400">
                        Verified
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">{lawyer.email}</p>
                    <p className="text-muted-foreground">{lawyer.phone}</p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin size={16} />
                      <span>{lawyer.location}</span>
                    </div>
                  </div>

                  {/* Experience & Rate */}
                  <div className="grid grid-cols-2 gap-2 py-2 border-y border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Experience</p>
                      <p className="font-semibold text-foreground">{lawyer.experience} years</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Hourly Rate</p>
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} />
                        <p className="font-semibold text-foreground">{lawyer.hourlyRate}/hr</p>
                      </div>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Areas of Interest</p>
                    <div className="flex flex-wrap gap-1">
                      {lawyer.specializations.map((spec) => (
                        <span
                          key={spec}
                          className="px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* About */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">About</p>
                    <p className="text-sm text-foreground line-clamp-2">{lawyer.about}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 py-2 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Clients</p>
                      <p className="font-semibold text-foreground">{lawyer.clients}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="font-semibold text-green-600 dark:text-green-400">Active</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => handleDeleteLawyer(lawyer.id)}
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <AddLawyerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddLawyer} />
    </div>
  )
}
