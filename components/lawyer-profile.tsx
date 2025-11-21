"use client"

import { useEffect, useMemo, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, BadgeInfo, BookOpenCheck, Calendar, Loader2, Mail, MapPin, Phone, Scale, ScrollText, Star } from "lucide-react"

interface LawyerSummary {
  id?: string | number
  lawyerId?: string
  name?: string
  photo?: string
  specialization?: string[]
  location?: string
  experience?: number
  rating?: number
  reviewCount?: number
  tagline?: string
  availability?: "available" | "busy" | "unavailable"
  languages?: string[]
  education?: string
  firm?: string
  hourlyRate?: number
  responseTime?: string
}

interface LawyerProfileResponse {
  lawyer: {
    id: number
    lawyer_id: string
    full_name: string | null
    email: string | null
    phone: string | null
    practice_areas: string[] | null
    chamber_address: string | null
    law_practicing_place: string | null
    years_experience: number | null
    consultation_fee: string | null
    token_balance: number | null
    avatar_url: string | null
    created_at: string | null
  }
  education: Array<{
    id: number
    degree: string | null
    institution: string | null
    graduation_year: string | null
  }>
  currentCases: LawyerCaseSummary[]
  significantCases: LawyerCaseSummary[]
  ratingStats: {
    average_rating: number | null
    review_count: number | null
  } | null
  reviews: LawyerReview[]
}

interface LawyerCaseSummary {
  id: number
  case_type: "current" | "significant"
  police_station: string | null
  district: string | null
  case_number: string | null
  law_name_and_section: string | null
  filing_date: string | null
  yearly_number: string | null
  crime_title: string | null
}

interface LawyerReview {
  id: number
  rating: number
  comment: string | null
  reviewer_name: string
  created_at: string | null
}

interface LawyerProfileProps {
  lawyer?: LawyerSummary | null
  lawyerId?: string
  onBack: () => void
  showContactInfo?: boolean
}

const formatCurrency = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return "—"
  const amount = typeof value === "string" ? Number(value) : value
  if (Number.isNaN(amount)) return "—"
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (value?: string | null) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const emptyState = (title: string, description: string) => (
  <div className="rounded-lg border border-dashed border-border/60 p-6 text-center">
    <p className="font-medium">{title}</p>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
)

