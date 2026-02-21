import React, { useEffect } from 'react'
import { KeyRound } from 'lucide-react'
import { getUserRole } from '../config/permissions'

// Declare Google Identity Services types
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (element: HTMLElement | null, config: any) => void
        }
      }
    }
  }
}

export default function LoginPage() {
  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    script.onload = () => {
      // Initialize Google Sign-In
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '343351208512-9jv72o5eu0b1pqnkmrqitscufjbkk9t9.apps.googleusercontent.com',
          callback: handleCredentialResponse
        })
        
        window.google.accounts.id.renderButton(
          document.getElementById("gsi-button"),
          { 
            theme: "outline", 
            size: "large",
            text: "signin_with",
            shape: "rectangular"
          }
        )
      }
    }

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [])

  const handleCredentialResponse = (response: any) => {
    const idToken = response.credential
    
    const apiUrl = '/api/auth/google'
    
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken: idToken }),
      credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Redirect based on user role
        const userRole = getUserRole(data.user.email)
        if (userRole === 'admin') {
          window.location.href = '/'
        } else {
          window.location.href = '/projects'
        }
      } else {
        showError(data.error || 'Authentication failed')
      }
    })
    .catch(error => {
      console.error('Error:', error)
      showError('Authentication failed. Please try again.')
    })
  }

  const showError = (message: string) => {
    const errorDiv = document.getElementById('error-message')
    if (errorDiv) {
      errorDiv.textContent = message
      errorDiv.style.display = 'block'
    }
  }

  return (
    <div className="min-h-screen bg-breeze-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full mx-4 border border-breeze-100">
        <div className="text-center">
          {/* Key Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-breeze-900 rounded-full p-6 inline-flex items-center justify-center -mt-16 shadow-xl">
              <KeyRound className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
          </div>
          
          <div className="text-3xl font-bold text-breeze-900 mb-2">Login</div>
          <p className="text-sm text-breeze-500 mb-8">Only @therealbrokerage.com accounts are currently supported</p>
          
          <div 
            id="error-message" 
            className="hidden bg-priority-high/10 border border-priority-high/20 text-priority-high px-4 py-3 rounded-lg mb-4 text-sm font-medium"
          >
          </div>
          
          <div className="flex justify-center">
            <div id="gsi-button"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
