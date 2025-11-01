"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Phone, MapPin, Calendar, Crown, Bell, Shield, Download, Star } from "lucide-react"

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

export function ProfileSection() {
  const [user, setUser] = useState<UserProfile>(mockUser)
  const [isEditing, setIsEditing] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  })

  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tab = urlParams.get("tab")
    if (tab === "subscription") {
      setActiveTab("subscription")
    }
  }, [])

  const handleSave = () => {
    setIsEditing(false)
    // Save user data
  }

  const handleUpgrade = (plan: string) => {
    // Handle subscription upgrade
    console.log(`Upgrading to ${plan}`)
  }

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
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and profile information</CardDescription>
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
                  <Button variant="outline" size="sm">
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              {/* Profile Form */}
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

              <div className="flex justify-end gap-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Stats */}
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
