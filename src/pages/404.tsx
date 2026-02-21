import React from "react"
import { Link } from "react-router-dom"
import { Layout } from "../components/Layout"
import { Home, ArrowLeft } from "lucide-react"

function NotFoundPage() {
  return (
    <Layout title="Page Not Found">
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl font-bold text-gray-400">404</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Link to="/" className="btn-primary flex items-center space-x-2">
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="btn-secondary flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default NotFoundPage

