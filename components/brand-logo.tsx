"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

interface BrandLogoProps {
  size?: number
  className?: string
  imgClassName?: string
  priority?: boolean
}

export function BrandLogo({ size = 32, className, imgClassName, priority = false }: BrandLogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const logoSrc =
    mounted && resolvedTheme === "light" ? "/aingpt-logo-black-01.png" : "/aingpt-logo.png"

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Image
        src={logoSrc}
        alt="AinGPT"
        width={size}
        height={size}
        className={cn("object-contain", imgClassName)}
        priority={priority}
      />
    </div>
  )
}

