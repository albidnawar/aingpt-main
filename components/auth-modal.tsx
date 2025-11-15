"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { X, Loader2 } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (userType: "user" | "lawyer") => void
}

export function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [userType, setUserType] = useState<"user" | "lawyer">("user")
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
  const [loginData, setLoginData] = useState({
    emailOrLawyerId: "",
    password: "",
  })

  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })

  const [lawyerSignupData, setLawyerSignupData] = useState({
    lawyerId: "",
    type: "",
    cellPhone: "",
    email: "",
    chamberAddress: "",
    yearsOfExperience: "",
    lawPracticingPlace: "",
    consultationFee: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUserLogin = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginData.emailOrLawyerId, password: loginData.password }),
      })
      const body = await response.json()
      if (!response.ok) {
        setError(body.error ?? "Login failed. Please check your credentials.")
        return
      }
      onLogin("user")
      onClose()
    } catch (err) {
      setError("Unexpected error occurred while logging in.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLawyerLogin = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch("/api/auth/lawyer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: loginData.emailOrLawyerId,
          password: loginData.password,
        }),
      })
      const body = await response.json()
      if (!response.ok) {
        setError(body.error ?? "Login failed. Please check your credentials.")
        return
      }
      onLogin("lawyer")
      onClose()
    } catch (err) {
      setError("Unexpected error occurred while logging in.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUserSignup = async () => {
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (!signupData.agreeToTerms) {
      setError("Please agree to the Terms & Conditions.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupData.email,
          password: signupData.password,
          username: signupData.fullName,
        }),
      })
      const body = await response.json()
      if (!response.ok) {
        if (typeof body.error === "string" && body.error.toLowerCase().includes("registered")) {
          setError("An account with this email already exists. Please log in instead.")
        } else {
          setError(body.error ?? "Signup failed. Please try again.")
        }
        return
      }
      onLogin("user")
      onClose()
    } catch (err) {
      setError("Unexpected error occurred while signing up.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLawyerSignupRequest = async () => {
    if (lawyerSignupData.password !== lawyerSignupData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (!lawyerSignupData.agreeToTerms) {
      setError("Please agree to the Terms & Conditions.")
      return
    }
    if (!lawyerSignupData.type) {
      setError("Please select a lawyer type.")
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch("/api/auth/lawyer/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lawyerId: lawyerSignupData.lawyerId,
          type: lawyerSignupData.type,
          cellPhone: lawyerSignupData.cellPhone,
          email: lawyerSignupData.email,
          chamberAddress: lawyerSignupData.chamberAddress,
          yearsOfExperience: lawyerSignupData.yearsOfExperience,
          lawPracticingPlace: lawyerSignupData.lawPracticingPlace,
          consultationFee: lawyerSignupData.consultationFee,
          password: lawyerSignupData.password,
        }),
      })
      const body = await response.json()
      if (!response.ok) {
        setError(body.error ?? "Signup failed. Please try again.")
        return
      }
      onLogin("lawyer")
      onClose()
    } catch (err) {
      setError("Unexpected error occurred while signing up.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (userType === "user") {
      void handleUserLogin()
      return
    }
    void handleLawyerLogin()
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (userType === "user") {
      void handleUserSignup()
      return
    }
    void handleLawyerSignupRequest()
  }

  const handleLawyerSignup = (e: React.FormEvent) => {
    e.preventDefault()
    void handleLawyerSignupRequest()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        {isSubmitting && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-lg">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {activeTab === "login" ? "Logging in..." : "Signing up..."}
              </p>
            </div>
          </div>
        )}
        <Button variant="ghost" size="sm" className="absolute right-2 top-2 z-10" onClick={onClose} disabled={isSubmitting}>
          <X className="h-4 w-4" />
        </Button>

        <CardHeader>
          <CardTitle>Welcome to AinGPT</CardTitle>
          <CardDescription>Access advanced legal AI features and document analysis</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          {/* User Type Selection */}
          <div className="mb-6">
            <Label className="mb-2 block">I am a:</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={userType === "user" ? "default" : "outline"}
                onClick={() => setUserType("user")}
                className="w-full"
                disabled={isSubmitting}
              >
                Normal User
              </Button>
              <Button
                type="button"
                variant={userType === "lawyer" ? "default" : "outline"}
                onClick={() => setUserType("lawyer")}
                className="w-full"
                disabled={isSubmitting}
              >
                Lawyer
              </Button>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full" onValueChange={(value) => setActiveTab(value as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2" disabled={isSubmitting}>
              <TabsTrigger value="login" disabled={isSubmitting}>Login</TabsTrigger>
              <TabsTrigger value="signup" disabled={isSubmitting}>Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">
                    {userType === "lawyer" ? "Lawyer ID or Email" : "Email or Phone"}
                  </Label>
                  <Input
                    id="login-email"
                    type="text"
                    placeholder={userType === "lawyer" ? "Enter your lawyer ID or email" : "Enter your email or phone"}
                    value={loginData.emailOrLawyerId}
                    onChange={(e) => setLoginData({ ...loginData, emailOrLawyerId: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <Button type="button" variant="link" className="p-0 h-auto text-sm">
                  Forgot Password?
                </Button>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm">
                  Google
                </Button>
                <Button variant="outline" size="sm">
                  Facebook
                </Button>
                <Button variant="outline" size="sm">
                  LinkedIn
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              {userType === "user" ? (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      placeholder="Enter your full name"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={signupData.agreeToTerms}
                      onCheckedChange={(checked) => setSignupData({ ...signupData, agreeToTerms: checked as boolean })}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the Terms & Conditions
                    </Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={!signupData.agreeToTerms || isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing up...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLawyerSignup} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lawyer-id">Lawyer ID</Label>
                      <Input
                        id="lawyer-id"
                        placeholder="Enter your lawyer ID"
                        value={lawyerSignupData.lawyerId}
                        onChange={(e) => setLawyerSignupData({ ...lawyerSignupData, lawyerId: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lawyer-type">Type (Civil/Criminal)</Label>
                      <Select
                        value={lawyerSignupData.type}
                        onValueChange={(value) => setLawyerSignupData({ ...lawyerSignupData, type: value })}
                      >
                        <SelectTrigger id="lawyer-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Civil">Civil</SelectItem>
                          <SelectItem value="Criminal">Criminal</SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lawyer-cell-phone">Cell Phone</Label>
                      <Input
                        id="lawyer-cell-phone"
                        type="tel"
                        placeholder="Enter your cell phone"
                        value={lawyerSignupData.cellPhone}
                        onChange={(e) => setLawyerSignupData({ ...lawyerSignupData, cellPhone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lawyer-email">Email</Label>
                      <Input
                        id="lawyer-email"
                        type="email"
                        placeholder="Enter your email"
                        value={lawyerSignupData.email}
                        onChange={(e) => setLawyerSignupData({ ...lawyerSignupData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="lawyer-chamber-address">Chamber Address</Label>
                      <Textarea
                        id="lawyer-chamber-address"
                        placeholder="Enter your chamber address"
                        value={lawyerSignupData.chamberAddress}
                        onChange={(e) => setLawyerSignupData({ ...lawyerSignupData, chamberAddress: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lawyer-experience">Years of Experience</Label>
                      <Input
                        id="lawyer-experience"
                        type="number"
                        placeholder="Enter years of experience"
                        value={lawyerSignupData.yearsOfExperience}
                        onChange={(e) =>
                          setLawyerSignupData({ ...lawyerSignupData, yearsOfExperience: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lawyer-practicing-place">Law Practicing Place</Label>
                      <Input
                        id="lawyer-practicing-place"
                        placeholder="Enter practicing place"
                        value={lawyerSignupData.lawPracticingPlace}
                        onChange={(e) =>
                          setLawyerSignupData({ ...lawyerSignupData, lawPracticingPlace: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lawyer-consultation-fee">Consultation Fee</Label>
                      <Input
                        id="lawyer-consultation-fee"
                        type="number"
                        placeholder="Enter consultation fee (৳)"
                        value={lawyerSignupData.consultationFee}
                        onChange={(e) =>
                          setLawyerSignupData({ ...lawyerSignupData, consultationFee: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lawyer-password">Password</Label>
                      <Input
                        id="lawyer-password"
                        type="password"
                        placeholder="Create a password"
                        value={lawyerSignupData.password}
                        onChange={(e) => setLawyerSignupData({ ...lawyerSignupData, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lawyer-confirm-password">Confirm Password</Label>
                      <Input
                        id="lawyer-confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        value={lawyerSignupData.confirmPassword}
                        onChange={(e) =>
                          setLawyerSignupData({ ...lawyerSignupData, confirmPassword: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lawyer-terms"
                      checked={lawyerSignupData.agreeToTerms}
                      onCheckedChange={(checked) =>
                        setLawyerSignupData({ ...lawyerSignupData, agreeToTerms: checked as boolean })
                      }
                    />
                    <Label htmlFor="lawyer-terms" className="text-sm">
                      I agree to the Terms & Conditions
                    </Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={!lawyerSignupData.agreeToTerms || isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing up...
                      </>
                    ) : (
                      "Sign Up as Lawyer"
                    )}
                  </Button>
                </form>
              )}

              <div className="relative mt-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm">
                  Google
                </Button>
                <Button variant="outline" size="sm">
                  Facebook
                </Button>
                <Button variant="outline" size="sm">
                  LinkedIn
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
