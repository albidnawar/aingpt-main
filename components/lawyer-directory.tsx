"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LawyerProfile } from "@/components/lawyer-profile"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"
import { cn } from "@/lib/utils"
import { GraduationCap, Loader2, MapPin, Search, SlidersHorizontal, Users } from "lucide-react"

interface SupabaseLawyer {
  id: number
  lawyer_id: string
  full_name: string | null
  practice_areas: string[] | null
  chamber_address: string | null
  law_practicing_place: string | null
  years_experience: number | null
  consultation_fee: string | number | null
  avatar_url: string | null
  created_at: string | null
}

interface Lawyer {
  id: string
  lawyerId?: string
  name: string
  photo?: string
  specialization: string[]
  location: string
  experience: number
  tagline: string
  availability: "available" | "busy" | "unavailable"
}

interface UserCaseOption {
  id: string
  caseNumber: string
  caseTitle: string
  status: string
}

export function LawyerDirectory() {
  const [lawyers, setLawyers] = useState<Lawyer[]>([])
  const [filteredLawyers, setFilteredLawyers] = useState<Lawyer[]>([])
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<string>("all")
  const [selectedPracticeAreas, setSelectedPracticeAreas] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProposeDialogOpen, setIsProposeDialogOpen] = useState(false)
  const [selectedLawyerForProposal, setSelectedLawyerForProposal] = useState<Lawyer | null>(null)
  const [userCases, setUserCases] = useState<UserCaseOption[]>([])
  const [isLoadingUserCases, setIsLoadingUserCases] = useState(false)
  const [selectedCaseId, setSelectedCaseId] = useState<string>("")
  const [proposalError, setProposalError] = useState<string | null>(null)
  const [proposalSuccess, setProposalSuccess] = useState<string | null>(null)
  const [isSendingProposal, setIsSendingProposal] = useState(false)

  const supabase = useMemo(() => createSupabaseBrowserClient(), [])

  const loadUserCases = useCallback(async () => {
    setIsLoadingUserCases(true)
    setProposalError(null)
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session?.user) {
        setProposalError("Please log in to send a request to a lawyer.")
        setUserCases([])
        return
      }

      const { data: userRecord, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .maybeSingle()

      if (userError || !userRecord) {
        setProposalError("Unable to locate your user profile. Please try again.")
        setUserCases([])
        return
      }

      const { data: casesData, error: casesError } = await supabase
        .from("cases")
        .select("id, case_number, case_title, status")
        .eq("user_id", userRecord.id)
        .order("created_at", { ascending: false })

      if (casesError) {
        throw casesError
      }

      const mappedCases: UserCaseOption[] =
        casesData?.map((caseRow) => ({
          id: String(caseRow.id),
          caseNumber: caseRow.case_number ?? "N/A",
          caseTitle: caseRow.case_title ?? "Untitled Case",
          status: (caseRow.status ?? "pending").toString(),
        })) ?? []

      setUserCases(mappedCases)
    } catch (err) {
      console.error("Failed to load user cases:", err)
      setProposalError(err instanceof Error ? err.message : "Failed to load your cases.")
      setUserCases([])
    } finally {
      setIsLoadingUserCases(false)
    }
  }, [supabase])

  useEffect(() => {
    const controller = new AbortController()

    const fetchLawyers = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/lawyers", { signal: controller.signal })
        const body = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(body?.error ?? "Failed to load lawyers.")
        }

        const normalized: Lawyer[] =
          (body?.lawyers as SupabaseLawyer[])?.map((lawyer) => ({
            id: String(lawyer.id),
            lawyerId: lawyer.lawyer_id,
            name: lawyer.full_name ?? "Unnamed Lawyer",
            photo: lawyer.avatar_url ?? undefined,
            specialization: lawyer.practice_areas?.filter(Boolean) ?? [],
            location: lawyer.law_practicing_place ?? "Bangladesh",
            experience: lawyer.years_experience ?? 0,
            tagline: lawyer.chamber_address ?? "Available for consultation",
            availability: "available",
          })) ?? []

        setLawyers(normalized)
        setFilteredLawyers(normalized)
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        console.error("Failed to load lawyers", err)
        setError(err instanceof Error ? err.message : "Failed to load lawyers.")
        setLawyers([])
        setFilteredLawyers([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchLawyers()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (isProposeDialogOpen) {
      loadUserCases()
    }
  }, [isProposeDialogOpen, loadUserCases])

  useEffect(() => {
    let filtered = [...lawyers]
    const query = searchQuery.trim().toLowerCase()

    if (query) {
      filtered = filtered.filter(
        (lawyer) =>
          lawyer.name.toLowerCase().includes(query) ||
          lawyer.specialization.some((spec) => spec.toLowerCase().includes(query)) ||
          lawyer.tagline.toLowerCase().includes(query),
      )
    }

    if (selectedLocation !== "all") {
      filtered = filtered.filter((lawyer) => lawyer.location.toLowerCase().includes(selectedLocation.toLowerCase()))
    }

    if (selectedPracticeAreas.length > 0) {
      filtered = filtered.filter((lawyer) =>
        lawyer.specialization.some((area) => selectedPracticeAreas.includes(area)),
      )
    }

    setFilteredLawyers(filtered)
  }, [lawyers, searchQuery, selectedLocation, selectedPracticeAreas])

  const practiceAreaOptions = useMemo(() => {
    const unique = new Set<string>()
    lawyers.forEach((lawyer) => {
      lawyer.specialization.forEach((area) => {
        if (area) unique.add(area)
      })
    })
    return Array.from(unique).sort()
  }, [lawyers])

  const locationOptions = useMemo(() => {
    const unique = new Set<string>()
    lawyers.forEach((lawyer) => {
      if (lawyer.location) {
        unique.add(lawyer.location)
      }
    })
    return Array.from(unique).sort()
  }, [lawyers])

  const handlePracticeAreaChange = (area: string, checked: boolean) => {
    setSelectedPracticeAreas((prev) => (checked ? [...prev, area] : prev.filter((a) => a !== area)))
  }

  const handleOpenProposeDialog = (lawyer: Lawyer) => {
    setSelectedLawyerForProposal(lawyer)
    setSelectedCaseId("")
    setProposalError(null)
    setProposalSuccess(null)
    setIsProposeDialogOpen(true)
  }

  const handleCloseProposeDialog = () => {
    setIsProposeDialogOpen(false)
    setSelectedLawyerForProposal(null)
    setSelectedCaseId("")
    setProposalError(null)
    setProposalSuccess(null)
  }

  const handleSendProposal = async () => {
    if (!selectedLawyerForProposal) {
      setProposalError("Please select a lawyer before sending a request.")
      return
    }

    if (!selectedCaseId) {
      setProposalError("Please select one of your cases to share.")
      return
    }

    setIsSendingProposal(true)
    setProposalError(null)
    setProposalSuccess(null)
    try {
      const response = await fetch("/api/case-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caseId: selectedCaseId,
          lawyerId: selectedLawyerForProposal.id,
        }),
      })

      const body = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(body?.error ?? "Failed to send request. Please try again.")
      }

      setProposalSuccess("Case request sent successfully!")
      setTimeout(() => {
        handleCloseProposeDialog()
      }, 1200)
    } catch (err) {
      console.error("Failed to send case request:", err)
      setProposalError(err instanceof Error ? err.message : "Failed to send request.")
    } finally {
      setIsSendingProposal(false)
    }
  }

  if (selectedLawyer) {
    return <LawyerProfile lawyer={selectedLawyer} onBack={() => setSelectedLawyer(null)} showContactInfo={false} />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-accent" />
              Find Lawyers
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search by name, practice area, or expertise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 gap-4 rounded-lg bg-muted/20 p-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Location</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    {locationOptions.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Practice Areas</Label>
                <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border border-border/70 p-2">
                  {practiceAreaOptions.length === 0 && (
                    <p className="text-xs text-muted-foreground">No practice areas recorded yet.</p>
                  )}
                  {practiceAreaOptions.map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={area}
                        checked={selectedPracticeAreas.includes(area)}
                        onCheckedChange={(checked) => handlePracticeAreaChange(area, checked === true)}
                      />
                      <Label htmlFor={area} className="text-xs">
                        {area}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive/60 bg-destructive/5">
          <CardContent className="py-3 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading lawyers from Supabase…
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredLawyers.map((lawyer) => (
              <Card key={lawyer.id} className="cursor-pointer transition-shadow hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={lawyer.photo || "/placeholder.svg"} alt={lawyer.name} />
                      <AvatarFallback>
                        {lawyer.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="truncate text-lg font-semibold">{lawyer.name}</h3>
                        <Badge
                          variant={
                            lawyer.availability === "available"
                              ? "default"
                              : lawyer.availability === "busy"
                                ? "secondary"
                                : "outline"
                          }
                          className={cn(
                            "text-xs capitalize",
                            lawyer.availability === "available" && "bg-green-100 text-green-800",
                            lawyer.availability === "busy" && "bg-gray-100 text-gray-800",
                            lawyer.availability === "unavailable" && "bg-red-100 text-red-800",
                          )}
                        >
                          {lawyer.availability}
                        </Badge>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{lawyer.location}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="line-clamp-2 text-sm text-muted-foreground">{lawyer.tagline}</p>

                  <div className="flex flex-wrap gap-1">
                    {lawyer.specialization.slice(0, 3).map((spec) => (
                      <Badge key={spec} variant="outline" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                    {lawyer.specialization.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{lawyer.specialization.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <GraduationCap className="mr-1 h-3 w-3" />
                    <span>{lawyer.experience}y experience</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1" onClick={() => setSelectedLawyer(lawyer)}>
                      View Profile
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-accent hover:bg-accent/90"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleOpenProposeDialog(lawyer)
                      }}
                    >
                      Propose (5 Tokens)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredLawyers.length === 0 && !error && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-medium">No lawyers found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria or filters.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Dialog open={isProposeDialogOpen} onOpenChange={(open) => (open ? setIsProposeDialogOpen(true) : handleCloseProposeDialog())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Case Request</DialogTitle>
            <DialogDescription>
              Share one of your cases with{" "}
              <span className="font-semibold">{selectedLawyerForProposal?.name ?? "the selected lawyer"}</span>.
            </DialogDescription>
          </DialogHeader>

          {isLoadingUserCases ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading your cases...
            </div>
          ) : userCases.length === 0 ? (
            <div className="rounded-md border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
              You don’t have any cases yet. Please create a case before sending a request to a lawyer.
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="case-select">Select a case</Label>
              <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                <SelectTrigger id="case-select" className="w-full">
                  <SelectValue placeholder="Choose one of your cases" />
                </SelectTrigger>
                <SelectContent>
                  {userCases.map((caseItem) => (
                    <SelectItem key={caseItem.id} value={caseItem.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{caseItem.caseTitle}</span>
                        <span className="text-xs text-muted-foreground">
                          #{caseItem.caseNumber} • {caseItem.status ?? "pending"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Sending a request costs 5 tokens. Tokens will be deducted only if the request is submitted successfully.
          </p>

          {proposalError && <p className="text-sm text-destructive">{proposalError}</p>}
          {proposalSuccess && <p className="text-sm text-green-600">{proposalSuccess}</p>}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCloseProposeDialog} disabled={isSendingProposal}>
              Cancel
            </Button>
            <Button
              onClick={handleSendProposal}
              disabled={isSendingProposal || userCases.length === 0 || !selectedCaseId}
            >
              {isSendingProposal ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
