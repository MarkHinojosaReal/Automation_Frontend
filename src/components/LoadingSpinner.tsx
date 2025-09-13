import React from "react"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  message?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ message = "Loading...", size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-ocean-400`} />
        <div className="absolute inset-0 bg-ocean-400/20 rounded-full blur-xl animate-pulse" />
      </div>
      <p className="text-breeze-600 text-sm font-medium">{message}</p>
    </div>
  )
}
