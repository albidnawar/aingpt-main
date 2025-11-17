"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Scale,
  MessageCircle,
  FileText,
  Users,
  User,
  Menu,
  X,
  Crown,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Coins,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"

interface LawyerDashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: "Chat",
    href: "/lawyer_dashboard",
    icon: MessageCircle,
    description: "Free AI legal chat",
  },
  {
    name: "Advanced Chat",
    href: "/lawyer_dashboard/advanced-chat",
    icon: FileText,
    description: "Document analysis & tools",
    premium: true,
  },
  {
    name: "Find Cases",
    href: "/lawyer_dashboard/find-cases",
    icon: Search,
    description: "Browse and accept cases",
  },
  {
    name: "My Cases",
    href: "/lawyer_dashboard/my-cases",
    icon: FileText,
    description: "File and manage cases",
  },
  {
    name: "Case Chats",
    href: "/lawyer_dashboard/accepted-cases-chat",
    icon: MessageCircle,
    description: "Chat with accepted lawyers",
  },
  {
    name: "Profile",
    href: "/lawyer_dashboard/profile",
    icon: User,
    description: "Account settings",
  },
]

export function LawyerDashboardLayout({ children }: LawyerDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [tokenBalance, setTokenBalance] = useState<number | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const savedCollapsed = localStorage.getItem("lawyer-sidebar-collapsed")
    if (savedCollapsed) {
      setCollapsed(savedCollapsed === "true")
    }
  }, [])

  // Fetch token balance
  useEffect(() => {
    const fetchTokenBalance = async () => {
      try {
        const supabase = createSupabaseBrowserClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user) {
          return
        }

        const { data: lawyerData, error } = await supabase
          .from("lawyers")
          .select("token_balance")
          .eq("auth_user_id", session.user.id)
          .maybeSingle()

        if (!error && lawyerData) {
          setTokenBalance(lawyerData.token_balance || 0)
        }
      } catch (err) {
        console.error("Error fetching token balance:", err)
      }
    }

    fetchTokenBalance()
  }, [])

  const toggleCollapsed = () => {
    const newCollapsed = !collapsed
    setCollapsed(newCollapsed)
    localStorage.setItem("lawyer-sidebar-collapsed", String(newCollapsed))
  }

  const handleLogout = () => {
    // Clear any authentication data here
    router.push("/")
  }

  const handleUpgrade = () => {
    router.push("/lawyer_dashboard/profile?tab=subscription")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-card border-r border-border transform transition-all duration-200 ease-in-out lg:translate-x-0",
          collapsed ? "w-20" : "w-72",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <Scale className="h-8 w-8 text-accent flex-shrink-0" />
              {!collapsed && <span className="text-xl font-bold text-foreground">AinGPT</span>}
            </div>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="hidden lg:flex justify-end p-2 border-b border-border">
            <Button variant="ghost" size="sm" onClick={toggleCollapsed}>
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    collapsed && "justify-center",
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && (
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{item.name}</span>
                        {item.premium && <Crown className="h-3 w-3 text-accent" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Subscription Status */}
          <div className="p-4 border-t border-border space-y-3 overflow-y-auto">
            {!collapsed ? (
              <>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Current Plan</span>
                    <Badge variant="secondary">Free</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Upgrade for unlimited access and advanced features
                  </p>
                  <Button size="sm" className="w-full bg-accent hover:bg-accent/90" onClick={handleUpgrade}>
                    Upgrade Now
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-muted-foreground hover:text-foreground bg-transparent"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center text-accent hover:text-accent bg-transparent"
                  onClick={handleUpgrade}
                  title="Upgrade"
                >
                  <Crown className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center text-muted-foreground hover:text-foreground bg-transparent"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={cn("transition-all duration-200", collapsed ? "lg:pl-20" : "lg:pl-72")}>
        {/* Top bar */}
        <header className="bg-card border-b border-border px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3 ml-auto">
              <ThemeToggle />
              <Button variant="outline" size="sm" className="gap-2">
                <Coins className="h-4 w-4" />
                <span className="font-medium">{tokenBalance !== null ? tokenBalance : "..."}</span>
              </Button>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}

