"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Phone, MapPin, Calendar, Crown, Bell, Shield, Download, Star, Loader2, ZoomIn, ZoomOut, Move } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface UserProfile {
  name: string
  email: string
  phone: string
  location: string
  joinDate: string
  subscription: "Free" | "Bronze" | "Gold"
  avatar?: string
  bio?: string
}

interface LawyerCaseDetail {
  policeStation: string
  district: string
  caseNumber: string
  lawNameAndSection: string
  filingDate: string
  yearlyNumber: string
  crimeTitle: string
}

interface LawyerEducationDetail {
  degree: string
  institution: string
  year: string
}

interface LawyerProfessionalDetails {
  educationDetails: LawyerEducationDetail[]
  currentCases: LawyerCaseDetail[]
  significantCases: LawyerCaseDetail[]
}

const emptyCase: LawyerCaseDetail = {
  policeStation: "",
  district: "",
  caseNumber: "",
  lawNameAndSection: "",
  filingDate: "",
  yearlyNumber: "",
  crimeTitle: "",
}

const emptyEducation: LawyerEducationDetail = {
  degree: "",
  institution: "",
  year: "",
}

interface ProfileSectionProps {
  variant?: "user" | "lawyer"
}

const mockUser: UserProfile = {
  name: "Ahmed Rahman",
  email: "ahmed.rahman@email.com",
  phone: "+880 1712-345678",
  location: "Dhaka, Bangladesh",
  joinDate: "January 2024",
  subscription: "Bronze",
  bio: "Law student at Dhaka University, interested in constitutional and corporate law.",
}

const subscriptionPlans = [
  {
    name: "Free",
    price: 0,
    features: [
      "Basic AI chat (10 messages/day)",
      "Access to public legal resources",
      "Basic lawyer directory",
      "Community forum access",
    ],
    limitations: ["Limited daily messages", "No document analysis", "No priority support"],
  },
  {
    name: "Bronze",
    price: 500,
    features: [
      "Unlimited AI chat",
      "Document analysis (5 docs/month)",
      "Advanced lawyer search",
      "Priority email support",
      "Legal templates access",
      "Case law database",
    ],
    popular: true,
  },
  {
    name: "Gold",
    price: 1000,
    features: [
      "Everything in Bronze",
      "Unlimited document analysis",
      "Direct lawyer consultation booking",
      "24/7 priority support",
      "Advanced legal research tools",
      "Custom legal document generation",
      "Video consultation access",
    ],
  },
]

