"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  side?: "left" | "right" | "top" | "bottom"
  children: React.ReactNode
  className?: string
}

export function Sheet({ open, onOpenChange, side = "right", children, className }: SheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  const sideClasses = {
    left: "left-0 top-0 bottom-0 w-[85vw] max-w-sm",
    right: "right-0 top-0 bottom-0 w-[85vw] max-w-sm",
    top: "top-0 left-0 right-0 h-[85vh] max-h-screen",
    bottom: "bottom-0 left-0 right-0 h-[85vh] max-h-screen",
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={() => onOpenChange(false)}
      />
      {/* Sheet */}
      <div
        className={cn(
          "fixed z-50 bg-card border-border shadow-lg transition-transform duration-300 ease-in-out lg:hidden",
          sideClasses[side],
          side === "left" && (open ? "translate-x-0" : "-translate-x-full"),
          side === "right" && (open ? "translate-x-0" : "translate-x-full"),
          side === "top" && (open ? "translate-y-0" : "-translate-y-full"),
          side === "bottom" && (open ? "translate-y-0" : "translate-y-full"),
          className,
        )}
      >
        {children}
      </div>
    </>
  )
}

interface SheetContentProps {
  children: React.ReactNode
  className?: string
  onClose?: () => void
}

export function SheetContent({ children, className, onClose }: SheetContentProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {onClose && (
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}

