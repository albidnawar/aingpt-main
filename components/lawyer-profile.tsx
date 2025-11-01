"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Star, MapPin, Clock, Calendar, GraduationCap, Building, Scale, Award } from "lucide-react"

interface Lawyer {
  id: string
  name: string
  photo?: string
  specialization: string[]
  location: string
  experience: number
  rating: number
  reviewCount: number
  tagline: string
  availability: "available" | "busy" | "unavailable"
  languages: string[]
  education: string
  firm: string
  hourlyRate: number
  responseTime: string
}

interface LawyerProfileProps {
  lawyer: Lawyer
  onBack: () => void
}

const mockReviews = [
  {
    id: "1",
    clientName: "Ahmed Hassan",
    rating: 5,
    date: "2024-01-10",
    comment: "Excellent service and very knowledgeable. Helped me with my business formation smoothly.",
  },
  {
    id: "2",
    clientName: "Fatima Ali",
    rating: 5,
    date: "2024-01-05",
    comment: "Professional and responsive. Highly recommend for corporate legal matters.",
  },
  {
    id: "3",
    clientName: "Mohammad Khan",
    rating: 4,
    date: "2023-12-28",
    comment: "Good experience overall. Clear communication and fair pricing.",
  },
]

export function LawyerProfile({ lawyer, onBack }: LawyerProfileProps) {
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Directory
      </Button>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-32 h-32 mx-auto md:mx-0">
              <AvatarImage src={lawyer.photo || "/placeholder.svg"} alt={lawyer.name} />
              <AvatarFallback className="text-2xl">
                {lawyer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-bold">{lawyer.name}</h1>
                  <Badge
                    variant={lawyer.availability === "available" ? "default" : "secondary"}
                    className={
                      lawyer.availability === "available"
                        ? "bg-green-100 text-green-800"
                        : lawyer.availability === "busy"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-800"
                    }
                  >
                    {lawyer.availability}
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground mb-3">{lawyer.tagline}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-gray-400 text-gray-400" />
                    <span className="font-medium">{lawyer.rating}</span>
                    <span className="text-muted-foreground">({lawyer.reviewCount} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{lawyer.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{lawyer.responseTime}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {lawyer.specialization.map((spec) => (
                  <Badge key={spec} variant="outline">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="text-center md:text-right">
              <div className="text-3xl font-bold text-accent">৳{lawyer.hourlyRate}</div>
              <div className="text-sm text-muted-foreground">per hour</div>
              <Button className="mt-4 w-full md:w-auto">
                <Calendar className="h-4 w-4 mr-2" />
                Book Consultation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Background</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">Education</p>
                      <p className="text-sm text-muted-foreground">{lawyer.education}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">Law Firm</p>
                      <p className="text-sm text-muted-foreground">{lawyer.firm}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">Years of Experience</p>
                      <p className="text-sm text-muted-foreground">{lawyer.experience} years</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-2">Languages</p>
                    <div className="flex flex-wrap gap-1">
                      {lawyer.languages.map((lang) => (
                        <Badge key={lang} variant="secondary">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Practice Areas</p>
                    <div className="flex flex-wrap gap-1">
                      {lawyer.specialization.map((spec) => (
                        <Badge key={spec} variant="outline">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-l-2 border-accent pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-accent" />
                    <h3 className="font-semibold">Senior Partner</h3>
                    <Badge variant="outline">2020 - Present</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{lawyer.firm}</p>
                  <p className="text-sm">
                    Leading corporate law practice with focus on business formation, contract negotiation, and
                    regulatory compliance. Successfully handled 200+ cases with 95% success rate.
                  </p>
                </div>
                <div className="border-l-2 border-muted pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">Associate Lawyer</h3>
                    <Badge variant="outline">2015 - 2020</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Rahman & Associates</p>
                  <p className="text-sm">
                    Specialized in contract law and business disputes. Gained extensive experience in client
                    consultation and legal research.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Reviews</CardTitle>
              <CardDescription>What clients say about working with {lawyer.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {review.clientName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{review.clientName}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-gray-400 text-gray-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                    <p className="text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