export function LawyerProfile({ lawyer, lawyerId: propLawyerId, onBack, showContactInfo = true }: LawyerProfileProps) {
  const [profile, setProfile] = useState<LawyerProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resolvedLawyerId = useMemo(() => {
    if (propLawyerId) return propLawyerId
    if (lawyer?.lawyerId) return lawyer.lawyerId
    if (lawyer?.id !== undefined && lawyer?.id !== null) return String(lawyer.id)
    return undefined
  }, [propLawyerId, lawyer?.lawyerId, lawyer?.id])

  useEffect(() => {
    if (!resolvedLawyerId) {
      setProfile(null)
      setError("No lawyer identifier provided.")
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    const fetchProfile = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/lawyers/${encodeURIComponent(resolvedLawyerId)}`, {
          signal: controller.signal,
        })
        const body = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(body?.error ?? "Failed to load lawyer profile.")
        }
        setProfile(body as LawyerProfileResponse)
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        console.error("Failed to load lawyer profile", err)
        setError(err instanceof Error ? err.message : "Failed to load lawyer profile.")
        setProfile(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
    return () => controller.abort()
  }, [resolvedLawyerId])

  const fallbackName = lawyer?.name ?? "Lawyer profile"
  const displayName = profile?.lawyer.full_name ?? fallbackName
  const displayAvatar = profile?.lawyer.avatar_url ?? lawyer?.photo ?? "/placeholder.svg"
  const practiceAreas = profile?.lawyer.practice_areas ?? lawyer?.specialization ?? []
  const experience = profile?.lawyer.years_experience ?? lawyer?.experience
  const reviewCount = profile?.ratingStats?.review_count ?? lawyer?.reviewCount
  const avgRating = profile?.ratingStats?.average_rating ?? lawyer?.rating
  const availability = lawyer?.availability ?? "available"

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-2 w-fit">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Directory
      </Button>

      {error && (
        <Card className="border-destructive/60 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4 text-sm text-destructive">
            <BadgeInfo className="h-4 w-4" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row">
            <Avatar className="h-28 w-28">
              <AvatarImage src={displayAvatar} alt={displayName} />
              <AvatarFallback className="text-2xl">
                {displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold">{displayName}</h1>
                  {availability && (
                    <Badge
                      variant={availability === "available" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {availability.replace("_", " ")}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Lawyer ID: {profile?.lawyer.lawyer_id ?? lawyer?.lawyerId ?? "—"}
                </p>
              </div>

              {showContactInfo && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-lg border border-border/70 p-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <p className="text-xs uppercase text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{profile?.lawyer.email ?? "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-border/70 p-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <p className="text-xs uppercase text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">{profile?.lawyer.phone ?? "—"}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {(practiceAreas?.length ?? 0) === 0 && (
                  <p className="text-sm text-muted-foreground">No practice areas listed yet.</p>
                )}
                {practiceAreas?.map((area) => (
                  <Badge key={area} variant="outline">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="w-full space-y-3 rounded-lg border border-border/70 p-4 md:w-64">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Experience</span>
                <span className="font-semibold">{experience ? `${experience}+ yrs` : "—"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Consultation Fee</span>
                <span className="font-semibold">{formatCurrency(profile?.lawyer.consultation_fee ?? lawyer?.hourlyRate)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Average Rating</span>
                <span className="flex items-center gap-1 font-semibold">
                  {avgRating ? avgRating.toFixed(1) : "—"}
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reviews</span>
                <span className="font-semibold">{reviewCount ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-semibold">{formatDate(profile?.lawyer.created_at)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-accent" />
              Chamber & Practice
            </CardTitle>
            <CardDescription>Where the lawyer practices and meets clients</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-dashed border-border/70 p-4">
              <p className="text-xs uppercase text-muted-foreground">Chamber Address</p>
              <p className="font-medium">{profile?.lawyer.chamber_address ?? "—"}</p>
            </div>
            <div className="rounded-lg border border-dashed border-border/70 p-4">
              <p className="text-xs uppercase text-muted-foreground">Law Practicing Place</p>
              <p className="font-medium">{profile?.lawyer.law_practicing_place ?? lawyer?.location ?? "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpenCheck className="h-4 w-4 text-accent" />
              Education & Credentials
            </CardTitle>
            <CardDescription>Formal education history recorded in Supabase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && !profile && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            {!isLoading && (profile?.education?.length ?? 0) === 0 && emptyState("No education entries", "Once the lawyer adds education details, they will appear here.")}
            {profile?.education.map((edu) => (
              <div key={edu.id} className="rounded-lg border border-border/70 p-4">
                <p className="font-semibold">{edu.degree ?? "Degree information not provided"}</p>
                <p className="text-sm text-muted-foreground">{edu.institution ?? "Institution not provided"}</p>
                {edu.graduation_year && <p className="text-xs text-muted-foreground">Graduated: {edu.graduation_year}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-4 w-4 text-accent" />
            Case Experience
          </CardTitle>
          <CardDescription>Recent matters recorded by the lawyer</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Current Cases</p>
            {isLoading && !profile && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            {!isLoading && (profile?.currentCases?.length ?? 0) === 0 && emptyState("No current cases", "Active matters will appear when the lawyer documents them.")}
            {profile?.currentCases.map((caseItem) => (
              <div key={caseItem.id} className="mb-4 rounded-lg border border-border/70 p-4">
                <p className="font-semibold">{caseItem.case_number ?? "Case number not provided"}</p>
                <p className="text-sm text-muted-foreground">{caseItem.crime_title ?? caseItem.law_name_and_section ?? "Description not provided"}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  <p>District: {caseItem.district ?? "—"}</p>
                  <p>Filed: {formatDate(caseItem.filing_date)}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Significant Cases</p>
            {isLoading && !profile && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            {!isLoading &&
              (profile?.significantCases?.length ?? 0) === 0 &&
              emptyState("No cases recorded", "Highlight landmark cases here for clients to review.")}
            {profile?.significantCases.map((caseItem) => (
              <div key={caseItem.id} className="mb-4 rounded-lg border border-border/70 p-4">
                <p className="font-semibold">{caseItem.crime_title ?? "Case title pending"}</p>
                <p className="text-sm text-muted-foreground">
                  {caseItem.case_number ? `Case No. ${caseItem.case_number}` : "Case number not provided"}
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  <p>Police Station: {caseItem.police_station ?? "—"}</p>
                  <p>Filed: {formatDate(caseItem.filing_date)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ScrollText className="h-4 w-4 text-accent" />
            Recent Reviews
          </CardTitle>
          <CardDescription>Feedback captured from AinGPT users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && !profile && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          {!isLoading && (profile?.reviews?.length ?? 0) === 0 && emptyState("No reviews yet", "Encourage clients to leave reviews after engagements.")}
          {profile?.reviews.map((review) => (
            <div key={review.id} className="rounded-lg border border-border/70 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {review.reviewer_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{review.reviewer_name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(review.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              {review.comment && <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>}
            </div>
          ))}
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading latest profile information…
        </div>
      )}
    </div>
  )
}