export function ProfileSection({ variant = "user" }: ProfileSectionProps) {
  const [user, setUser] = useState<UserProfile>(mockUser)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  })
  const [lawyerDetails, setLawyerDetails] = useState<LawyerProfessionalDetails>({
    educationDetails: [
      { degree: "LL.B (Hons)", institution: "University of Dhaka", year: "2015" },
      { degree: "LL.M", institution: "London School of Economics", year: "2017" },
    ],
    currentCases: [
      {
        policeStation: "Gulshan Police Station",
        district: "Dhaka",
        caseNumber: "2024/PS/001",
        lawNameAndSection: "Property Law - Section 5",
        filingDate: "2024-01-15",
        yearlyNumber: "2024-001",
        crimeTitle: "Property boundary dispute",
      },
    ],
    significantCases: [
      {
        policeStation: "Dhanmondi Police Station",
        district: "Dhaka",
        caseNumber: "2023/PS/015",
        lawNameAndSection: "Civil Law - Section 10",
        filingDate: "2023-03-20",
        yearlyNumber: "2023-115",
        crimeTitle: "Rahman vs Rahman - Property dispute settlement",
      },
      {
        policeStation: "Motijheel Police Station",
        district: "Dhaka",
        caseNumber: "2022/PS/042",
        lawNameAndSection: "Corporate Law - Section 18B",
        filingDate: "2022-07-11",
        yearlyNumber: "2022-390",
        crimeTitle: "ABC Corp vs X Industries - Corporate litigation",
      },
      {
        policeStation: "Kotwali Police Station",
        district: "Dhaka",
        caseNumber: "2021/PS/098",
        lawNameAndSection: "Criminal Law - Section 302",
        filingDate: "2021-11-05",
        yearlyNumber: "2021-512",
        crimeTitle: "State vs Karim - Criminal defense",
      },
    ],
  })

  const [activeTab, setActiveTab] = useState("profile")

  // Fetch user data from Supabase
  useEffect(() => {
    if (variant === "user") {
      const fetchUserData = async () => {
        try {
          setIsLoading(true)
          setError(null)
          const supabase = createSupabaseBrowserClient()
          const {
            data: { session },
          } = await supabase.auth.getSession()

          if (!session?.user) {
            setError("Please log in to view your profile")
            setIsLoading(false)
            return
          }

          // Get user_id from users table
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("auth_user_id", session.user.id)
            .maybeSingle()

          if (userError) {
            console.error("Error fetching user data:", userError)
            setError("Failed to load profile data")
            setIsLoading(false)
            return
          }

          if (userData) {
            // Map database fields to UI state
            setUser({
              name: userData.full_name || userData.username || "",
              email: userData.email || "",
              phone: userData.phone || "",
              location: userData.location || "",
              joinDate: "Recently", // Users table doesn't have created_at, can be added later if needed
              subscription: (userData.subscription_plan as "Free" | "Bronze" | "Gold") || "Free",
              avatar: userData.avatar_url || undefined,
              bio: userData.bio || "",
            })
          }
        } catch (err) {
          console.error("Error fetching user data:", err)
          setError("Failed to load profile data")
        } finally {
          setIsLoading(false)
        }
      }

      fetchUserData()
    } else {
      setIsLoading(false)
    }
  }, [variant])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get("tab")
    if (tab === "subscription") {
      setActiveTab("subscription")
    }
  }, [])

  const handleSave = async () => {
    if (variant !== "user") {
      setIsEditing(false)
      return
    }

    try {
      setIsSaving(true)
      setError(null)
      const supabase = createSupabaseBrowserClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        setError("Please log in to save your profile")
        setIsSaving(false)
        return
      }

      // Get user_id from users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .maybeSingle()

      if (userError || !userData) {
        setError("User not found")
        setIsSaving(false)
        return
      }

      // Update user data in Supabase
      const { error: updateError } = await supabase
        .from("users")
        .update({
          full_name: user.name,
          email: user.email,
          phone: user.phone || null,
          location: user.location || null,
          bio: user.bio || null,
          avatar_url: user.avatar || null,
        })
        .eq("id", userData.id)

      if (updateError) {
        console.error("Error updating user data:", updateError)
        setError("Failed to save profile. Please try again.")
        setIsSaving(false)
        return
      }

      setIsEditing(false)
      // Show success message (you can add a toast notification here)
    } catch (err) {
      console.error("Error saving user data:", err)
      setError("Failed to save profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpgrade = (plan: string) => {
    // Handle subscription upgrade
    console.log(`Upgrading to ${plan}`)
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.')
      return
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      setError('File size exceeds 2MB limit.')
      return
    }

    // Create preview URL and open crop dialog
    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string)
      setImageFile(file)
      setZoom(1)
      setPosition({ x: 0, y: 0 })
      setIsCropDialogOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const handleCropAndUpload = async () => {
    if (!selectedImage || !imageFile) return

    try {
      setIsUploadingAvatar(true)
      setError(null)

      // Create canvas for cropping
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Failed to get canvas context')

      const img = new Image()
      img.src = selectedImage

      await new Promise((resolve, reject) => {
        img.onload = () => {
          const cropSize = 400 // Final output size (square)
          const cropDiameter = 300 // Visible crop circle diameter in preview
          canvas.width = cropSize
          canvas.height = cropSize

          // Get actual container and image element dimensions
          const container = containerRef.current
          const displayedImg = imageRef.current
          
          if (!container || !displayedImg) {
            reject(new Error('Container or image not found'))
            return
          }

          // Get container dimensions
          const containerWidth = container.offsetWidth
          const containerHeight = container.offsetHeight
          const containerCenterX = containerWidth / 2
          const containerCenterY = containerHeight / 2
          const cropRadius = cropDiameter / 2

          // Get natural (original) image dimensions
          const naturalWidth = img.naturalWidth || img.width
          const naturalHeight = img.naturalHeight || img.height
          
          // Get the displayed image dimensions (actual rendered size)
          // Note: getBoundingClientRect gives us the transformed size
          const imageRect = displayedImg.getBoundingClientRect()
          const displayedWidth = imageRect.width
          const displayedHeight = imageRect.height
          
          // Calculate scale: from natural to displayed (accounting for zoom)
          // The displayed size already includes the zoom transform
          const scaleX = displayedWidth / naturalWidth
          const scaleY = displayedHeight / naturalHeight
          // Since we use object-contain, the scale is uniform
          const totalScale = Math.min(scaleX, scaleY)
          
          // The crop circle is fixed at container center (containerCenterX, containerCenterY)
          // The image is centered at container center, then transformed by translate(position) scale(zoom)
          // So the image center after transform is at (containerCenterX + position.x, containerCenterY + position.y)
          
          // To find what part of the original image is at the crop center:
          // 1. Find the offset from image center to crop center (in container coordinates)
          const offsetFromImageCenterX = -position.x  // Crop is at container center, image moved by position.x
          const offsetFromImageCenterY = -position.y
          
          // 2. Convert this offset to original image coordinates
          const offsetInOriginalX = offsetFromImageCenterX / totalScale
          const offsetInOriginalY = offsetFromImageCenterY / totalScale
          
          // 3. The image center in original coordinates
          const imageCenterOriginalX = naturalWidth / 2
          const imageCenterOriginalY = naturalHeight / 2
          
          // 4. The crop center in original coordinates
          const cropCenterOriginalX = imageCenterOriginalX + offsetInOriginalX
          const cropCenterOriginalY = imageCenterOriginalY + offsetInOriginalY
          
          // 5. The crop radius in original coordinates
          const cropRadiusInOriginal = cropRadius / totalScale
          
          // Calculate source rectangle
          const sourceX = cropCenterOriginalX - cropRadiusInOriginal
          const sourceY = cropCenterOriginalY - cropRadiusInOriginal
          const sourceSize = cropRadiusInOriginal * 2

          // Clamp to image bounds
          const clampedSourceX = Math.max(0, Math.min(sourceX, naturalWidth - sourceSize))
          const clampedSourceY = Math.max(0, Math.min(sourceY, naturalHeight - sourceSize))
          const clampedSourceSize = Math.min(
            sourceSize,
            naturalWidth - clampedSourceX,
            naturalHeight - clampedSourceY
          )

          // Draw with circular clipping
          ctx.save()
          ctx.beginPath()
          ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, 2 * Math.PI)
          ctx.clip()

          // Draw the cropped portion, scaled to fill the output
          ctx.drawImage(
            img,
            clampedSourceX,
            clampedSourceY,
            clampedSourceSize,
            clampedSourceSize,
            0,
            0,
            cropSize,
            cropSize
          )
          ctx.restore()
          
          resolve(null)
        }
        img.onerror = reject
      })

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError('Failed to process image')
          setIsUploadingAvatar(false)
          return
        }

        // Create file from blob
        const croppedFile = new File([blob], imageFile.name, { type: imageFile.type })

        const formData = new FormData()
        formData.append('file', croppedFile)

        const response = await fetch('/api/profile/avatar', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to upload avatar')
        }

        // Update user state with new avatar URL
        setUser({ ...user, avatar: data.url })
        setIsCropDialogOpen(false)
        setSelectedImage(null)
        setImageFile(null)
      }, imageFile.type, 0.9)
    } catch (err) {
      console.error('Error uploading avatar:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload avatar. Please try again.')
    } finally {
      setIsUploadingAvatar(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleChangePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handleCaseChange = (
    listKey: "currentCases" | "significantCases",
    index: number,
    field: keyof LawyerCaseDetail,
    value: string,
  ) => {
    const updatedList = [...lawyerDetails[listKey]]
    updatedList[index] = { ...updatedList[index], [field]: value }
    setLawyerDetails({ ...lawyerDetails, [listKey]: updatedList })
  }

  const addNewCase = (listKey: "currentCases" | "significantCases") => {
    setLawyerDetails({
      ...lawyerDetails,
      [listKey]: [...lawyerDetails[listKey], { ...emptyCase }],
    })
  }

  const removeCase = (listKey: "currentCases" | "significantCases", index: number) => {
    const updatedList = [...lawyerDetails[listKey]]
    updatedList.splice(index, 1)
    setLawyerDetails({ ...lawyerDetails, [listKey]: updatedList })
  }

  const handleEducationChange = (
    index: number,
    field: keyof LawyerEducationDetail,
    value: string,
  ) => {
    const updated = [...lawyerDetails.educationDetails]
    updated[index] = { ...updated[index], [field]: value }
    setLawyerDetails({ ...lawyerDetails, educationDetails: updated })
  }

  const addNewEducation = () => {
    setLawyerDetails({
      ...lawyerDetails,
      educationDetails: [...lawyerDetails.educationDetails, { ...emptyEducation }],
    })
  }

  const removeEducation = (index: number) => {
    const updated = [...lawyerDetails.educationDetails]
    updated.splice(index, 1)
    setLawyerDetails({ ...lawyerDetails, educationDetails: updated })
  }

  const renderCaseInputs = (
    cases: LawyerCaseDetail[],
    listKey: "currentCases" | "significantCases",
    heading: string,
    description: string,
    addLabel: string,
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-md font-semibold">{heading}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {isEditing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addNewCase(listKey)}
            className="bg-transparent"
          >
            {addLabel}
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {cases.map((caseItem, index) => (
          <div
            key={`${listKey}-${index}`}
            className="rounded-lg border border-border p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-semibold text-muted-foreground">Case {index + 1}</h5>
              {isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCase(listKey, index)}
                  className="text-destructive hover:text-destructive"
                >
                  Remove
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Police Station</Label>
              <Input
                value={caseItem.policeStation}
                onChange={(e) => handleCaseChange(listKey, index, "policeStation", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>District</Label>
              <Input
                value={caseItem.district}
                onChange={(e) => handleCaseChange(listKey, index, "district", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Case Number</Label>
              <Input
                value={caseItem.caseNumber}
                onChange={(e) => handleCaseChange(listKey, index, "caseNumber", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Law Name & Section</Label>
              <Input
                value={caseItem.lawNameAndSection}
                onChange={(e) =>
                  handleCaseChange(listKey, index, "lawNameAndSection", e.target.value)
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Filing Date</Label>
              <Input
                type="date"
                value={caseItem.filingDate}
                onChange={(e) => handleCaseChange(listKey, index, "filingDate", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label>Yearly Number</Label>
              <Input
                value={caseItem.yearlyNumber}
                onChange={(e) => handleCaseChange(listKey, index, "yearlyNumber", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Crime Title</Label>
              <Input
                value={caseItem.crimeTitle}
                onChange={(e) => handleCaseChange(listKey, index, "crimeTitle", e.target.value)}
                disabled={!isEditing}
              />
            </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account and subscription</p>
        </div>
        <Badge
          variant={user.subscription === "Gold" ? "default" : user.subscription === "Bronze" ? "secondary" : "outline"}
          className="flex items-center gap-1"
        >
          <Crown className="h-3 w-3" />
          {user.subscription} Plan
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading profile...</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
            <CardHeader>
              <CardTitle>Profile & Professional Information</CardTitle>
              <CardDescription>
                {variant === "lawyer"
                  ? "Update your personal details, professional background, and notable cases"
                  : "Update your personal details and profile information"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={isUploadingAvatar || variant !== "user"}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleChangePhotoClick}
                    disabled={isUploadingAvatar || variant !== "user"}
                  >
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Change Photo"
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG, GIF or WEBP. Max size 2MB.</p>
                </div>
              </div>

              {/* Avatar Crop Dialog */}
              <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Adjust Avatar</DialogTitle>
                    <DialogDescription>
                      Drag to reposition and use the slider to zoom in/out
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Image Container */}
                    <div
                      ref={containerRef}
                      className="relative w-full h-96 bg-muted rounded-lg overflow-hidden border-2 border-border"
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      <div
                        className="absolute inset-0 flex items-center justify-center cursor-move"
                        style={{
                          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                        }}
                        onMouseDown={handleMouseDown}
                      >
                        {selectedImage && (
                          <img
                            ref={imageRef}
                            src={selectedImage}
                            alt="Preview"
                            className="max-w-full max-h-full w-auto h-auto select-none object-contain"
                            style={{ minWidth: '100%', minHeight: '100%' }}
                            draggable={false}
                            onLoad={() => {
                              // Reset position when image loads
                              if (imageRef.current) {
                                const img = imageRef.current
                                const container = containerRef.current
                                if (container) {
                                  // Center the image initially
                                  setPosition({ x: 0, y: 0 })
                                }
                              }
                            }}
                          />
                        )}
                      </div>
                      {/* Crop Overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 bg-black/50" />
                        <div
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-white rounded-full shadow-lg"
                          style={{ width: '300px', height: '300px' }}
                        />
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <ZoomIn className="h-4 w-4" />
                            Zoom: {Math.round(zoom * 100)}%
                          </Label>
                        </div>
                        <div className="flex items-center gap-4">
                          <ZoomOut className="h-4 w-4 text-muted-foreground" />
                          <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                          <ZoomIn className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Move className="h-4 w-4" />
                        <span>Click and drag the image to reposition</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCropDialogOpen(false)
                          setSelectedImage(null)
                          setImageFile(null)
                          setZoom(1)
                          setPosition({ x: 0, y: 0 })
                        }}
                        disabled={isUploadingAvatar}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCropAndUpload}
                        disabled={isUploadingAvatar}
                      >
                        {isUploadingAvatar ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Save Avatar"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Personal Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep your contact details up to date
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={user.name}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={user.phone}
                        onChange={(e) => setUser({ ...user, phone: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={user.location}
                        onChange={(e) => setUser({ ...user, location: e.target.value })}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={user.bio}
                    onChange={(e) => setUser({ ...user, bio: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </div>

              {/* Professional Details for Lawyer */}
              {variant === "lawyer" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Professional Details</h3>
                    <p className="text-sm text-muted-foreground">
                      Highlight your qualifications and key cases
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Educational Details</Label>
                        <p className="text-sm text-muted-foreground">
                          List your academic qualifications
                        </p>
                      </div>
                      {isEditing && (
                        <Button type="button" variant="outline" size="sm" onClick={addNewEducation}>
                          Add Education
                        </Button>
                      )}
                    </div>
                    <div className="space-y-4">
                      {lawyerDetails.educationDetails.map((education, index) => (
                        <div
                          key={`education-${index}`}
                          className="rounded-lg border border-border p-4 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-semibold text-muted-foreground">
                              Education {index + 1}
                            </h5>
                            {isEditing && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEducation(index)}
                                className="text-destructive hover:text-destructive"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Degree</Label>
                              <Input
                                value={education.degree}
                                onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                                disabled={!isEditing}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Institution</Label>
                              <Input
                                value={education.institution}
                                onChange={(e) =>
                                  handleEducationChange(index, "institution", e.target.value)
                                }
                                disabled={!isEditing}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Year</Label>
                              <Input
                                value={education.year}
                                onChange={(e) => handleEducationChange(index, "year", e.target.value)}
                                disabled={!isEditing}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {renderCaseInputs(
                    lawyerDetails.currentCases,
                    "currentCases",
                    "Current Handle Cases",
                    "Provide details of the cases you are currently managing",
                    "Add Current Case",
                  )}
                  {renderCaseInputs(
                    lawyerDetails.significantCases,
                    "significantCases",
                    "Significant Cases Handled",
                    "List notable cases you have successfully handled",
                    "Add Significant Case",
                  )}
                </div>
              )}

              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              <div className="flex justify-end gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        setError(null)
                      }}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} disabled={isLoading}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          )}

          {/* Account Stats */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-accent" />
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-xs text-muted-foreground">{user.joinDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-accent" />
                  <div>
                    <p className="text-sm font-medium">Messages Sent</p>
                    <p className="text-xs text-muted-foreground">1,247 total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-accent" />
                  <div>
                    <p className="text-sm font-medium">Documents Analyzed</p>
                    <p className="text-xs text-muted-foreground">23 this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          )}
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>Manage your subscription and billing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <Crown className="h-8 w-8 text-accent" />
                  <div>
                    <h3 className="font-semibold">{user.subscription} Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      {user.subscription === "Free"
                        ? "Free forever"
                        : `৳${subscriptionPlans.find((p) => p.name === user.subscription)?.price}/month`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Next billing</p>
                  <p className="font-medium">February 15, 2024</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Services Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Services Pricing</CardTitle>
              <CardDescription>One-time costs for specific services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">File a Case</h3>
                  <p className="text-2xl font-bold text-accent mb-2">৳100</p>
                  <p className="text-sm text-muted-foreground">
                    Per case filing. Upload documents and connect with lawyers.
                  </p>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Proposal Tokens</h3>
                  <p className="text-2xl font-bold text-accent mb-2">৳10/token</p>
                  <p className="text-sm text-muted-foreground">
                    5 tokens required per lawyer proposal (৳50 per lawyer)
                  </p>
                </div>
              </div>
              <Button size="sm" className="w-full bg-accent hover:bg-accent/90">
                Buy Tokens Now
              </Button>
            </CardContent>
          </Card>

          {/* Subscription Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? "border-accent" : ""}`}>
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    ৳{plan.price}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {plan.limitations && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Limitations:</p>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="text-xs text-muted-foreground">
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Button
                    className="w-full"
                    variant={user.subscription === plan.name ? "outline" : "default"}
                    onClick={() => handleUpgrade(plan.name)}
                    disabled={user.subscription === plan.name}
                  >
                    {user.subscription === plan.name ? "Current Plan" : `Upgrade to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>Manage your privacy and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Shield className="h-4 w-4 mr-2" />
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Download My Data
              </Button>
              <Button variant="destructive" className="w-full justify-start">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent interactions and usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Document analyzed", details: "Contract review completed", time: "2 hours ago" },
                  { action: "Chat session", details: "Asked about property law", time: "5 hours ago" },
                  { action: "Lawyer contacted", details: "Sent message to Advocate Rahman", time: "1 day ago" },
                  { action: "Video watched", details: "Constitutional Rights in Bangladesh", time: "2 days ago" },
                  { action: "Profile updated", details: "Changed contact information", time: "1 week ago" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.details}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
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
