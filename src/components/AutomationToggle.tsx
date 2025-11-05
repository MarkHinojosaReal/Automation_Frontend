import React, { useState } from 'react'
import { ConfirmationModal } from './ConfirmationModal'

interface AutomationToggleProps {
  id: string
  name: string
  platform?: string | null
  initiative?: string | null
  isActive: boolean
  onToggle: (id: string, newValue: boolean) => Promise<void>
}

export const AutomationToggle: React.FC<AutomationToggleProps> = ({
  id,
  name,
  platform,
  initiative,
  isActive,
  onToggle,
}) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleToggleClick = () => {
    setShowConfirmation(true)
  }

  const handleConfirm = async () => {
    setIsUpdating(true)
    try {
      await onToggle(id, !isActive)
      setShowConfirmation(false)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = () => {
    setShowConfirmation(false)
  }

  return (
    <>
      <ConfirmationModal
        isOpen={showConfirmation}
        title={isActive ? 'Deactivate Automation?' : 'Activate Automation?'}
        message={`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} "${name}"? This will affect production systems immediately.`}
        confirmText={isActive ? 'Deactivate' : 'Activate'}
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isLoading={isUpdating}
      />
      
      <div className="bg-white rounded-lg border border-breeze-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900">{name}</h3>
            <div className="flex gap-2 mt-1">
              {platform && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {platform}
                </span>
              )}
              {initiative && (
                <span className="text-xs text-breeze-600 bg-breeze-50 px-2 py-0.5 rounded">
                  {initiative}
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={handleToggleClick}
            disabled={isUpdating}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full
            transition-colors duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-breeze-500 focus:ring-offset-2
            ${isActive ? 'bg-breeze-600' : 'bg-gray-200'}
            ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          aria-label={`Toggle ${name}`}
          aria-pressed={isActive}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white
              transition-transform duration-200 ease-in-out
              ${isActive ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
      
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span className={`font-medium ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
            {isActive ? '✓ Active' : '○ Inactive'}
          </span>
          {isUpdating && (
            <span className="text-breeze-600 animate-pulse">Updating...</span>
          )}
        </div>
      </div>
    </>
  )
}

