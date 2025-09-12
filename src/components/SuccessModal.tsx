import React from "react"
import { CheckCircle2, X } from "lucide-react"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  ticketNumber: string
}

export function SuccessModal({ isOpen, onClose, ticketNumber }: SuccessModalProps) {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md">
        {/* Modal Card */}
        <div className="glass-card border border-white/20 rounded-2xl p-8 text-center shadow-2xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success Icon */}
          <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl animate-pulse" />
          </div>

          {/* Header */}
          <h2 className="text-2xl font-bold text-white mb-2">
            Thank you for submitting an automation request
          </h2>

          {/* Ticket Number */}
          <div className="mb-6">
            <p className="text-white/80 mb-2">Your ticket number is</p>
            <div className="inline-flex items-center px-4 py-2 bg-ocean-500/20 border border-ocean-400/40 rounded-xl">
              <span className="text-ocean-200 font-mono font-semibold text-lg">{ticketNumber}</span>
            </div>
          </div>

          {/* Next Steps */}
          <div className="text-left bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-3 text-center">Next Steps</h3>
            <div className="space-y-2 text-white/80 text-sm">
              <p>• In the upcoming week, your project will be scoped and assigned a priority</p>
              <p>• Once this occurs, a member from the team will reach out to update you on your request</p>
              <p>• You will receive email notifications for any updates</p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <span>Got it, thanks!</span>
          </button>
        </div>
      </div>
    </div>
  )
}