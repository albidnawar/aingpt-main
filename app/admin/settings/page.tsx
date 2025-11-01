"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Lock, Palette } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Configure admin panel and platform settings</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette size={20} />
            General Settings
          </CardTitle>
          <CardDescription>Basic platform configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Platform Name</label>
            <Input placeholder="AinGPT" defaultValue="AinGPT" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Support Email</label>
            <Input placeholder="support@aingpt.com" defaultValue="support@aingpt.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Support Phone</label>
            <Input placeholder="+1 (555) 000-0000" defaultValue="+1 (555) 000-0000" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={20} />
            Notifications
          </CardTitle>
          <CardDescription>Configure notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "New user registrations", checked: true },
            { label: "New lawyer applications", checked: true },
            { label: "Content uploads", checked: false },
            { label: "System alerts", checked: true },
          ].map((item) => (
            <label key={item.label} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked={item.checked} className="w-4 h-4 rounded border-input" />
              <span className="text-foreground">{item.label}</span>
            </label>
          ))}
          <Button>Save Preferences</Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock size={20} />
            Security
          </CardTitle>
          <CardDescription>Manage security and access control</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Current Password</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">New Password</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Confirm Password</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button>Update Password</Button>
        </CardContent>
      </Card>
    </div>
  )
}
