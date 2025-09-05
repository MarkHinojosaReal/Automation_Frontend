import React from "react"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  showRetry?: boolean
}

export function ErrorMessage({ message, onRetry, showRetry = true }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="relative">
        <div className="flex items-center space-x-3 text-red-400">
          <AlertCircle className="w-6 h-6" />
          <span className="font-semibold text-lg">Error</span>
        </div>
        <div className="absolute inset-0 bg-red-400/20 rounded-full blur-xl" />
      </div>
      
      <p className="text-white/70 text-center max-w-md font-medium">{message}</p>
      
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="btn-secondary flex items-center space-x-2 hover:bg-white/20"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  )
}
